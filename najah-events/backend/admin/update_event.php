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
$title = trim($data['title'] ?? '');
$category = trim($data['category'] ?? '');
$eventDate = trim($data['event_date'] ?? '');
$venueId = (int)($data['venue_id'] ?? 0);
$capacity = (int)($data['capacity'] ?? 0);
$imageUrl = trim($data['image_url'] ?? '');
$description = trim($data['description'] ?? '');
$status = trim($data['status'] ?? 'upcoming');

$allowedCategories = ['expo', 'conference', 'workshop', 'festival', 'sports'];
$allowedStatuses = ['upcoming', 'completed', 'cancelled'];

if ($eventId <= 0) {
    json_response(false, 'Missing event id', [], 422);
}

if ($title === '' || $category === '' || $eventDate === '' || $venueId <= 0 || $capacity <= 0) {
    json_response(false, 'Please fill all required event fields', [], 422);
}

if (!in_array($category, $allowedCategories, true)) {
    json_response(false, 'Invalid event category', [], 422);
}

if (!in_array($status, $allowedStatuses, true)) {
    json_response(false, 'Invalid event status', [], 422);
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $eventDate)) {
    json_response(false, 'Invalid event date', [], 422);
}

try {
    $eventStmt = $pdo->prepare('SELECT registered_count FROM events WHERE event_id = ?');
    $eventStmt->execute([$eventId]);
    $event = $eventStmt->fetch();

    if (!$event) {
        json_response(false, 'Event was not found', [], 404);
    }

    $registeredCount = (int)$event['registered_count'];
    if ($capacity < $registeredCount) {
        json_response(false, 'Capacity cannot be less than the current registered count', [], 422);
    }

    $venueStmt = $pdo->prepare('SELECT capacity FROM venues WHERE venue_id = ?');
    $venueStmt->execute([$venueId]);
    $venue = $venueStmt->fetch();

    if (!$venue) {
        json_response(false, 'Selected venue was not found', [], 404);
    }

    if ($capacity > (int)$venue['capacity']) {
        json_response(false, 'Event capacity cannot be greater than venue capacity', [], 422);
    }

    $stmt = $pdo->prepare("\n        UPDATE events SET\n            title = :title,\n            category = :category,\n            event_date = :event_date,\n            venue_id = :venue_id,\n            capacity = :capacity,\n            image_url = :image_url,\n            description = :description,\n            status = :status\n        WHERE event_id = :event_id\n    ");

    $stmt->execute([
        'title' => $title,
        'category' => $category,
        'event_date' => $eventDate,
        'venue_id' => $venueId,
        'capacity' => $capacity,
        'image_url' => $imageUrl !== '' ? $imageUrl : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
        'description' => $description,
        'status' => $status,
        'event_id' => $eventId
    ]);

    json_response(true, 'Event updated successfully', [
        'event_id' => $eventId
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to update event', [], 500);
}
?>
