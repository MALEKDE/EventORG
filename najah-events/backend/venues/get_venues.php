<?php
require_once '../config/db.php';
require_once '../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

try {
    $sql = "
        SELECT
            venue_id AS id,
            venue_name AS name,
            building,
            venue_type AS type,
            capacity,
            area,
            status,
            image_url AS image,
            features,
            notes
        FROM venues
        ORDER BY
            CASE status
                WHEN 'available' THEN 1
                WHEN 'busy' THEN 2
                WHEN 'maintenance' THEN 3
                ELSE 4
            END,
            capacity DESC,
            venue_name ASC
    ";

    $stmt = $pdo->query($sql);
    $venues = $stmt->fetchAll();

    foreach ($venues as &$venue) {
        $venue['id'] = (int)$venue['id'];
        $venue['capacity'] = (int)$venue['capacity'];

        $featuresText = trim((string)($venue['features'] ?? ''));
        if ($featuresText === '') {
            $venue['features'] = [];
        } else {
            $venue['features'] = array_values(array_filter(array_map('trim', explode(',', $featuresText))));
        }
    }

    json_response(true, 'Venues loaded successfully', [
        'venues' => $venues
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load venues', [], 500);
}
?>
