import { fetchAirtableData, deleteAirtableRecord } from './shared/airtable.js';
import { initConfig } from './config.js';

// Global variables
let records = [];

async function initializeApp() {
    try {
        // Initialize configuration first
        await initConfig();
        
        // Then proceed with your existing initialization
        const response = await fetchAirtableData();
        // Extract records from the response
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
    } catch (error) {
        console.error('Error initializing app:', error);
        console.error('Full error details:', error.stack);
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
    const tbody = document.querySelector('#dataTable tbody');
    const mobileCards = document.querySelector('.mobile-cards');
    
    // Clear existing content
    if (tbody) tbody.innerHTML = '';
    if (mobileCards) mobileCards.innerHTML = '';
    
    records.forEach(record => {
        // Render table row for desktop
        if (tbody) {
            tbody.innerHTML += createTableRow(record);
        }
        
        // Render mobile card
        if (mobileCards) {
            mobileCards.innerHTML += createMobileCard(record);
        }
    });
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