<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

$user = require_login();
$data = get_request_data();

$eventId = (int)($data['event_id'] ?? 0);
$fullName = trim($data['full_name'] ?? $user['full_name'] ?? '');
$studentIdOrEmail = trim($data['student_id_or_email'] ?? $user['student_id'] ?? $user['email'] ?? '');
$roleText = trim($data['role_text'] ?? $user['role'] ?? 'Student');
$notes = trim($data['notes'] ?? '');

if ($eventId <= 0) {
    json_response(false, 'Invalid event selected', [], 400);
}

if ($fullName === '' || $studentIdOrEmail === '') {
    json_response(false, 'Full name and student ID/email are required', [], 400);
}

try {
    $pdo->beginTransaction();

    $eventStmt = $pdo->prepare("SELECT event_id, title, capacity, registered_count, status FROM events WHERE event_id = ? FOR UPDATE");
    $eventStmt->execute([$eventId]);
    $event = $eventStmt->fetch();

    if (!$event) {
        $pdo->rollBack();
        json_response(false, 'Event not found', [], 404);
    }

    if ($event['status'] !== 'upcoming') {
        $pdo->rollBack();
        json_response(false, 'Registration is closed for this event', [], 400);
    }

    $duplicateStmt = $pdo->prepare("SELECT registration_id FROM event_registrations WHERE event_id = ? AND user_id = ? AND status = 'confirmed' LIMIT 1");
    $duplicateStmt->execute([$eventId, $user['user_id']]);

    if ($duplicateStmt->fetch()) {
        $pdo->rollBack();
        json_response(false, 'You are already registered for this event', [], 409);
    }

    $capacity = (int)$event['capacity'];
    $registeredCount = (int)$event['registered_count'];

    if ($registeredCount >= $capacity) {
        $pdo->rollBack();
        json_response(false, 'Sorry, this event is full', [], 400);
    }

    $insertStmt = $pdo->prepare(" 
        INSERT INTO event_registrations
        (event_id, user_id, full_name, student_id_or_email, role_text, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
    ");
    $insertStmt->execute([
        $eventId,
        $user['user_id'],
        $fullName,
        $studentIdOrEmail,
        $roleText,
        $notes !== '' ? $notes : null
    ]);

    $updateStmt = $pdo->prepare("UPDATE events SET registered_count = registered_count + 1 WHERE event_id = ?");
    $updateStmt->execute([$eventId]);

    $pdo->commit();

    $newRegistered = $registeredCount + 1;

    json_response(true, 'Registration confirmed successfully', [
        'registration' => [
            'event_id' => $eventId,
            'event_title' => $event['title'],
            'status' => 'confirmed',
            'registered_count' => $newRegistered,
            'capacity' => $capacity,
            'spots_left' => max(0, $capacity - $newRegistered)
        ]
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ($e->getCode() === '23000') {
        json_response(false, 'You are already registered for this event', [], 409);
    }

    json_response(false, 'Registration failed', [], 500);
}
?>
