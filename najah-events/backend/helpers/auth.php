<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function current_user() {
    return $_SESSION['user'] ?? null;
}

function require_login() {
    if (!isset($_SESSION['user'])) {
        json_response(false, 'You must login first', [], 401);
    }

    return $_SESSION['user'];
}

function require_admin() {
    $user = require_login();

    if ($user['role'] !== 'admin') {
        json_response(false, 'Admin only', [], 403);
    }

    return $user;
}

function login_user($userRow) {
    $_SESSION['user'] = [
        'user_id' => (int)$userRow['user_id'],
        'full_name' => $userRow['full_name'],
        'email' => $userRow['email'],
        'role' => $userRow['role'],
        'phone' => $userRow['phone'],
        'student_id' => $userRow['student_id'],
        'organization_name' => $userRow['organization_name']
    ];
}
?>
