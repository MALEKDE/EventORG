<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

require_admin();
$data = get_request_data();
$eventId = (int)($data['event_id'] ?? 0);

if ($eventId <= 0) {
    json_response(false, 'Missing event id', [], 422);
}

try {
    $stmt = $pdo->prepare('SELECT event_id FROM events WHERE event_id = ?');
    $stmt->execute([$eventId]);
    if (!$stmt->fetch()) {
        json_response(false, 'Event was not found', [], 404);
    }

    $regStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM event_registrations WHERE event_id = ? AND status = 'confirmed'");
    $regStmt->execute([$eventId]);
    $registered = (int)$regStmt->fetch()['total'];

    if ($registered > 0) {
        $cancelStmt = $pdo->prepare("UPDATE events SET status = 'cancelled' WHERE event_id = ?");
        $cancelStmt->execute([$eventId]);
        json_response(true, 'Event has registrations, so it was cancelled instead of deleted', [
            'action' => 'cancelled',
            'event_id' => $eventId
        ]);
    }

    $deleteStmt = $pdo->prepare('DELETE FROM events WHERE event_id = ?');
    $deleteStmt->execute([$eventId]);

    json_response(true, 'Event deleted successfully', [
        'action' => 'deleted',
        'event_id' => $eventId
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to delete event', [], 500);
}
?>
