<?php
// Prevent direct access
if (!defined('SECURE_ACCESS')) {
    define('SECURE_ACCESS', true);
}

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/logs/error.log');

// Buffer output
ob_start();

// Load environment variables
if (file_exists(__DIR__ . '/env.php')) {
    require_once __DIR__ . '/env.php';
    loadEnv();
}

// Define paths
define('BASE_PATH', '');
define('API_PATH', '/api');

// Create an array of API endpoints
$endpoints = [
    'LEADS' => BASE_PATH . API_PATH . '/leads.php',
    'LEADS_CHECK_DUPLICATES' => BASE_PATH . API_PATH . '/leads/check-duplicates.php',
    'LEADS_BULK' => BASE_PATH . API_PATH . '/leads/bulk.php',
    'PRODUCTS' => BASE_PATH . API_PATH . '/products.php',
    'SEARCH' => BASE_PATH . API_PATH . '/search.php'
];

define('API_ENDPOINTS', json_encode($endpoints));

// Database configuration
define('AIRTABLE_API_KEY', getenv('AIRTABLE_API_KEY'));
define('AIRTABLE_BASE_ID', getenv('AIRTABLE_BASE_ID'));
define('AIRTABLE_TABLE_NAME', getenv('AIRTABLE_TABLE_NAME'));

// Products configuration
define('PRODUCTS_BASE_ID', getenv('PRODUCTS_BASE_ID'));
define('PRODUCTS_TABLE_NAME', getenv('PRODUCTS_TABLE_NAME'));

// Set headers for API responses
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Clear any existing output
while (ob_get_level()) {
    ob_end_clean();
}

// Add these constants if they're not defined elsewhere
if (!defined('APOLLO_SEARCH_URL')) {
    define('APOLLO_SEARCH_URL', getenv('APOLLO_SEARCH_URL'));
}
if (!defined('APOLLO_BULK_ENRICH_URL')) {
    define('APOLLO_BULK_ENRICH_URL', getenv('APOLLO_BULK_ENRICH_URL'));
}