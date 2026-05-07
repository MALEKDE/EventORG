<?php
require_once '../helpers/response.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION = [];
session_destroy();

json_response(true, 'Logged out successfully');
?>
