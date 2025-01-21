<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Keep this off to prevent HTML errors

// Ensure we're outputting JSON
header('Content-Type: application/json');

try {
    // Fix the path resolution using __FILE__
    $baseDir = dirname(dirname(dirname(__FILE__))); // Gets the business-leads-manager/backend directory
    $configPath = $baseDir . '/config/config.php';
    $clientPath = $baseDir . '/utils/AirtableClient.php';

    if (!file_exists($configPath)) {
        throw new Exception("Config file not found at: $configPath");
    }
    if (!file_exists($clientPath)) {
        throw new Exception("AirtableClient file not found at: $clientPath");
    }

    require_once $configPath;
    require_once $clientPath;

    // Debug: Output the received data
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    if (!$data) {
        throw new Exception('Failed to parse JSON input. Raw input: ' . $rawInput);
    }
    
    if (!isset($data['records'])) {
        throw new Exception('Missing records in input data. Data received: ' . json_encode($data));
    }

    // Debug: Check Airtable configuration
    if (!defined('AIRTABLE_API_KEY')) {
        throw new Exception('AIRTABLE_API_KEY is not defined');
    }
    if (!defined('AIRTABLE_BASE_ID')) {
        throw new Exception('AIRTABLE_BASE_ID is not defined');
    }
    if (!defined('AIRTABLE_TABLE_NAME')) {
        throw new Exception('AIRTABLE_TABLE_NAME is not defined');
    }

    $client = new AirtableClient(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME);
    
    $records = $data['records'];
    $newRecords = [];
    $duplicateCount = 0;

    foreach ($records as $record) {
        $email = $record['fields']['Email'] ?? '';
        $phone = $record['fields']['Tel'] ?? '';
        $company = $record['fields']['Name of outlet'] ?? '';

        $filterParts = [];
        if (!empty($email)) {
            $filterParts[] = "{Email} = '" . addslashes($email) . "'";
        }
        if (!empty($phone)) {
            $filterParts[] = "{Tel} = '" . addslashes($phone) . "'";
        }
        if (!empty($company)) {
            $filterParts[] = "{Name of outlet} = '" . addslashes($company) . "'";
        }

        if (empty($filterParts)) {
            $newRecords[] = $record;
            continue;
        }

        $filterFormula = "OR(" . implode(",", $filterParts) . ")";

        try {
            $existing = $client->get([
                'filterByFormula' => $filterFormula,
                'maxRecords' => 1
            ]);

            if (empty($existing['records'])) {
                $newRecords[] = $record;
            } else {
                $duplicateCount++;
            }
        } catch (Exception $e) {
            // Include the specific error in the response
            throw new Exception("Error checking record: " . $e->getMessage() . 
                              "\nRecord data: " . json_encode($record));
        }
    }
    
    echo json_encode([
        'success' => true,
        'newRecords' => $newRecords,
        'duplicates' => $duplicateCount,
        'debug' => [
            'totalRecords' => count($records),
            'newRecordsCount' => count($newRecords),
            'duplicateCount' => $duplicateCount
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'debug' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
} 