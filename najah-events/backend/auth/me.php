<?php
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

$user = current_user();

if (!$user) {
    json_response(false, 'Not logged in', ['user' => null], 401);
}

json_response(true, 'Logged in user', ['user' => $user]);
?>
