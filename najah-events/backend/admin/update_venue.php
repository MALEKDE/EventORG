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
$venueName = trim($data['venue_name'] ?? '');
$building = trim($data['building'] ?? '');
$venueType = trim($data['venue_type'] ?? '');
$capacity = (int)($data['capacity'] ?? 0);
$area = trim($data['area'] ?? '');
$status = trim($data['status'] ?? 'available');
$imageUrl = trim($data['image_url'] ?? '');
$features = trim($data['features'] ?? '');
$notes = trim($data['notes'] ?? '');

$allowedTypes = ['auditorium', 'hall', 'classroom', 'outdoor', 'lab'];
$allowedStatuses = ['available', 'busy', 'maintenance'];

if ($venueId <= 0) {
    json_response(false, 'Missing venue id', [], 422);
}

if ($venueName === '' || $venueType === '' || $capacity <= 0) {
    json_response(false, 'Please fill all required venue fields', [], 422);
}

if (!in_array($venueType, $allowedTypes, true)) {
    json_response(false, 'Invalid venue type', [], 422);
}

if (!in_array($status, $allowedStatuses, true)) {
    json_response(false, 'Invalid venue status', [], 422);
}

try {
    $venueStmt = $pdo->prepare('SELECT venue_id FROM venues WHERE venue_id = ?');
    $venueStmt->execute([$venueId]);
    if (!$venueStmt->fetch()) {
        json_response(false, 'Venue was not found', [], 404);
    }

    $maxEventStmt = $pdo->prepare('SELECT MAX(capacity) AS max_capacity FROM events WHERE venue_id = ?');
    $maxEventStmt->execute([$venueId]);
    $maxEventCapacity = (int)($maxEventStmt->fetch()['max_capacity'] ?? 0);

    if ($maxEventCapacity > 0 && $capacity < $maxEventCapacity) {
        json_response(false, 'Venue capacity cannot be less than an event already using this venue', [], 422);
    }

    $stmt = $pdo->prepare("\n        UPDATE venues SET\n            venue_name = :venue_name,\n            building = :building,\n            venue_type = :venue_type,\n            capacity = :capacity,\n            area = :area,\n            status = :status,\n            image_url = :image_url,\n            features = :features,\n            notes = :notes\n        WHERE venue_id = :venue_id\n    ");

    $stmt->execute([
        'venue_name' => $venueName,
        'building' => $building !== '' ? $building : null,
        'venue_type' => $venueType,
        'capacity' => $capacity,
        'area' => $area !== '' ? $area : null,
        'status' => $status,
        'image_url' => $imageUrl !== '' ? $imageUrl : 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
        'features' => $features !== '' ? $features : null,
        'notes' => $notes !== '' ? $notes : null,
        'venue_id' => $venueId
    ]);

    json_response(true, 'Venue updated successfully', [
        'venue_id' => $venueId
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to update venue', [], 500);
}
?>
