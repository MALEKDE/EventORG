<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

$admin = require_admin();

try {
    $stats = [];
    $stats['total_requests'] = (int)$pdo->query("SELECT COUNT(*) FROM venue_booking_requests")->fetchColumn();
    $stats['pending'] = (int)$pdo->query("SELECT COUNT(*) FROM venue_booking_requests WHERE status = 'pending'")->fetchColumn();
    $stats['approved'] = (int)$pdo->query("SELECT COUNT(*) FROM venue_booking_requests WHERE status = 'approved'")->fetchColumn();
    $stats['rejected'] = (int)$pdo->query("SELECT COUNT(*) FROM venue_booking_requests WHERE status = 'rejected'")->fetchColumn();
    $stats['venues'] = (int)$pdo->query("SELECT COUNT(*) FROM venues")->fetchColumn();
    $stats['users'] = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $stats['events'] = (int)$pdo->query("SELECT COUNT(*) FROM events")->fetchColumn();
    $stats['total_club_requests'] = (int)$pdo->query("SELECT COUNT(*) FROM club_join_requests")->fetchColumn();
    $stats['pending_club_requests'] = (int)$pdo->query("SELECT COUNT(*) FROM club_join_requests WHERE status = 'pending'")->fetchColumn();
    $stats['approved_club_requests'] = (int)$pdo->query("SELECT COUNT(*) FROM club_join_requests WHERE status = 'approved'")->fetchColumn();

    $stmt = $pdo->query("SELECT status, COUNT(*) AS count FROM venue_booking_requests GROUP BY status");
    $statusCounts = $stmt->fetchAll();

    $stmt = $pdo->query("\n        SELECT v.venue_name AS name, COUNT(b.booking_id) AS count\n        FROM venues v\n        LEFT JOIN venue_booking_requests b ON b.venue_id = v.venue_id\n        GROUP BY v.venue_id, v.venue_name\n        ORDER BY count DESC, v.venue_name ASC\n        LIMIT 8\n    ");
    $venueCounts = $stmt->fetchAll();

    foreach ($statusCounts as &$row) {
        $row['count'] = (int)$row['count'];
    }
    foreach ($venueCounts as &$row) {
        $row['count'] = (int)$row['count'];
    }

    json_response(true, 'Admin dashboard loaded successfully', [
        'admin' => $admin,
        'stats' => $stats,
        'status_counts' => $statusCounts,
        'venue_counts' => $venueCounts
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load admin dashboard', [], 500);
}
?>
