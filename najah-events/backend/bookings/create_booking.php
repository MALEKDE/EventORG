<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

$user = require_login();
$data = get_request_data();

$venueId = (int)($data['venue_id'] ?? 0);
$eventName = trim($data['event_name'] ?? '');
$eventType = trim($data['event_type'] ?? '');
$expectedAttendees = (int)($data['expected_attendees'] ?? 0);
$eventDate = trim($data['event_date'] ?? '');
$startTime = trim($data['start_time'] ?? '');
$endTime = trim($data['end_time'] ?? '');
$eventDescription = trim($data['event_description'] ?? '');

$organizerName = trim($data['organizer_name'] ?? '');
$organizerEmail = trim($data['organizer_email'] ?? '');
$organizerPhone = trim($data['organizer_phone'] ?? '');
$organizationOrFaculty = trim($data['organization_or_faculty'] ?? '');
$organizerRole = trim($data['organizer_role'] ?? 'student');

$allowedRoles = ['student', 'club_leader', 'faculty_member', 'company_representative', 'admin_staff'];
if (!in_array($organizerRole, $allowedRoles, true)) {
    $organizerRole = 'student';
}

$additionalNotes = trim($data['additional_notes'] ?? '');

if ($venueId <= 0 || $eventName === '' || $eventDate === '' || $organizerName === '' || $organizerEmail === '') {
    json_response(false, 'Please fill all required fields', [], 400);
}

if (!filter_var($organizerEmail, FILTER_VALIDATE_EMAIL)) {
    json_response(false, 'Please enter a valid organizer email', [], 400);
}

if ($expectedAttendees < 0) {
    $expectedAttendees = 0;
}

function bool_int($value) {
    return !empty($value) ? 1 : 0;
}

function make_ref_code() {
    return 'NE-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
}

try {
    $venueStmt = $pdo->prepare('SELECT venue_id, venue_name, capacity, status FROM venues WHERE venue_id = ? LIMIT 1');
    $venueStmt->execute([$venueId]);
    $venue = $venueStmt->fetch();

    if (!$venue) {
        json_response(false, 'Selected venue was not found', [], 404);
    }

    if ($venue['status'] !== 'available') {
        json_response(false, 'This venue is not available for booking right now', [], 409);
    }

    if ($expectedAttendees > 0 && $expectedAttendees > (int)$venue['capacity']) {
        json_response(false, 'Expected attendees exceed this venue capacity', [], 400);
    }

    $refCode = make_ref_code();

    for ($i = 0; $i < 5; $i++) {
        $check = $pdo->prepare('SELECT booking_id FROM venue_booking_requests WHERE ref_code = ? LIMIT 1');
        $check->execute([$refCode]);
        if (!$check->fetch()) {
            break;
        }
        $refCode = make_ref_code();
    }

    $stmt = $pdo->prepare("
        INSERT INTO venue_booking_requests
        (
            ref_code,
            user_id,
            venue_id,
            event_name,
            event_type,
            expected_attendees,
            event_date,
            start_time,
            end_time,
            event_description,
            organizer_name,
            organizer_email,
            organizer_phone,
            organization_or_faculty,
            organizer_role,
            req_av_equipment,
            req_tables_chairs,
            req_security,
            req_catering_setup,
            req_photography,
            req_live_streaming,
            additional_notes,
            status
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending'
        )
    " );

    $stmt->execute([
        $refCode,
        $user['user_id'],
        $venueId,
        $eventName,
        $eventType,
        $expectedAttendees ?: null,
        $eventDate,
        $startTime ?: null,
        $endTime ?: null,
        $eventDescription,
        $organizerName,
        $organizerEmail,
        $organizerPhone,
        $organizationOrFaculty,
        $organizerRole,
        bool_int($data['req_av_equipment'] ?? false),
        bool_int($data['req_tables_chairs'] ?? false),
        bool_int($data['req_security'] ?? false),
        bool_int($data['req_catering_setup'] ?? false),
        bool_int($data['req_photography'] ?? false),
        bool_int($data['req_live_streaming'] ?? false),
        $additionalNotes
    ]);

    $bookingId = (int)$pdo->lastInsertId();

    $notificationStmt = $pdo->prepare('
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
    ');
    $notificationStmt->execute([
        $user['user_id'],
        'Booking Request Submitted',
        'Your booking request ' . $refCode . ' is pending admin review.',
        'warning'
    ]);

    json_response(true, 'Booking request submitted successfully', [
        'booking' => [
            'booking_id' => $bookingId,
            'ref_code' => $refCode,
            'venue_id' => $venueId,
            'venue_name' => $venue['venue_name'],
            'event_name' => $eventName,
            'event_date' => $eventDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'organizer_name' => $organizerName,
            'organizer_email' => $organizerEmail,
            'status' => 'pending'
        ]
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to submit booking request', [], 500);
}
?>
