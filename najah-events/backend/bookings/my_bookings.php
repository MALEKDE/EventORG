<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

$user = require_login();

try {
    $stmt = $pdo->prepare('
        SELECT
            b.booking_id,
            b.ref_code,
            b.event_name,
            b.event_type,
            b.expected_attendees,
            b.event_date,
            b.start_time,
            b.end_time,
            b.event_description,
            b.organizer_name,
            b.organizer_email,
            b.organizer_phone,
            b.organization_or_faculty,
            b.organizer_role,
            b.additional_notes,
            b.status,
            b.admin_note,
            b.reviewed_at,
            b.created_at,
            v.venue_id,
            v.venue_name,
            v.building,
            v.capacity,
            v.image_url
        FROM venue_booking_requests b
        INNER JOIN venues v ON b.venue_id = v.venue_id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    ');
    $stmt->execute([$user['user_id']]);
    $bookings = $stmt->fetchAll();

    foreach ($bookings as &$booking) {
        $booking['booking_id'] = (int)$booking['booking_id'];
        $booking['venue_id'] = (int)$booking['venue_id'];
        $booking['expected_attendees'] = $booking['expected_attendees'] !== null ? (int)$booking['expected_attendees'] : null;
        $booking['capacity'] = (int)$booking['capacity'];
    }

    json_response(true, 'Bookings loaded successfully', [
        'bookings' => $bookings
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load bookings', [], 500);
}
?>
