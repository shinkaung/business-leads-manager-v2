<?php
// Load environment variables
require_once __DIR__ . '/env.php';
loadEnv();

// Strict error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/logs/error.log');

// Prevent any output before headers
ob_start();

// Essential path definitions
define('PROJECT_ROOT', dirname(dirname(__DIR__))); 
define('BASE_PATH', ''); // Empty for Vercel
define('API_PATH', '/api');

// Create an array of API endpoints
$endpoints = [
    'LEADS' => API_PATH . '/leads.php',
    'LEADS_CHECK_DUPLICATES' => API_PATH . '/leads/check-duplicates.php',
    'LEADS_BULK' => API_PATH . '/leads/bulk.php',
    'PRODUCTS' => API_PATH . '/products.php',
    'SEARCH' => API_PATH . '/search.php'
];

define('API_ENDPOINTS', json_encode($endpoints));

// Database configuration using environment variables
define('AIRTABLE_API_KEY', getenv('AIRTABLE_API_KEY'));
define('AIRTABLE_BASE_ID', getenv('AIRTABLE_BASE_ID'));
define('AIRTABLE_TABLE_NAME', getenv('AIRTABLE_TABLE_NAME'));
define('USERS_TABLE_NAME', getenv('USERS_TABLE_NAME'));
define('PRODUCTS_BASE_ID', getenv('PRODUCTS_BASE_ID'));
define('PRODUCTS_TABLE_NAME', getenv('PRODUCTS_TABLE_NAME'));

// CORS settings
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Clear any existing output buffers
while (ob_get_level()) {
    ob_end_clean();
}