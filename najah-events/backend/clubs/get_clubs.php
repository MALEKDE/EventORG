<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

try {
    $user = current_user();
    $userId = $user ? (int)$user['user_id'] : 0;

    $stmt = $pdo->query('
        SELECT
            club_id AS id,
            club_name AS name,
            category,
            icon,
            color,
            members_count AS members,
            events_count AS events,
            image_url AS img,
            description AS `desc`,
            status
        FROM clubs
        WHERE status = "active"
        ORDER BY club_name ASC
    ');

    $clubs = $stmt->fetchAll();

    foreach ($clubs as &$club) {
        $club['id'] = (int)$club['id'];
        $club['members'] = (int)$club['members'];
        $club['events'] = (int)$club['events'];
        $club['join_status'] = 'none';
    }
    unset($club);

    if ($userId > 0 && count($clubs) > 0) {
        $memberStmt = $pdo->prepare('SELECT club_id FROM club_members WHERE user_id = ?');
        $memberStmt->execute([$userId]);
        $memberRows = $memberStmt->fetchAll();
        $memberClubIds = [];

        foreach ($memberRows as $row) {
            $memberClubIds[(int)$row['club_id']] = true;
        }

        $requestStmt = $pdo->prepare('
            SELECT r.club_id, r.status
            FROM club_join_requests r
            INNER JOIN (
                SELECT club_id, MAX(request_id) AS latest_id
                FROM club_join_requests
                WHERE user_id = ?
                GROUP BY club_id
            ) latest
                ON latest.latest_id = r.request_id
            WHERE r.user_id = ?
        ');
        $requestStmt->execute([$userId, $userId]);
        $requestRows = $requestStmt->fetchAll();
        $requestStatusByClub = [];

        foreach ($requestRows as $row) {
            $requestStatusByClub[(int)$row['club_id']] = $row['status'];
        }

        foreach ($clubs as &$club) {
            $clubId = (int)$club['id'];

            if (isset($memberClubIds[$clubId])) {
                $club['join_status'] = 'member';
            } elseif (isset($requestStatusByClub[$clubId])) {
                $club['join_status'] = $requestStatusByClub[$clubId];
            }
        }
        unset($club);
    }

    json_response(true, 'Clubs loaded successfully', [
        'clubs' => $clubs
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load clubs', [], 500);
}
?>
