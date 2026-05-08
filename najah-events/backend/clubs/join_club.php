<?php
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

$user = require_login();
$data = get_request_data();

$role = strtolower(trim($user['role'] ?? ''));
if ($role !== 'student') {
    json_response(false, 'Only student accounts can request to join clubs. Current role: ' . ($user['role'] ?? 'unknown'), [
        'current_user' => [
            'user_id' => $user['user_id'] ?? null,
            'email' => $user['email'] ?? null,
            'role' => $user['role'] ?? null
        ]
    ], 403);
}

$clubId = (int)($data['club_id'] ?? 0);
$fullName = trim($data['full_name'] ?? ($user['full_name'] ?? ''));
$studentId = trim($data['student_id'] ?? ($user['student_id'] ?? ''));
$reason = trim($data['reason'] ?? '');
$userId = (int)($user['user_id'] ?? 0);

if ($clubId <= 0) {
    json_response(false, 'Invalid club selected. club_id was missing.', ['received' => $data], 400);
}

if ($userId <= 0) {
    json_response(false, 'Invalid logged-in user session. Please logout and login again.', [], 401);
}

if ($fullName === '') {
    $fullName = 'Student #' . $userId;
}

if ($studentId === '') {
    $studentId = 'STU-' . $userId;
}

try {
    $pdo->beginTransaction();

    $clubStmt = $pdo->prepare('SELECT club_id, club_name, status FROM clubs WHERE club_id = ? LIMIT 1');
    $clubStmt->execute([$clubId]);
    $club = $clubStmt->fetch();

    if (!$club) {
        $pdo->rollBack();
        json_response(false, 'Club not found for club_id=' . $clubId, [], 404);
    }

    if (($club['status'] ?? '') !== 'active') {
        $pdo->rollBack();
        json_response(false, 'This club is not active now', [], 400);
    }

    $memberStmt = $pdo->prepare('SELECT member_id FROM club_members WHERE club_id = ? AND user_id = ? LIMIT 1');
    $memberStmt->execute([$clubId, $userId]);
    if ($memberStmt->fetch()) {
        $pdo->rollBack();
        json_response(false, 'You are already a member of this club', [], 409);
    }

    $pendingStmt = $pdo->prepare('SELECT request_id, status FROM club_join_requests WHERE club_id = ? AND user_id = ? AND status = "pending" LIMIT 1');
    $pendingStmt->execute([$clubId, $userId]);
    $pending = $pendingStmt->fetch();
    if ($pending) {
        $pdo->rollBack();
        json_response(false, 'You already have a pending request for this club', [
            'request' => [
                'request_id' => (int)$pending['request_id'],
                'club_id' => $clubId,
                'club_name' => $club['club_name'],
                'status' => 'pending'
            ]
        ], 409);
    }

    $insertStmt = $pdo->prepare('INSERT INTO club_join_requests (club_id, user_id, full_name, student_id, reason, status) VALUES (?, ?, ?, ?, ?, "pending")');
    $insertStmt->execute([$clubId, $userId, $fullName, $studentId, ($reason !== '' ? $reason : null)]);
    $requestId = (int)$pdo->lastInsertId();

    $verifyStmt = $pdo->prepare('SELECT request_id FROM club_join_requests WHERE request_id = ? LIMIT 1');
    $verifyStmt->execute([$requestId]);
    if (!$verifyStmt->fetch()) {
        $pdo->rollBack();
        json_response(false, 'Insert verification failed. The request was not saved.', [], 500);
    }

    try {
        $notifStmt = $pdo->prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "info")');
        $notifStmt->execute([$userId, 'Club Join Request Sent', 'Your request to join ' . $club['club_name'] . ' is now pending review.']);
    } catch (PDOException $ignored) {
        // Do not block the join request if notifications fail.
    }

    $pdo->commit();

    json_response(true, 'Join request submitted successfully', [
        'request' => [
            'request_id' => $requestId,
            'club_id' => $clubId,
            'club_name' => $club['club_name'],
            'status' => 'pending'
        ],
        'debug' => [
            'user_id' => $userId,
            'user_email' => $user['email'] ?? '',
            'role' => $user['role'] ?? ''
        ]
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(false, 'Failed to submit join request: ' . $e->getMessage(), [
        'received' => $data,
        'session_user' => [
            'user_id' => $user['user_id'] ?? null,
            'email' => $user['email'] ?? null,
            'role' => $user['role'] ?? null
        ]
    ], 500);
}
?>
