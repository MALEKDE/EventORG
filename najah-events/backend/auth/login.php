<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'POST request required', [], 405);
}

$data = get_request_data();

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    json_response(false, 'Email and password are required', [], 400);
}

try {
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_response(false, 'Invalid email or password', [], 401);
    }

    if ($user['status'] !== 'active') {
        json_response(false, 'This account is blocked', [], 403);
    }

    login_user($user);

    $redirect = $user['role'] === 'admin' ? 'admin.html' : 'dashboard.html';

    json_response(true, 'Login successful', [
        'user' => $_SESSION['user'],
        'redirect' => $redirect
    ]);

} catch (PDOException $e) {
    json_response(false, 'Login failed', [], 500);
}
?>
