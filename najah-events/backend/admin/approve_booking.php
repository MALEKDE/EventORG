<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

$admin = require_admin();
$data = get_request_data();

$bookingId = (int)($data['booking_id'] ?? 0);
$adminNote = trim($data['admin_note'] ?? 'Approved by admin.');

if ($bookingId <= 0) {
    json_response(false, 'Booking ID is required', [], 400);
}

function booking_type_to_event_category($eventType) {
    $value = strtolower(trim((string)$eventType));

    if (strpos($value, 'expo') !== false || strpos($value, 'exhibition') !== false) {
        return 'expo';
    }

    if (strpos($value, 'conference') !== false || strpos($value, 'graduation') !== false || strpos($value, 'ceremony') !== false) {
        return 'conference';
    }

    if (strpos($value, 'workshop') !== false) {
        return 'workshop';
    }

    if (strpos($value, 'festival') !== false || strpos($value, 'cultural') !== false) {
        return 'festival';
    }

    if (strpos($value, 'sport') !== false) {
        return 'sports';
    }

    return 'conference';
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("\n        SELECT\n            b.booking_id,\n            b.ref_code,\n            b.status,\n            b.user_id,\n            b.venue_id,\n            b.event_name,\n            b.event_type,\n            b.expected_attendees,\n            b.event_date,\n            b.event_description,\n            b.organization_or_faculty,\n            v.venue_name,\n            v.capacity AS venue_capacity\n        FROM venue_booking_requests b\n        INNER JOIN venues v ON b.venue_id = v.venue_id\n        WHERE b.booking_id = ?\n        LIMIT 1\n    ");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        $pdo->rollBack();
        json_response(false, 'Booking request not found', [], 404);
    }

    if ($booking['status'] !== 'pending') {
        $pdo->rollBack();
        json_response(false, 'Only pending requests can be approved', [], 400);
    }

    $category = booking_type_to_event_category($booking['event_type']);
    $capacity = (int)($booking['expected_attendees'] ?? 0);

    if ($capacity <= 0) {
        $capacity = (int)$booking['venue_capacity'];
    }

    $description = trim((string)($booking['event_description'] ?? ''));
    if ($description === '') {
        $description = 'Approved venue booking request ' . $booking['ref_code'] . '.';
    }

    if (!empty($booking['organization_or_faculty'])) {
        $description .= "\n\nOrganizer: " . $booking['organization_or_faculty'];
    }

    $defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80';

    $eventStmt = $pdo->prepare("\n        INSERT INTO events\n        (title, category, event_date, venue_id, capacity, registered_count, image_url, description, status)\n        VALUES\n        (?, ?, ?, ?, ?, 0, ?, ?, 'upcoming')\n    ");

    $eventStmt->execute([
        $booking['event_name'],
        $category,
        $booking['event_date'],
        (int)$booking['venue_id'],
        $capacity,
        $defaultImage,
        $description
    ]);

    $createdEventId = (int)$pdo->lastInsertId();

    $updateStmt = $pdo->prepare("\n        UPDATE venue_booking_requests\n        SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), admin_note = ?\n        WHERE booking_id = ?\n    ");
    $updateStmt->execute([$admin['user_id'], $adminNote, $bookingId]);

    $notificationStmt = $pdo->prepare("\n        INSERT INTO notifications (user_id, title, message, type)\n        VALUES (?, 'Booking Approved', ?, 'success')\n    ");
    $notificationStmt->execute([
        $booking['user_id'],
        'Your booking request ' . $booking['ref_code'] . ' has been approved and published as an event.'
    ]);

    $pdo->commit();

    json_response(true, 'Booking approved and event published successfully', [
        'event' => [
            'event_id' => $createdEventId,
            'title' => $booking['event_name'],
            'category' => $category,
            'event_date' => $booking['event_date'],
            'venue_name' => $booking['venue_name'],
            'capacity' => $capacity
        ]
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(false, 'Failed to approve booking and publish event', [], 500);
}
?>
