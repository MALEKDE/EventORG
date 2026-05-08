<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

require_admin();
$data = get_request_data();
$venueId = (int)($data['venue_id'] ?? 0);

if ($venueId <= 0) {
    json_response(false, 'Missing venue id', [], 422);
}

try {
    $stmt = $pdo->prepare('SELECT venue_id FROM venues WHERE venue_id = ?');
    $stmt->execute([$venueId]);
    if (!$stmt->fetch()) {
        json_response(false, 'Venue was not found', [], 404);
    }

    $eventStmt = $pdo->prepare('SELECT COUNT(*) AS total FROM events WHERE venue_id = ?');
    $eventStmt->execute([$venueId]);
    $eventCount = (int)$eventStmt->fetch()['total'];

    $bookingStmt = $pdo->prepare('SELECT COUNT(*) AS total FROM venue_booking_requests WHERE venue_id = ?');
    $bookingStmt->execute([$venueId]);
    $bookingCount = (int)$bookingStmt->fetch()['total'];

    if ($eventCount > 0 || $bookingCount > 0) {
        json_response(false, 'Cannot delete this venue because it has events or booking requests. Set it to maintenance instead.', [], 409);
    }

    $deleteStmt = $pdo->prepare('DELETE FROM venues WHERE venue_id = ?');
    $deleteStmt->execute([$venueId]);

    json_response(true, 'Venue deleted successfully', [
        'venue_id' => $venueId
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to delete venue', [], 500);
}
?>
