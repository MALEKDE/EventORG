<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

$user = require_login();

try {
    $stmt = $pdo->prepare(" 
        SELECT
            er.registration_id,
            er.event_id,
            e.title AS event_title,
            e.category,
            e.event_date,
            v.venue_name AS venue,
            er.status,
            er.created_at
        FROM event_registrations er
        INNER JOIN events e ON er.event_id = e.event_id
        INNER JOIN venues v ON e.venue_id = v.venue_id
        WHERE er.user_id = ?
        ORDER BY er.created_at DESC
    ");
    $stmt->execute([$user['user_id']]);
    $registrations = $stmt->fetchAll();

    foreach ($registrations as &$registration) {
        $registration['registration_id'] = (int)$registration['registration_id'];
        $registration['event_id'] = (int)$registration['event_id'];
    }

    json_response(true, 'Registrations loaded successfully', [
        'registrations' => $registrations
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load registrations', [], 500);
}
?>
