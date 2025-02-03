import { fetchAirtableData, deleteAirtableRecord } from './shared/airtable.js';
import { initConfig } from './config.js';

// Global variables
let records = [];

async function initializeApp() {
    try {
        // Show loading bar
        const loadingBar = document.getElementById('loadingBar');
        if (loadingBar) loadingBar.style.display = 'block';

        // Initialize configuration first
        await initConfig();
        
        // Initialize area filter
        initializeAreaFilter();
        
        // Then proceed with data fetching
        const response = await fetchAirtableData();
        records = response.records || [];
        console.log('Fetched records:', records);
        
        if (!records || records.length === 0) {
            console.error('No records returned from Airtable');
            return;
        }
        
        // Render the records
        renderRecords(records);
        
        // Update total records count
        updateRecordCount(records.length);
        
        // Setup search functionality
        setupSearch();

        // Setup area filter
        const areaFilter = document.getElementById('areaFilter');
        if (areaFilter) {
            areaFilter.addEventListener('change', () => {
                renderRecords(records);
            });
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    } finally {
        // Hide loading bar
        const loadingBar = document.getElementById('loadingBar');
        if (loadingBar) loadingBar.style.display = 'none';
    }
}

function createTableRow(record) {
    const statusClass = getStatusClass(record.fields['Status']);
    const statusText = record.fields['Status'] || 'New Lead';
    
    return `
        <tr class="${statusClass}">
            <td>${record.fields['Contact Person'] || ''}</td>
            <td>${record.fields['Position'] || ''}</td>
            <td>${record.fields['Tel'] || ''}</td>
            <td>${record.fields['Email'] || ''}</td>
            <td>${record.fields['Name of outlet'] || ''}</td>
            <td>${record.fields['Address'] || ''}</td>
            <td>${record.fields['Postal Code'] || ''}</td>
            <td>${record.fields['Category'] || ''}</td>
            <td>${record.fields['Style/Type of Cuisine'] || ''}</td>
            <td>${record.fields['Size of Establishment'] || ''}</td>
            <td>${record.fields['Products on Tap'] || ''}</td>
            <td>${record.fields['Estimated Monthly Consumption (HL)'] || ''}</td>
            <td>${record.fields['Beer Bottle Products'] || ''}</td>
            <td>${record.fields['Estimated Monthly Consumption (Cartons)'] || ''}</td>
            <td>${record.fields['Soju Products'] || ''}</td>
            <td>${record.fields['Proposed Products & HL Target'] || ''}</td>
            <td>${record.fields['Follow Up Actions'] || ''}</td>
            <td>${record.fields['Remarks'] || ''}</td>
            <td>
                <span class="status-badge ${getStatusBadgeClass(record.fields['Status'])}">
                    ${statusText}
                </span>
            </td>
            <td>
                <button onclick="editLead('${record.id}')" class="btn btn-sm btn-primary">
                    <i class="bi bi-pencil"></i>
                </button>
                <button onclick="deleteLead('${record.id}')" class="btn btn-sm btn-danger">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

function getStatusClass(status) {
    // Convert to lowercase and trim for consistent comparison
    const normalizedStatus = (status || '').toLowerCase().trim();
    
    switch(normalizedStatus) {
        case 'qualified':
            return 'status-qualified';
        case 'existing customer':
            return 'status-existing';
        case 'new lead':
            return 'status-new';
        default:
            return ''; // No special styling for unknown status
    }
}

function getStatusBadgeClass(status) {
    // Convert to lowercase and trim for consistent comparison
    const normalizedStatus = (status || '').toLowerCase().trim();
    
    switch(normalizedStatus) {
        case 'qualified':
            return 'status-badge-qualified';
        case 'existing customer':
            return 'status-badge-existing';
        case 'new lead':
            return 'status-badge-new';
        default:
            return 'status-badge-new'; // Default to new lead if status is unknown
    }
}

function createMobileCard(record) {
    const statusClass = getStatusClass(record.fields['Status']);
    const statusText = record.fields['Status'] || '';
    
    return `
        <div class="mobile-card ${statusClass}" data-record-id="${record.id}">
            <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${record.fields['Name of outlet'] || 'N/A'}</h5>
                    <span class="status-badge ${getStatusBadgeClass(record.fields['Status'])}">
                        ${statusText}
                    </span>
                </div>
                <p class="mb-0">${record.fields['Contact Person'] || 'N/A'} - ${record.fields['Position'] || 'N/A'}</p>
            </div>

            <div class="card-body">
                <div class="contact-info">
                    <div class="info-item">
                        <strong>Tel:</strong>
                        <span>${record.fields['Tel'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Email:</strong>
                        <span>${record.fields['Email'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Address:</strong>
                        <span>${record.fields['Address'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Category:</strong>
                        <span>${record.fields['Category'] || 'N/A'}</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <button onclick="viewDetails('${record.id}')" class="btn btn-secondary view-details-btn">
                        View Details
                    </button>
                    <button onclick="editLead('${record.id}')" class="btn btn-primary">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteLead('${record.id}')" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>

                <div class="details-section" style="display: none;">
                    <hr>
                    <div class="details-grid">
                        <div class="detail-item">
                            <strong>Contact Person:</strong>
                            <span>${record.fields['Contact Person'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Position:</strong>
                            <span>${record.fields['Position'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Tel:</strong>
                            <span>${record.fields['Tel'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Email:</strong>
                            <span>${record.fields['Email'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Name of outlet:</strong>
                            <span>${record.fields['Name of outlet'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Address:</strong>
                            <span>${record.fields['Address'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Postal Code:</strong>
                            <span>${record.fields['Postal Code'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Category:</strong>
                            <span>${record.fields['Category'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Style/Type of Cuisine:</strong>
                            <span>${record.fields['Style/Type of Cuisine'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Size of Establishment:</strong>
                            <span>${record.fields['Size of Establishment'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Products on Tap:</strong>
                            <span>${record.fields['Products on Tap'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Estimated Monthly Consumption (HL):</strong>
                            <span>${record.fields['Estimated Monthly Consumption (HL)'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Beer Bottle Products:</strong>
                            <span>${record.fields['Beer Bottle Products'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Estimated Monthly Consumption (Cartons):</strong>
                            <span>${record.fields['Estimated Monthly Consumption (Cartons)'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Soju Products:</strong>
                            <span>${record.fields['Soju Products'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Proposed Products & HL Target:</strong>
                            <span>${record.fields['Proposed Products & HL Target'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Follow Up Actions:</strong>
                            <span>${record.fields['Follow Up Actions'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Remarks:</strong>
                            <span>${record.fields['Remarks'] || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderRecords(records) {
    const searchInput = document.getElementById('searchInput');
    const areaFilter = document.getElementById('areaFilter');
    
    let filteredRecords = [...records];
    
    // Apply area filter if selected
    if (areaFilter && areaFilter.value) {
        filteredRecords = filterByPostalDistrict(filteredRecords, areaFilter.value);
    }
    
    // Apply search filter if there's a search term
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredRecords = filteredRecords.filter(record => 
            (record.fields['Contact Person']?.toLowerCase().includes(searchTerm) ||
             record.fields['Name of outlet']?.toLowerCase().includes(searchTerm) ||
             record.fields['Address']?.toLowerCase().includes(searchTerm))
        );
    }
    
    const tableBody = document.querySelector('.table tbody');
    if (!tableBody) return;
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Add filtered records
    filteredRecords.forEach(record => {
        tableBody.innerHTML += createTableRow(record);
    });
    
    // Update total records count
    updateRecordCount(filteredRecords.length);
}

function updateRecordCount(count) {
    const countElement = document.querySelector('.records-counter strong');
    if (countElement) {
        countElement.textContent = count;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredRecords = records.filter(record => 
                record.fields['Contact Person']?.toLowerCase().includes(searchTerm) ||
                record.fields['Name of outlet']?.toLowerCase().includes(searchTerm) ||
                record.fields['Address']?.toLowerCase().includes(searchTerm)
            );
            renderRecords(filteredRecords);
            updateRecordCount(filteredRecords.length);
        });
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally
window.showDetails = function(recordId) {
    const record = records.find(r => r.id === recordId);
    if (record) {
        // Implement modal or detailed view here
        console.log('Full record details:', record);
    }
};

function editLead(id) {
    const returnTo = 'index';
    getBasePath().then(basePath => {
        window.location.href = `${basePath}/pages/edit.html?id=${id}&returnTo=${returnTo}`;
    });
}

// Make editLead available globally
window.editLead = editLead;

async function loadRecords() {
    const tableBody = document.querySelector('.table tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    // Show loading bar
    const loadingBar = document.getElementById('loadingBar');
    if (loadingBar) loadingBar.style.display = 'block';

    try {
        const response = await fetchAirtableData();
        // Extract records from the response
        const records = response.records || [];
        
        if (!records || records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="19">No records found</td></tr>';
            return;
        }

        // Clear existing content
        tableBody.innerHTML = '';

        // Add each record
        records.forEach(record => {
            tableBody.innerHTML += createTableRow(record);
        });

        // Update total records count
        const totalRecordsElement = document.querySelector('[data-total-records]');
        if (totalRecordsElement) {
            totalRecordsElement.textContent = `Total Records: ${records.length}`;
        }

    } catch (error) {
        console.error('Error loading records:', error);
        tableBody.innerHTML = '<tr><td colspan="19">Error loading records</td></tr>';
    } finally {
        // Hide loading bar
        if (loadingBar) loadingBar.style.display = 'none';
    }
}

// Make sure these functions are available globally
window.editLead = editLead;
window.deleteLead = deleteLead;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadRecords);

async function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this record?')) {
        return;
    }

    try {
        await deleteAirtableRecord(id);
        alert('Record deleted successfully');
        // Reload the table
        await loadRecords();
    } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error deleting record: ' + error.message);
    }
}

// Add the toggle details function
window.toggleDetails = function(button) {
    const detailsSection = button.closest('.card-body').querySelector('.details-section');
    if (detailsSection) {
        detailsSection.style.display = detailsSection.style.display === 'none' ? 'block' : 'none';
    }
};

// Add this function definition
window.viewDetails = function(recordId) {
    const card = document.querySelector(`.mobile-card[data-record-id="${recordId}"]`);
    if (card) {
        const detailsSection = card.querySelector('.details-section');
        if (detailsSection) {
            detailsSection.style.display = detailsSection.style.display === 'none' ? 'block' : 'none';
        }
    }
};

function getPostalInfo(postalCode) {
    if (!postalCode) return { district: '', sector: '', isValid: false };
    
    // Convert to string and clean up
    const code = postalCode.toString().trim();
    
    // Validate Singapore postal code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
        return { district: '', sector: '', isValid: false };
    }
    
    const sector = code.substring(0, 2);
    
    // Map sectors to their correct districts
    const sectorToDistrict = {
        // MOT1/K1 sectors
        '01': 'D01', '02': 'D01', '03': 'D01', '04': 'D01', '05': 'D01', 
        '06': 'D06', '17': 'D07', '18': 'D07', '19': 'D08', '20': 'D08', '21': 'D08',
        
        // MOT2/K2 sectors
        '07': 'D02', '08': 'D02', '10': 'D03', '14': 'D03', '15': 'D03', 
        '16': 'D04', '24': 'D10', '25': 'D10', '26': 'D10', '27': 'D10',
        
        // MOT3/K3 sectors
        '38': 'D14', '39': 'D14', '40': 'D14', '41': 'D14',
        '42': 'D15', '43': 'D15', '44': 'D15', '45': 'D15',
        '46': 'D16', '47': 'D16', '48': 'D16', '49': 'D17',
        '50': 'D17', '51': 'D17', '52': 'D18', '53': 'D19',
        '54': 'D19', '55': 'D19', '81': 'D17', '82': 'D19',
        
        // MOT4/K4 sectors
        '11': 'D05', '12': 'D05', '13': 'D05', '22': 'D09',
        '28': 'D11', '29': 'D11', '30': 'D11',
        '58': 'D21', '59': 'D21', '60': 'D22', '61': 'D22',
        '62': 'D22', '63': 'D22', '64': 'D22', '65': 'D23',
        '66': 'D23', '67': 'D23', '68': 'D23', '69': 'D24',
        '70': 'D24', '71': 'D24',
        
        // MOT5/K5 sectors
        '31': 'D12', '32': 'D12', '33': 'D13', '34': 'D13',
        '35': 'D13', '36': 'D13', '37': 'D13', '56': 'D20',
        '57': 'D20', '72': 'D25', '73': 'D25', '75': 'D25',
        '76': 'D26', '77': 'D26', '78': 'D26', '79': 'D27',
        '80': 'D27'
    };

    // Special handling for sector 09
    if (sector === '09') {
        const thirdDigit = parseInt(code.charAt(2));
        const district = thirdDigit < 5 ? '09A' : '09B';
        return { district, sector, isValid: true };
    }

    // Special handling for sector 23
    if (sector === '23') {
        const thirdDigit = code.charAt(2).toUpperCase();
        if (thirdDigit === 'A') {
            return { district: 'D10', sector: '23', isValid: true };
        } else if (thirdDigit === 'B') {
            return { district: 'D09', sector: '23', isValid: true };
        }
    }

    // Get district from mapping
    const district = sectorToDistrict[sector];
    if (!district) {
        return { district: '', sector, isValid: false };
    }
    
    return { 
        district,
        sector,
        isValid: true
    };
}

function isAddressInSingapore(address) {
    if (!address) return false;
    const lowercaseAddress = address.toLowerCase();
    
    // Check if address contains foreign country names
    const foreignIndicators = ['italy', 'germany', 'malaysia', 'china', 'japan', 
                             'korea', 'thailand', 'vietnam', 'indonesia'];
    
    return !foreignIndicators.some(country => lowercaseAddress.includes(country));
}

function isPostalCodeInArea(postalInfo, areaConfig) {
    const { district, sector, isValid } = postalInfo;
    
    if (!isValid) return false;
    
    // Special handling for sector 06
    if (sector === '06') {
        // Only include 06 if it's explicitly in the districts list
        return areaConfig.districts.includes('D06');
    }
    
    // Check if the district matches
    if (areaConfig.districts.includes(district)) {
        return true;
    }
    
    // Check if the sector matches
    if (areaConfig.sectors.includes(sector)) {
        return true;
    }
    
    return false;
}

function filterByPostalDistrict(records, selectedArea) {
    if (!selectedArea) return records;
    
    const areaMapping = {
        'MOT1/K1': {
            districts: ['D01', 'D06', 'D07', 'D08', '09A'],
            sectors: ['01', '02', '03', '04', '05', '06', '17', '18', '19', '20', '21']
        },
        'MOT2/K2': {
            districts: ['D02', 'D03', 'D04', '09B', 'D10'],
            sectors: ['07', '08', '09', '10', '14', '15', '16', '23', '24', '25', '26', '27']
        },
        'MOT3/K3': {
            districts: ['D14', 'D15', 'D16', 'D17', 'D18', 'D19'],
            sectors: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', 
                     '49', '50', '51', '52', '53', '54', '55', '81', '82']
        },
        'MOT4/K4': {
            districts: ['D05', 'D09', 'D11', 'D21', 'D22', 'D23', 'D24'],
            sectors: ['11', '12', '13', '22', '28', '29', '30', '58', '59', '60', 
                     '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71']
        },
        'MOT5/K5': {
            districts: ['09B', 'D12', 'D13', 'D20', 'D25', 'D26', 'D27'],
            sectors: ['31', '32', '33', '34', '35', '36', '37', '56', '57', 
                     '72', '73', '75', '76', '77', '78', '79', '80']
        }
    };

    return records.filter(record => {
        const postalCode = record.fields['Postal Code'];
        const address = record.fields['Address'];

        // Skip records with non-Singapore addresses
        if (!isAddressInSingapore(address)) {
            return false;
        }

        const postalInfo = getPostalInfo(postalCode);
        const areaConfig = areaMapping[selectedArea];
        
        if (!areaConfig) return false;
        
        return isPostalCodeInArea(postalInfo, areaConfig);
    });
}

function initializeAreaFilter() {
    const areaFilter = document.getElementById('areaFilter');
    if (!areaFilter) return;
    
    const areaOptions = [
        { value: '', label: 'All Areas' },
        { value: 'MOT1/K1', label: 'MOT1/K1 - York Hsiung (D1, D6-D8, 09A) [Sectors: 01-06, 17-21]' },
        { value: 'MOT2/K2', label: 'MOT2/K2 - Steven Lee (D2-D4, 09B, D10) [Sectors: 07-10, 14-16, 24-27]' },
        { value: 'MOT3/K3', label: 'MOT3/K3 - Gordon Foo/Wyman (D14-D19) [Sectors: 38-55, 81-82]' },
        { value: 'MOT4/K4', label: 'MOT4/K4 - Ivan (D5, D9, D11, D21-24) [Sectors: 11-13, 22, 28-30, 58-71]' },
        { value: 'MOT5/K5', label: 'MOT5/K5 - Vacant (09B, D12-D13, D20, D25-27) [Sectors: 31-37, 56-57, 72-80]' }
    ];
    
    areaFilter.innerHTML = areaOptions.map(option => 
        `<option value="${option.value}">${option.label}</option>`
    ).join('');
}