<?php
function json_response($success, $message, $data = [], $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

function get_request_data() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (is_array($data)) {
        return $data;
    }

    return $_POST;
}
?>
