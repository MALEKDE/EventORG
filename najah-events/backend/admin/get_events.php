<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

require_admin();

try {
    $stmt = $pdo->query("\n        SELECT\n            e.event_id, e.title, e.category, e.event_date, e.capacity, e.registered_count, e.status,\n            v.venue_name, c.club_name\n        FROM events e\n        INNER JOIN venues v ON e.venue_id = v.venue_id\n        LEFT JOIN clubs c ON e.organizer_club_id = c.club_id\n        ORDER BY e.event_date DESC, e.event_id DESC\n    ");
    $events = $stmt->fetchAll();

    foreach ($events as &$event) {
        $event['event_id'] = (int)$event['event_id'];
        $event['capacity'] = (int)$event['capacity'];
        $event['registered_count'] = (int)$event['registered_count'];
    }

    json_response(true, 'Events loaded successfully', [
        'events' => $events
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load events', [], 500);
}
?>
