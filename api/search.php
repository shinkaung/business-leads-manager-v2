<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/AirtableClient.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $searchTerm = $_GET['q'] ?? '';
        $client = new AirtableClient(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME);
        
        $filter = "OR(" .
            "SEARCH(LOWER('{$searchTerm}'), LOWER({Contact Person}))," .
            "SEARCH(LOWER('{$searchTerm}'), LOWER({Name of outlet}))," .
            "SEARCH(LOWER('{$searchTerm}'), LOWER({Category}))" .
        ")";
        
        $result = $client->get(['filterByFormula' => $filter]);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}