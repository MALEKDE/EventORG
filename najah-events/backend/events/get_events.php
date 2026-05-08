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

    $sql = "
        SELECT
            e.event_id AS id,
            e.title,
            e.category,
            e.event_date AS date,
            v.venue_name AS venue,
            e.capacity AS seats,
            e.registered_count AS registered,
            e.image_url AS img,
            e.description AS `desc`,
            e.status,
            CASE
                WHEN er.registration_id IS NULL THEN 0
                ELSE 1
            END AS is_registered
        FROM events e
        INNER JOIN venues v ON e.venue_id = v.venue_id
        LEFT JOIN event_registrations er
            ON er.event_id = e.event_id
            AND er.user_id = :user_id
            AND er.status = 'confirmed'
        WHERE e.status = 'upcoming'
        ORDER BY e.event_date ASC, e.event_id ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $userId]);
    $events = $stmt->fetchAll();

    foreach ($events as &$event) {
        $event['id'] = (int)$event['id'];
        $event['seats'] = (int)$event['seats'];
        $event['registered'] = (int)$event['registered'];
        $event['is_registered'] = (bool)$event['is_registered'];
    }

    json_response(true, 'Events loaded successfully', [
        'events' => $events
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load events', [], 500);
}
?>
