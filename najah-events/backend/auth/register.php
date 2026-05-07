<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

$data = get_request_data();

$fullName = trim($data['full_name'] ?? $data['fullName'] ?? $data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$confirmPassword = $data['confirm_password'] ?? $data['confirmPassword'] ?? $password;
$role = trim($data['role'] ?? 'student');
$phone = trim($data['phone'] ?? '');
$studentId = trim($data['student_id'] ?? $data['studentId'] ?? '');
$organizationName = trim($data['organization_name'] ?? $data['organizationName'] ?? $data['organization'] ?? '');

$allowedRoles = ['student', 'company', 'club'];

if ($fullName === '' || $email === '' || $password === '') {
    json_response(false, 'Please fill all required fields', [], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(false, 'Invalid email address', [], 400);
}

if (strlen($password) < 6) {
    json_response(false, 'Password must be at least 6 characters', [], 400);
}

if ($password !== $confirmPassword) {
    json_response(false, 'Passwords do not match', [], 400);
}

if (!in_array($role, $allowedRoles)) {
    $role = 'student';
}

try {
    $check = $pdo->prepare('SELECT user_id FROM users WHERE email = ? LIMIT 1');
    $check->execute([$email]);

    if ($check->fetch()) {
        json_response(false, 'This email is already registered', [], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('
        INSERT INTO users
        (full_name, email, password_hash, role, phone, student_id, organization_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');

    $stmt->execute([
        $fullName,
        $email,
        $passwordHash,
        $role,
        $phone ?: null,
        $studentId ?: null,
        $organizationName ?: null
    ]);

    $userId = $pdo->lastInsertId();

    $user = [
        'user_id' => $userId,
        'full_name' => $fullName,
        'email' => $email,
        'role' => $role,
        'phone' => $phone ?: null,
        'student_id' => $studentId ?: null,
        'organization_name' => $organizationName ?: null
    ];

    $_SESSION['user'] = $user;

    json_response(true, 'Account created successfully', [
        'user' => $user,
        'redirect' => $role === 'admin' ? 'admin.html' : 'dashboard.html'
    ], 201);

} catch (PDOException $e) {
    json_response(false, 'Registration failed', [], 500);
}
?>
