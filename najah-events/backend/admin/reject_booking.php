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
$adminNote = trim($data['admin_note'] ?? 'Rejected by admin.');

if ($bookingId <= 0) {
    json_response(false, 'Booking ID is required', [], 400);
}

try {
    $stmt = $pdo->prepare("SELECT booking_id, status, user_id, ref_code FROM venue_booking_requests WHERE booking_id = ? LIMIT 1");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        json_response(false, 'Booking request not found', [], 404);
    }

    if ($booking['status'] !== 'pending') {
        json_response(false, 'Only pending requests can be rejected', [], 400);
    }

    $stmt = $pdo->prepare("\n        UPDATE venue_booking_requests\n        SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), admin_note = ?\n        WHERE booking_id = ?\n    ");
    $stmt->execute([$admin['user_id'], $adminNote, $bookingId]);

    $stmt = $pdo->prepare("\n        INSERT INTO notifications (user_id, title, message, type)\n        VALUES (?, 'Booking Rejected', ?, 'warning')\n    ");
    $stmt->execute([
        $booking['user_id'],
        'Your booking request ' . $booking['ref_code'] . ' has been rejected.'
    ]);

    json_response(true, 'Booking rejected successfully');

} catch (PDOException $e) {
    json_response(false, 'Failed to reject booking', [], 500);
}
?>
