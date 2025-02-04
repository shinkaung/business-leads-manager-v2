<?php
// Fix the path resolution using __FILE__
$baseDir = dirname(dirname(__FILE__)); // Gets the root directory
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/AirtableClient.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['records']) || !is_array($data['records'])) {
        throw new Exception('Invalid request format');
    }

    $client = new AirtableClient(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME);
    
    // Process records in batches of 10 (Airtable limit)
    $records = $data['records'];
    $imported = 0;
    $batches = array_chunk($records, 10);
    
    foreach ($batches as $batch) {
        $result = $client->create(['records' => $batch]);
        if (isset($result['records'])) {
            $imported += count($result['records']);
        }
    }

    echo json_encode([
        'success' => true,
        'imported' => $imported
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}