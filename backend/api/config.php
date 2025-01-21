<?php
// Prevent any output before headers
ob_start();

// Strict error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');

// Ensure directory exists for logs
$logDir = __DIR__ . '/logs';
if (!file_exists($logDir)) {
    mkdir($logDir, 0755, true);
}

// Clear any existing output buffers
while (ob_get_level()) {
    ob_end_clean();
}

// Set JSON headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    // Verify config file exists
    $configPath = realpath(__DIR__ . '/../config/config.php');
    if (!$configPath || !is_readable($configPath)) {
        throw new Exception('Config file not found or not readable');
    }

    // Include config file
    require_once $configPath;

    // Verify required constants are defined
    $requiredConstants = ['BASE_PATH', 'API_ENDPOINTS', 'APOLLO_SEARCH_URL', 'APOLLO_BULK_ENRICH_URL'];
    foreach ($requiredConstants as $constant) {
        if (!defined($constant)) {
            throw new Exception("Required constant {$constant} is not defined");
        }
    }

    // Prepare response
    $response = [
        'BASE_PATH' => BASE_PATH,
        'API_ENDPOINTS' => json_decode(API_ENDPOINTS),
        'APOLLO' => [
            'SEARCH_URL' => APOLLO_SEARCH_URL,
            'BULK_ENRICH_URL' => APOLLO_BULK_ENRICH_URL
        ]
    ];

    // Validate JSON encoding
    $json = json_encode($response);
    if ($json === false) {
        throw new Exception('Failed to encode response as JSON: ' . json_last_error_msg());
    }

    echo $json;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => 'Please check the server error logs for more information'
    ]);
    error_log('Config API Error: ' . $e->getMessage());
} 