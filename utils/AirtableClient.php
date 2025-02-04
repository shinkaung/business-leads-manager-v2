<?php
class AirtableClient {
    private $apiKey;
    private $baseId;
    private $tableName;

    public function __construct($apiKey, $baseId, $tableName) {
        $this->apiKey = $apiKey;
        $this->baseId = $baseId;
        $this->tableName = $tableName;
    }

    public function request($method, $endpoint, $data = null) {
        $url = "https://api.airtable.com/v0/{$this->baseId}/{$this->tableName}" . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$this->apiKey}",
            "Content-Type: application/json"
        ]);

        if ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if ($statusCode >= 400) {
            error_log("Airtable API error response: " . $response);
            throw new Exception("Airtable API error: " . $response);
        }

        return json_decode($response, true);
    }

    public function get($params = []) {
        $queryString = !empty($params) ? '?' . http_build_query($params) : '';
        return $this->request('GET', $queryString);
    }

    public function create($data) {
        return $this->request('POST', '', $data);
    }

    public function update($recordId, $data) {
        return $this->request('PATCH', "/$recordId", $data);
    }

    public function delete($recordId) {
        $url = "https://api.airtable.com/v0/{$this->baseId}/{$this->tableName}/{$recordId}";
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey
        ]);

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($statusCode !== 200) {
            throw new Exception('Failed to delete record from Airtable');
        }

        return json_decode($response, true);
    }
}