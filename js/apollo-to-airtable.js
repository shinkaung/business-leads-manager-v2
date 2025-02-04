import { getEndpoints } from './shared/api.js';
import { getBasePath } from './config.js';
// PapaParse is loaded globally via script tag

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
        const basePath = await getBasePath();
        const response = await fetch(`${basePath}/api/apollo/search.php`, {
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
        ].filter(phone => phone);

        // Get the first available phone number, or empty string if none exists
        let primaryPhone = phoneNumbers.length > 0 ? phoneNumbers[0] : '';
        
        if (primaryPhone) {
            primaryPhone = primaryPhone
                .replace(/'/g, '')  // Remove single quotes
                .replace(/\s+/g, '') // Remove spaces
                .trim();

            // Add +65 prefix if missing for Singapore numbers
            if (primaryPhone.match(/^[6|8|9]\d{7}$/)) {
                primaryPhone = '+65' + primaryPhone;
            }
            // Remove international numbers that aren't Singapore format
            else if (primaryPhone.match(/^\+(?!65)/)) {
                primaryPhone = '';
            }
        }

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
                'Status': 'New Lead',
                'Contact Person': `${person.first_name || ''} ${person.last_name || ''}`.trim(),
                'Position': person.title || '',
                'Tel': primaryPhone,
                'Email': person.email || '',
                'Name of outlet': person.organization?.name || '',
                'Address': person.organization?.street_address || '',
                'Postal Code': person.organization?.postal_code || '',
                'Size of Establishment': sizeCategory,
                'Category': person.organization?.industry || '',
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
    updateStatus(`📥 Starting import of ${records.length} records to Airtable...`);
    try {
        const endpoints = await getEndpoints();
        
        // Check for duplicates first
        const response = await fetch(endpoints.LEADS_CHECK_DUPLICATES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Duplicate check failed: ${JSON.stringify(errorData)}`);
        }

        const { newRecords, duplicates } = await response.json();
        
        if (duplicates > 0) {
            updateStatus(`ℹ️ Found ${duplicates} existing records that will be skipped`);
        }

        if (newRecords.length === 0) {
            updateStatus('ℹ️ No new records to import');
            return 0;
        }

        // Import new records
        const importResponse = await fetch(endpoints.LEADS_BULK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: newRecords })
        });

        if (!importResponse.ok) {
            const errorData = await importResponse.json();
            throw new Error(`Import failed: ${JSON.stringify(errorData)}`);
        }

        const result = await importResponse.json();
        updateStatus(`🎉 Import complete! New records imported: ${result.imported}, Duplicates skipped: ${duplicates}`);
        return result.imported;
    } catch (error) {
        updateStatus(`❌ Import failed: ${error.message}`);
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
            console.log('Example record:', apolloData[0]);
        } else {
            updateStatus('⚠️ No records found in Apollo');
        }
    } catch (error) {
        updateStatus(`❌ Export/Import process failed: ${error.message}`);
        console.error('Full error:', error);
    }
}

// Field mappings configuration
const FIELD_MAPPINGS = {
    "Title": "Position",
    "Work Direct Phone": "Tel",
    "Home Phone": "Tel",
    "Mobile Phone": "Tel",
    "Corporate Phone": "Tel",
    "Other Phone": "Tel",
    "Company Phone": "Tel",
    "Email": "Email",
    "Company": "Name of outlet",
    "Company Address": "Address",
    "# Employees": "Size of Establishment",
    "Industry": "Category"
};

function transformApolloCSVData(csvRecord) {
    // Helper function to get value from mapped fields
    const getMappedValue = (targetField) => {
        const sourceFields = Object.entries(FIELD_MAPPINGS)
            .filter(([_, target]) => target === targetField)
            .map(([source, _]) => source);

        for (const field of sourceFields) {
            // Handle null, undefined, and convert numbers to strings
            if (csvRecord[field] != null && csvRecord[field] !== '') {
                const value = String(csvRecord[field]).trim();
                if (value) return value;
            }
        }
        return '';
    };

    // Handle Contact Person
    const contactPerson = csvRecord['Contact Person'] || 
        `${csvRecord['First Name'] || ''} ${csvRecord['Last Name'] || ''}`.trim();

    // Handle Phone Numbers
    let phoneNumber = getMappedValue('Tel');
    if (phoneNumber) {
        // Clean phone number format
        phoneNumber = phoneNumber
            .replace(/'/g, '')  // Remove single quotes
            .replace(/\s+/g, '') // Remove spaces
            .trim();

        // Add +65 prefix if missing for Singapore numbers
        if (phoneNumber.match(/^[6|8|9]\d{7}$/)) {
            phoneNumber = '+65' + phoneNumber;
        }
        // Format existing Singapore numbers
        else if (phoneNumber.match(/^\+65[6|8|9]\d{7}$/)) {
            // Already correctly formatted
        }
        // Remove international numbers that aren't Singapore format
        else if (phoneNumber.match(/^\+(?!65)/)) {
            phoneNumber = '';
        }
    }

    // Handle Address and Postal Code
    let address = getMappedValue('Address');
    let postalCode = '';
    
    if (address) {
        // Skip if address is a URL or LinkedIn
        if (address.includes('http') || address.toLowerCase().includes('linkedin')) {
            address = '';
        } 
        // Skip if address is just a generic location
        else if (['singapore', 'milan', 'culinary', 'bars'].includes(address.toLowerCase().trim())) {
            address = '';
        }
        // Process valid address
        else {
            // Extract postal code
            const postalMatch = address.match(/(\d{6}|\d{5})/);
            if (postalMatch) {
                postalCode = postalMatch[1];
                // Remove postal code from address
                address = address.replace(postalMatch[1], '');
            }
            
            // Clean up address format
            address = address
                .replace(/,\s*Singapore\s*,\s*Singapore/i, ', Singapore')
                .replace(/,\s*Singapore$/i, '')
                .replace(/\s+/g, ' ')
                .trim();
        }
    }

    // Handle Size of Establishment
    let sizeCategory = '';
    const employeeCount = parseInt(csvRecord['# Employees'] || '0');
    if (employeeCount <= 50) {
        sizeCategory = 'Small (<100 pax)';
    } else if (employeeCount <= 200) {
        sizeCategory = 'Medium (100-200 pax)';
    } else {
        sizeCategory = 'Large (200+ pax)';
    }

    return {
        fields: {
            'Status': 'New Lead',
            'Contact Person': contactPerson,
            'Position': getMappedValue('Position'),
            'Tel': phoneNumber,
            'Email': getMappedValue('Email'),
            'Name of outlet': getMappedValue('Name of outlet'),
            'Address': address,
            'Postal Code': postalCode,
            'Size of Establishment': sizeCategory,
            'Category': getMappedValue('Category'),
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
}

async function handleCSVImport(csvFile) {
    updateStatus('📑 Processing CSV file...');
    try {
        const text = await csvFile.text();
        
        // Use global Papa object for parsing
        const parsedData = window.Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // This will automatically convert numbers and booleans
            transformHeader: header => header.trim(),
            transform: value => {
                if (value === null || value === undefined) return '';
                return String(value).trim();
            }
        });

        if (parsedData.errors.length > 0) {
            console.warn('CSV parsing warnings:', parsedData.errors);
        }

        console.log('Parsed CSV Data:', parsedData);
        
        const records = parsedData.data
            .filter(row => Object.values(row).some(value => value)) // Skip completely empty rows
            .map(record => {
                console.log('Processing record:', record);
                const transformed = transformApolloCSVData(record);
                console.log('Transformed record:', transformed);
                return transformed;
            });

        updateStatus(`✅ Processed ${records.length} records from CSV`);
        return records;
    } catch (error) {
        updateStatus(`❌ Error processing CSV: ${error.message}`);
        throw error;
    }
}

export {
    handleCSVImport,
    transformApolloCSVData,
    importToAirtable,
    runExportImport
};