// Configuration
const APOLLO_API_KEY = 'WcM0jRp82ZgKDc_qS4jMIg';
const AIRTABLE_API_KEY = 'pataBu2eaV0V5tEHx.2fde3b7ffdc42d856e167a7551f74f8770a41af956087fa09a2df831fd632c3c';
const AIRTABLE_BASE_ID = 'app5GPyIEcYQTRgST';
const AIRTABLE_TABLE_NAME = 'tblIL5ZHWNkMDM0sV';

// Apollo API endpoints
const APOLLO_SEARCH_URL = 'https://api.apollo.io/api/v1/people/search';
const APOLLO_BULK_ENRICH_URL = 'https://api.apollo.io/api/v1/people/bulk_match';

// Add a function to update the status on the page
function updateStatus(message) {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.innerHTML += `<div>${message}</div>`;
    }
    console.log(message); // Also log to console
}

async function searchApollo() {
    updateStatus('🔍 Starting Apollo search...');
    const searchParams = {
        api_key: APOLLO_API_KEY,
        q: {
            titles: ["F&B director", "beverage director", "beverage manager", "purchaser"],
            current_location: ["Singapore"],
            industry_tag_ids: ["5567ce9d7369643bc19c0000"]
        },
        page: 1,
        per_page: 25
    };

    try {
        updateStatus('📤 Sending request to Apollo API...');
        const response = await fetch('https://api.apollo.io/api/v1/people/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(searchParams)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Apollo API Error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        updateStatus(`✅ Found ${data.contacts?.length || 0} people in Apollo`);
        
        // Log the raw response to help debug
        console.log('Apollo API Response:', data);
        
        return transformApolloData(data.contacts || []);
    } catch (error) {
        updateStatus(`❌ Error searching Apollo: ${error.message}`);
        console.error('Full error:', error);
        return [];
    }
}

function transformApolloData(apolloPeople) {
    return apolloPeople.map(person => {
        // Combine all possible phone numbers into an array and filter out empty ones
        const phoneNumbers = [
            person.work_direct_phone,
            person.home_phone,
            person.mobile_phone,
            person.corporate_phone,
            person.other_phone,
            person.company_phone,
            person.phone
        ].filter(phone => phone); // Filter out null/undefined/empty values

        // Get the first available phone number, or empty string if none exists
        const primaryPhone = phoneNumbers.length > 0 ? phoneNumbers[0] : '';

        // Map company size to your establishment size categories
        let sizeCategory = '';
        const employeeCount = person.organization?.employee_count || 0;
        if (employeeCount <= 50) {
            sizeCategory = 'Small (<100 pax)';
        } else if (employeeCount <= 200) {
            sizeCategory = 'Medium (100-200 pax)';
        } else {
            sizeCategory = 'Large (200+ pax)';
        }

        return {
            fields: {
                'Contact Person': `${person.first_name || ''} ${person.last_name || ''}`.trim(),
                'Position': person.title || '',
                'Tel': primaryPhone,
                'Email': person.email || '',
                'Name of outlet': person.organization?.name || '',
                'Address': person.organization?.street_address || '',
                'Postal Code': person.organization?.postal_code || '',
                'Size of Establishment': sizeCategory,
                'Category (MOT - Club, Restaurant, Pub, Bistro, Cocktail Bar) (TOT - Coffeeshop, KTV)': 
                    person.organization?.industry || '',
                // Initialize other fields as empty strings
                'Style/Type of Cuisine': '',
                'Products on Tap': '',
                'Estimated Monthly Consumption (HL)': '',
                'Beer Bottle Products': '',
                'Estimated Monthly Consumption (Cartons)': '',
                'Soju Products': '',
                'Proposed Products & HL Target': '',
                'Follow Up Actions': '',
                'Remarks': ''
            }
        };
    });
}

async function importToAirtable(records) {
    updateStatus(`📥 Attempting to import ${records.length} records to Airtable...`);
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Airtable Error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        updateStatus(`✅ Successfully imported ${result.records?.length || 0} records to Airtable`);
        return result;
    } catch (error) {
        updateStatus(`❌ Error importing to Airtable: ${error.message}`);
        console.error('Full error:', error);
        throw error;
    }
}

async function runExportImport() {
    try {
        updateStatus('🚀 Starting Apollo data export process...');
        const apolloData = await searchApollo();
        
        if (apolloData.length > 0) {
            updateStatus(`📊 Transformed ${apolloData.length} records, preparing for Airtable import...`);
            const result = await importToAirtable(apolloData);
            updateStatus('✨ Export/Import process completed successfully!');
            // Log the first record as an example
            console.log('Example record:', apolloData[0]);
        } else {
            updateStatus('⚠️ No records found in Apollo');
        }
    } catch (error) {
        updateStatus(`❌ Export/Import process failed: ${error.message}`);
        console.error('Full error:', error);
    }
}

// Export functions for use in other files if needed
export {
    runExportImport,
    searchApollo,
    importToAirtable
}; 