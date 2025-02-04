<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/AirtableClient.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Verify required constants are defined
    if (!defined('AIRTABLE_API_KEY') || !defined('PRODUCTS_BASE_ID') || !defined('PRODUCTS_TABLE_NAME')) {
        throw new Exception('Required configuration constants are not defined');
    }

    $client = new AirtableClient(AIRTABLE_API_KEY, PRODUCTS_BASE_ID, PRODUCTS_TABLE_NAME);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        error_log('Fetching products from Airtable...');
        $result = $client->get();
        error_log('Fetched products: ' . json_encode($result));
        echo json_encode($result);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log('Products API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => 'Please check the server error logs for more information'
    ]);
}