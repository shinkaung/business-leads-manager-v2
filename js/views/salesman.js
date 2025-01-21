import { fetchAirtableData } from '../shared/airtable.js';

document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth < 768;
    let leadsData = []; // Store the leads data

    async function loadLeads() {
        try {
            const response = await fetchAirtableData();
            leadsData = response.records || [];
            renderView();
        } catch (error) {
            console.error('Error loading leads:', error);
            showError('Failed to load leads');
        }
    }

    function renderView() {
        const tableBody = document.querySelector('.table tbody');
        const leadsList = document.querySelector('.leads-list');

        if (!leadsData || leadsData.length === 0) {
            showNoData();
            return;
        }

        if (isMobile && leadsList) {
            leadsList.innerHTML = leadsData.map(createLeadCard).join('');
        } else if (tableBody) {
            tableBody.innerHTML = leadsData.map(createTableRow).join('');
        }
    }

    function createTableRow(lead) {
        const statusClass = getStatusClass(lead.fields['Status']);
        const statusText = lead.fields['Status'] || 'New Lead';
        
        return `
            <tr class="${statusClass}">
                <td>${lead.fields['Contact Person'] || ''}</td>
                <td>${lead.fields['Position'] || ''}</td>
                <td>${lead.fields['Tel'] || ''}</td>
                <td>${lead.fields['Email'] || ''}</td>
                <td>${lead.fields['Name of outlet'] || ''}</td>
                <td>${lead.fields['Address'] || ''}</td>
                <td>${lead.fields['Postal Code'] || ''}</td>
                <td>${lead.fields['Category'] || ''}</td>
                <td>${lead.fields['Style/Type of Cuisine'] || ''}</td>
                <td>${lead.fields['Size of Establishment'] || ''}</td>
                <td>${lead.fields['Products on Tap'] || ''}</td>
                <td>${lead.fields['Estimated Monthly Consumption (HL)'] || ''}</td>
                <td>${lead.fields['Beer Bottle Products'] || ''}</td>
                <td>${lead.fields['Estimated Monthly Consumption (Cartons)'] || ''}</td>
                <td>${lead.fields['Soju Products'] || ''}</td>
                <td>${lead.fields['Proposed Products & HL Target'] || ''}</td>
                <td>${lead.fields['Follow Up Actions'] || ''}</td>
                <td>${lead.fields['Remarks'] || ''}</td>
                <td>
                    <span class="status-badge ${getStatusBadgeClass(lead.fields['Status'])}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <button onclick="editLead('${lead.id}')" class="edit-btn">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    function createLeadCard(lead) {
        const statusClass = getStatusClass(lead.fields['Status']);
        return `
            <div class="lead-card ${statusClass}" data-record-id="${lead.id}">
                <div class="lead-card-header">
                    <span class="status-badge ${getStatusBadgeClass(lead.fields['Status'])}">
                        ${lead.fields['Status'] || 'New Lead'}
                    </span>
                    <h4>${lead.fields['Name of outlet'] || 'Unnamed Outlet'}</h4>
                </div>
                <div class="lead-card-content">
                    <p><strong>Contact:</strong> ${lead.fields['Contact Person'] || '-'}</p>
                    <p><strong>Position:</strong> ${lead.fields['Position'] || '-'}</p>
                    <p><i class="bi bi-telephone"></i> ${lead.fields['Tel'] || '-'}</p>
                    <p><i class="bi bi-envelope"></i> ${lead.fields['Email'] || '-'}</p>
                    <p><i class="bi bi-geo-alt"></i> ${lead.fields['Address'] || '-'}</p>
                    <p><strong>Postal Code:</strong> ${lead.fields['Postal Code'] || '-'}</p>
                </div>
                <div class="details-section" style="display: none;">
                    <hr>
                    <div class="details-grid">
                        <p><strong>Category:</strong> ${lead.fields['Category'] || '-'}</p>
                        <p><strong>Style/Cuisine:</strong> ${lead.fields['Style/Type of Cuisine'] || '-'}</p>
                        <p><strong>Size:</strong> ${lead.fields['Size of Establishment'] || '-'}</p>
                        <p><strong>Products on Tap:</strong> ${lead.fields['Products on Tap'] || '-'}</p>
                        <p><strong>Monthly HL:</strong> ${lead.fields['Estimated Monthly Consumption (HL)'] || '-'}</p>
                        <p><strong>Bottle Products:</strong> ${lead.fields['Beer Bottle Products'] || '-'}</p>
                        <p><strong>Monthly Cartons:</strong> ${lead.fields['Estimated Monthly Consumption (Cartons)'] || '-'}</p>
                        <p><strong>Soju Products:</strong> ${lead.fields['Soju Products'] || '-'}</p>
                        <p><strong>Target:</strong> ${lead.fields['Proposed Products & HL Target'] || '-'}</p>
                        <p><strong>Follow Up:</strong> ${lead.fields['Follow Up Actions'] || '-'}</p>
                        <p><strong>Remarks:</strong> ${lead.fields['Remarks'] || '-'}</p>
                    </div>
                </div>
                <div class="lead-card-actions">
                    <button onclick="viewDetails('${lead.id}')" class="btn btn-secondary btn-sm">
                        <i class="bi bi-eye"></i> View Details
                    </button>
                    <button onclick="editLead('${lead.id}')" class="btn btn-secondary btn-sm">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                </div>
            </div>
        `;
    }

    function getStatusClass(status) {
        switch(status) {
            case 'Qualified':
                return 'status-qualified';
            case 'Existing Customer':
                return 'status-existing';
            default:
                return 'status-new';
        }
    }

    function getStatusBadgeClass(status) {
        switch(status) {
            case 'Qualified':
                return 'status-badge-qualified';
            case 'Existing Customer':
                return 'status-badge-existing';
            default:
                return 'status-badge-new';
        }
    }

    function showNoData() {
        const tableBody = document.querySelector('.table tbody');
        const leadsList = document.querySelector('.leads-list');
        
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No leads found</td></tr>';
        }
        if (leadsList) {
            leadsList.innerHTML = '<div class="no-leads">No leads found</div>';
        }
    }

    function showError(message) {
        const tableBody = document.querySelector('.table tbody');
        const leadsList = document.querySelector('.leads-list');
        
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">${message}</td></tr>`;
        }
        if (leadsList) {
            leadsList.innerHTML = `<div class="error text-danger">${message}</div>`;
        }
    }

    // Setup search functionality
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredLeads = leadsData.filter(lead => 
                (lead.fields['Contact Person'] || '').toLowerCase().includes(searchTerm) ||
                (lead.fields['Name of outlet'] || '').toLowerCase().includes(searchTerm)
            );
            leadsData = filteredLeads;
            renderView();
        });
    }

    // Make editLead available globally
    window.editLead = function(id) {
        const returnTo = 'salesman';
        window.location.href = `/business-leads-manager/pages/edit.html?id=${id}&returnTo=${returnTo}`;
    };

    // Make viewDetails function globally available
    window.viewDetails = function(recordId) {
        const card = document.querySelector(`.lead-card[data-record-id="${recordId}"]`);
        if (card) {
            const detailsSection = card.querySelector('.details-section');
            if (detailsSection) {
                const isHidden = detailsSection.style.display === 'none';
                detailsSection.style.display = isHidden ? 'block' : 'none';
            }
        }
    };

    // Initial load
    loadLeads();

    // Handle window resize
    window.addEventListener('resize', () => {
        if ((window.innerWidth < 768 && !isMobile) || 
            (window.innerWidth >= 768 && isMobile)) {
            location.reload();
        }
    });
}); 