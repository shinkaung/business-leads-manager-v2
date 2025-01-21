<?php
// Start output buffering immediately
ob_start();

// Set error handling to catch everything
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: [$errno] $errstr in $errfile on line $errline");
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Server Error',
        'debug' => "$errstr in $errfile on line $errline"
    ]);
    exit(1);
});

// Clear any previous output
ob_clean();

// Prevent any HTML error output
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON content type
header('Content-Type: application/json');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Debug log
error_log("Starting auth process...");

// Fix the paths by using __DIR__ to get the current directory
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/AirtableClient.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        error_log("Received data: " . json_encode($data));
        
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        error_log("Username: $username, Password: $password");

        if (empty($username) || empty($password)) {
            error_log("Empty username or password");
            throw new Exception('Username and password are required');
        }

        $client = new AirtableClient(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, USERS_TABLE_NAME);
        
        // Log the filter being used
        $filter = "AND({Username}='". addslashes($username) ."',{Password}='". addslashes($password) ."')";
        error_log("Auth filter: " . $filter);
        
        $result = $client->get([
            'filterByFormula' => $filter
        ]);
        
        error_log("Airtable response: " . json_encode($result));

        if (!empty($result['records'])) {
            $user = $result['records'][0];
            error_log("Found user: " . json_encode($user));
            // Make sure to match the exact field names from Airtable
            $role = $user['fields']['Role'] ?? '';
            
            echo json_encode([
                'success' => true,
                'role' => $role,
                'username' => $username
            ]);
        } else {
            error_log("No matching user found for username: $username");
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid username or password'
            ]);
        }
    } catch (Exception $e) {
        error_log("Auth error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}