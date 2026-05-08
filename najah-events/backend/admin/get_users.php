<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

require_admin();

try {
    $stmt = $pdo->query("\n        SELECT\n            user_id, full_name, email, role, phone, student_id, organization_name, status, created_at\n        FROM users\n        ORDER BY created_at DESC\n    ");
    $users = $stmt->fetchAll();

    foreach ($users as &$user) {
        $user['user_id'] = (int)$user['user_id'];
    }

    json_response(true, 'Users loaded successfully', [
        'users' => $users
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load users', [], 500);
}
?>
