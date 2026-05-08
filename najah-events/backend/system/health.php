<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

try {
    $pdo->query('SELECT 1');

    $tables = [
        'users',
        'venues',
        'clubs',
        'events',
        'event_registrations',
        'venue_booking_requests',
        'club_join_requests',
        'club_members',
        'notifications'
    ];

    $counts = [];
    foreach ($tables as $table) {
        $counts[$table] = (int)$pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
    }

    json_response(true, 'Backend and database connection are working', [
        'database' => 'najah_events_db',
        'counts' => $counts,
        'session_user' => current_user()
    ]);
} catch (PDOException $e) {
    json_response(false, 'Database connection failed. Check XAMPP MySQL and db.php settings.', [], 500);
}
?>
