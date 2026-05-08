<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

$user = require_login();

if ($user['role'] !== 'club') {
    json_response(false, 'Club account only', [], 403);
}

$data = get_request_data();
$requestId = (int)($data['request_id'] ?? 0);
$clubNote = trim($data['admin_note'] ?? $data['club_note'] ?? 'Approved by club.');

if ($requestId <= 0) {
    json_response(false, 'Invalid request id', [], 400);
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('
        SELECT
            r.request_id,
            r.club_id,
            r.user_id,
            r.status,
            c.club_name,
            c.leader_user_id,
            u.full_name,
            u.email
        FROM club_join_requests r
        INNER JOIN clubs c ON r.club_id = c.club_id
        INNER JOIN users u ON r.user_id = u.user_id
        WHERE r.request_id = ?
        LIMIT 1
        FOR UPDATE
    ');
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();

    if (!$request) {
        $pdo->rollBack();
        json_response(false, 'Club join request not found', [], 404);
    }

    if ((int)$request['leader_user_id'] !== (int)$user['user_id']) {
        $pdo->rollBack();
        json_response(false, 'You can only review requests for your own club', [], 403);
    }

    if ($request['status'] !== 'pending') {
        $pdo->rollBack();
        json_response(false, 'Only pending requests can be approved', [], 409);
    }

    $memberStmt = $pdo->prepare('SELECT member_id FROM club_members WHERE club_id = ? AND user_id = ? LIMIT 1');
    $memberStmt->execute([$request['club_id'], $request['user_id']]);
    $alreadyMember = $memberStmt->fetch();

    if (!$alreadyMember) {
        $insertMember = $pdo->prepare('
            INSERT INTO club_members (club_id, user_id, member_role)
            VALUES (?, ?, "member")
        ');
        $insertMember->execute([$request['club_id'], $request['user_id']]);

        $updateClub = $pdo->prepare('UPDATE clubs SET members_count = members_count + 1 WHERE club_id = ?');
        $updateClub->execute([$request['club_id']]);
    }

    $updateStmt = $pdo->prepare('
        UPDATE club_join_requests
        SET status = "approved",
            reviewed_by = ?,
            reviewed_at = NOW(),
            admin_note = ?
        WHERE request_id = ?
    ');
    $updateStmt->execute([
        $user['user_id'],
        $clubNote !== '' ? $clubNote : 'Approved by club.',
        $requestId
    ]);

    $notifStmt = $pdo->prepare('
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, "success")
    ');
    $notifStmt->execute([
        $request['user_id'],
        'Club Request Approved',
        'Your request to join ' . $request['club_name'] . ' has been approved by the club.'
    ]);

    $pdo->commit();

    json_response(true, 'Club join request approved successfully', [
        'request' => [
            'request_id' => $requestId,
            'club_id' => (int)$request['club_id'],
            'club_name' => $request['club_name'],
            'user_id' => (int)$request['user_id'],
            'status' => 'approved'
        ]
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(false, 'Failed to approve club join request', [], 500);
}
?>
