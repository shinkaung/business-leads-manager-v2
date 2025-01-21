<?php
require_once '../config/config.php';
require_once '../utils/AirtableClient.php';

$client = new AirtableClient(AIRTABLE_API_KEY, PRODUCTS_BASE_ID, PRODUCTS_TABLE_NAME);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $result = $client->get();
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}