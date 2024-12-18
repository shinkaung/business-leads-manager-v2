import { fetchAirtableData, updateAirtableRecord } from './airtable.js';
import { setupSearch, filterRecords, currentSearchTerm } from './search.js';

let lastSearchTerm = '';

async function displayData(records, highlightId = null) {
    console.log('DisplayData called with highlightId:', highlightId);
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';

    records.forEach(record => {
        const fields = record.fields;
        const row = document.createElement('tr');
        
        // First set the innerHTML
        row.innerHTML = `
            <td>${fields['Contact Person'] || ''}</td>
            <td>${fields['Position'] || ''}</td>
            <td>${fields['Tel'] || ''}</td>
            <td>${fields['Email'] || ''}</td>
            <td>${fields['Name of outlet'] || ''}</td>
            <td>${fields['Address'] || ''}</td>
            <td>${fields['Postal Code'] || ''}</td>
            <td>${fields['Category'] || ''}</td>
            <td>${fields['Style/Type of Cuisine'] || ''}</td>
            <td>${fields['Size of Establishment'] || ''}</td>
            <td>${fields['Products on Tap'] || ''}</td>
            <td>${fields['Estimated Monthly Consumption (HL)'] || ''}</td>
            <td>${fields['Beer Bottle Products'] || ''}</td>
            <td>${fields['Estimated Monthly Consumption (Cartons)'] || ''}</td>
            <td>${fields['Soju Products'] || ''}</td>
            <td>${fields['Proposed Products & HL Target'] || ''}</td>
            <td>${fields['Follow Up Actions'] || ''}</td>
            <td>${fields['Remarks'] || ''}</td>
            <td>
                <button onclick="editRecord('${record.id}')" class="btn btn-sm btn-primary">Edit</button>
            </td>
        `;
        
        // Then apply highlighting if needed
        if (highlightId && record.id === highlightId) {
            console.log('Found matching record to highlight:', record.id);
            row.id = `record-${record.id}`;
            
            // Apply styles to the row and all its cells
            row.style.backgroundColor = '#fff3cd';
            row.style.color = '#856404';
            row.style.borderLeft = '6px solid #ffeeba';
            
            // Apply styles to all cells in the row
            const cells = row.getElementsByTagName('td');
            Array.from(cells).forEach(cell => {
                cell.style.backgroundColor = '#fff3cd';
                cell.style.color = '#856404';
                cell.style.transition = 'all 0.3s ease';
            });
            
            // Force reflow
            row.offsetHeight;
            
            // Add animation
            const animation = row.animate([
                { 
                    backgroundColor: '#fff3cd',
                    transform: 'translateX(10px)'
                },
                { 
                    backgroundColor: '#fff3cd',
                    transform: 'translateX(0)'
                }
            ], {
                duration: 1000,
                iterations: 1
            });
            
            // Remove highlight after animation (increased to 5 seconds)
            animation.onfinish = () => {
                setTimeout(() => {
                    row.style.backgroundColor = '';
                    row.style.color = '';
                    row.style.borderLeft = '';
                    
                    // Remove styles from cells
                    Array.from(cells).forEach(cell => {
                        cell.style.backgroundColor = '';
                        cell.style.color = '';
                    });
                }, 5000);
            };
        }
        
        tableBody.appendChild(row);
    });

    if (highlightId) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const highlightedRow = document.getElementById(`record-${highlightId}`);
        if (highlightedRow) {
            console.log('Scrolling to highlighted row');
            const tableContainer = document.querySelector('.table-responsive');
            const headerHeight = document.querySelector('thead').offsetHeight;
            
            tableContainer.scrollTo({
                top: highlightedRow.offsetTop - headerHeight - 50,
                behavior: 'smooth'
            });
        }
    }

    const recordCount = document.getElementById('recordCount');
    if (recordCount) {
        recordCount.textContent = `Total Records: ${records.length}`;
    }
}

export { displayData };

async function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get('highlight');
    
    const records = await fetchAirtableData();
    
    // If we have a highlight parameter, display with highlight
    if (highlightId) {
        console.log('Highlighting record:', highlightId);
        displayData(records, highlightId);
        
        // Clear the URL parameter without refreshing the page
        window.history.replaceState({}, '', window.location.pathname);
    } else {
        displayData(records);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupSearch();
});

window.editRecord = async function(recordId) {
    // Remove any existing modal first
    const existingModal = document.getElementById('editModal');
    if (existingModal) {
        existingModal.remove();
    }

    const records = await fetchAirtableData();
    const record = records.find(r => r.id === recordId);
    
    if (!record) {
        alert('Record not found');
        return;
    }

    // Create a form dynamically
    const form = document.createElement('form');
    form.id = 'editModalForm';
    
    // Rest of your modal HTML remains the same
    form.innerHTML = `
        <div class="modal fade" id="editModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Record</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Contact Person</label>
                                <input type="text" class="form-control" name="Contact Person" value="${record.fields['Contact Person'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Position</label>
                                <input type="text" class="form-control" name="Position" value="${record.fields['Position'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Tel</label>
                                <input type="tel" class="form-control" name="Tel" value="${record.fields['Tel'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="Email" value="${record.fields['Email'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Name of outlet</label>
                                <input type="text" class="form-control" name="Name of outlet" value="${record.fields['Name of outlet'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Address</label>
                                <input type="text" class="form-control" name="Address" value="${record.fields['Address'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Postal Code</label>
                                <input type="text" class="form-control" name="Postal Code" value="${record.fields['Postal Code'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Category</label>
                                <input type="text" class="form-control" name="Category" value="${record.fields['Category'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Style/Type of Cuisine</label>
                                <input type="text" class="form-control" name="Style/Type of Cuisine" value="${record.fields['Style/Type of Cuisine'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Size of Establishment</label>
                                <input type="text" class="form-control" name="Size of Establishment" value="${record.fields['Size of Establishment'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Products on Tap</label>
                                <input type="text" class="form-control" name="Products on Tap" value="${record.fields['Products on Tap'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Estimated Monthly Consumption (HL)</label>
                                <input type="text" class="form-control" name="Estimated Monthly Consumption (HL)" value="${record.fields['Estimated Monthly Consumption (HL)'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Beer Bottle Products</label>
                                <input type="text" class="form-control" name="Beer Bottle Products" value="${record.fields['Beer Bottle Products'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Estimated Monthly Consumption (Cartons)</label>
                                <input type="text" class="form-control" name="Estimated Monthly Consumption (Cartons)" value="${record.fields['Estimated Monthly Consumption (Cartons)'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Soju Products</label>
                                <input type="text" class="form-control" name="Soju Products" value="${record.fields['Soju Products'] || ''}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Proposed Products & HL Target</label>
                                <input type="text" class="form-control" name="Proposed Products & HL Target" value="${record.fields['Proposed Products & HL Target'] || ''}">
                            </div>
                            <div class="col-12">
                                <label class="form-label">Follow Up Actions</label>
                                <textarea class="form-control" name="Follow Up Actions" rows="3">${record.fields['Follow Up Actions'] || ''}</textarea>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Remarks</label>
                                <textarea class="form-control" name="Remarks" rows="3">${record.fields['Remarks'] || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add form submit handler
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const updatedFields = {};
        formData.forEach((value, key) => {
            if (value) updatedFields[key] = value;
        });

        try {
            await updateAirtableRecord(recordId, updatedFields);
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modalInstance.hide();
            
            // Wait for modal to close
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const updatedRecords = await fetchAirtableData();
            const recordsToDisplay = currentSearchTerm ? 
                updatedRecords.filter(record => {
                    const fields = record.fields;
                    return (
                        (fields['Contact Person'] || '').toLowerCase().includes(currentSearchTerm) ||
                        (fields['Name of outlet'] || '').toLowerCase().includes(currentSearchTerm) ||
                        (fields['Category'] || '').toLowerCase().includes(currentSearchTerm)
                    );
                }) : 
                updatedRecords;
            
            console.log('About to display data with recordId:', recordId);
            await displayData(recordsToDisplay, recordId);
            
            alert('Record updated successfully!');
        } catch (error) {
            console.error('Error updating record:', error);
            alert('Error updating record: ' + error.message);
        }
    };

    document.body.appendChild(form);
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
};