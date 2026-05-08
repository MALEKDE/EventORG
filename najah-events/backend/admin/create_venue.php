<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

require_admin();
$data = get_request_data();

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
    $stmt = $pdo->prepare("\n        INSERT INTO venues\n        (venue_name, building, venue_type, capacity, area, status, image_url, features, notes)\n        VALUES\n        (:venue_name, :building, :venue_type, :capacity, :area, :status, :image_url, :features, :notes)\n    ");

    $stmt->execute([
        'venue_name' => $venueName,
        'building' => $building !== '' ? $building : null,
        'venue_type' => $venueType,
        'capacity' => $capacity,
        'area' => $area !== '' ? $area : null,
        'status' => $status,
        'image_url' => $imageUrl !== '' ? $imageUrl : 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
        'features' => $features !== '' ? $features : null,
        'notes' => $notes !== '' ? $notes : null
    ]);

    json_response(true, 'Venue created successfully', [
        'venue_id' => (int)$pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to create venue', [], 500);
}
?>
