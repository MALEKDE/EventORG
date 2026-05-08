<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

require_admin();

try {
    $stmt = $pdo->query("\n        SELECT\n            b.booking_id,\n            b.ref_code,\n            b.event_name,\n            b.event_type,\n            b.expected_attendees,\n            b.event_date,\n            b.start_time,\n            b.end_time,\n            b.event_description,\n            b.organizer_name,\n            b.organizer_email,\n            b.organizer_phone,\n            b.organization_or_faculty,\n            b.organizer_role,\n            b.additional_notes,\n            b.status,\n            b.reviewed_at,\n            b.admin_note,\n            b.created_at,\n            v.venue_id,\n            v.venue_name,\n            v.venue_type,\n            v.capacity,\n            u.full_name AS account_name,\n            u.email AS account_email,\n            reviewer.full_name AS reviewed_by_name\n        FROM venue_booking_requests b\n        INNER JOIN venues v ON b.venue_id = v.venue_id\n        INNER JOIN users u ON b.user_id = u.user_id\n        LEFT JOIN users reviewer ON b.reviewed_by = reviewer.user_id\n        ORDER BY\n            CASE b.status\n                WHEN 'pending' THEN 1\n                WHEN 'approved' THEN 2\n                WHEN 'rejected' THEN 3\n                WHEN 'cancelled' THEN 4\n                ELSE 5\n            END,\n            b.created_at DESC\n    ");

    $bookings = $stmt->fetchAll();

    foreach ($bookings as &$booking) {
        $booking['booking_id'] = (int)$booking['booking_id'];
        $booking['venue_id'] = (int)$booking['venue_id'];
        $booking['expected_attendees'] = $booking['expected_attendees'] !== null ? (int)$booking['expected_attendees'] : null;
        $booking['capacity'] = (int)$booking['capacity'];
    }

    json_response(true, 'Booking requests loaded successfully', [
        'bookings' => $bookings
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load booking requests', [], 500);
}
?>
