<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

require_admin();

try {
    $stmt = $pdo->query("\n        SELECT\n            v.venue_id, v.venue_name, v.building, v.venue_type, v.capacity, v.area,\n            v.status, v.image_url, v.features, v.notes,\n            COUNT(DISTINCT b.booking_id) AS booking_count,\n            COUNT(DISTINCT e.event_id) AS event_count\n        FROM venues v\n        LEFT JOIN venue_booking_requests b ON b.venue_id = v.venue_id\n        LEFT JOIN events e ON e.venue_id = v.venue_id\n        GROUP BY v.venue_id, v.venue_name, v.building, v.venue_type, v.capacity, v.area, v.status, v.image_url, v.features, v.notes\n        ORDER BY v.venue_name ASC\n    ");
    $venues = $stmt->fetchAll();

    foreach ($venues as &$venue) {
        $venue['venue_id'] = (int)$venue['venue_id'];
        $venue['capacity'] = (int)$venue['capacity'];
        $venue['booking_count'] = (int)$venue['booking_count'];
        $venue['event_count'] = (int)$venue['event_count'];
    }

    json_response(true, 'Venues loaded successfully', [
        'venues' => $venues
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load venues', [], 500);
}
?>
