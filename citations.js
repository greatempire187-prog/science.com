class CitationsManager {
    constructor() {
        this.citations = [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('addCitationBtn').addEventListener('click', () => this.showAddModal());
        document.getElementById('importCitationsBtn').addEventListener('click', () => this.importCitations());
        document.getElementById('exportCitationsBtn').addEventListener('click', () => this.exportCitations());
    }

    async loadCitations() {
        showLoading();
        try {
            this.citations = await API.getCitations();
            this.displayCitations();
        } catch (error) {
            console.error('Error loading citations:', error);
            showToast('Failed to load citations', 'error');
        } finally {
            hideLoading();
        }
    }

    displayCitations() {
        const container = document.getElementById('citationsList');
        
        if (!this.citations || this.citations.length === 0) {
            container.innerHTML = '<p>No citations added yet</p>';
            return;
        }

        container.innerHTML = this.citations.map(cit => `
            <div class="citation-card">
                <div class="citation-text">${this.formatCitation(cit)}</div>
                <div class="metadata">
                    <span><i class="fas fa-tag"></i> ${cit.type}</span>
                    <span><i class="fas fa-calendar"></i> ${cit.year}</span>
                    <span><i class="fas fa-book"></i> ${cit.journal || cit.publisher}</span>
                </div>
                <div class="actions">
                    <button class="btn btn-secondary" onclick="copyCitation('${cit.id}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="btn btn-secondary" onclick="editCitation('${cit.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteCitation('${cit.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatCitation(citation) {
        const authors = citation.authors.join(', ');
        const year = citation.year;
        const title = citation.title;
        const source = citation.journal || citation.publisher || citation.venue;

        return `${authors} (${year}). ${title}. ${source}`;
    }

    showAddModal() {
        showAddCitationModal();
    }

    async addCitation(data) {
        showLoading();
        try {
            const citation = await API.addCitation(data);
            this.citations.push(citation);
            this.displayCitations();
            showToast('Citation added successfully', 'success');
        } catch (error) {
            console.error('Error adding citation:', error);
            showToast('Failed to add citation', 'error');
        } finally {
            hideLoading();
        }
    }

    async importCitations() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.bib,.txt,.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            showLoading();
            try {
                await API.importCitations(file);
                showToast('Citations imported successfully', 'success');
                await this.loadCitations();
            } catch (error) {
                console.error('Error importing citations:', error);
                showToast('Failed to import citations', 'error');
            } finally {
                hideLoading();
            }
        };
        input.click();
    }

    async exportCitations() {
        if (this.citations.length === 0) {
            showToast('No citations to export', 'warning');
            return;
        }

        try {
            const format = prompt('Export format (bibtex, json, csv):', 'bibtex');
            if (!format) return;

            const data = await API.exportCitations(format);
            
            if (format === 'json') {
                downloadFile(JSON.stringify(data, null, 2), 'citations.json', 'application/json');
            } else if (format === 'csv') {
                downloadFile(data, 'citations.csv', 'text/csv');
            } else {
                downloadFile(data, 'citations.bib', 'text/plain');
            }
            
            showToast('Citations exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting citations:', error);
            showToast('Failed to export citations', 'error');
        }
    }
}

const citationsManager = new CitationsManager();

async function loadCitations() {
    await citationsManager.loadCitations();
}

async function copyCitation(id) {
    const citation = citationsManager.citations.find(c => c.id === id);
    if (citation) {
        const text = citationsManager.formatCitation(citation);
        await navigator.clipboard.writeText(text);
        showToast('Citation copied to clipboard', 'success');
    }
}

async function editCitation(id) {
    const citation = citationsManager.citations.find(c => c.id === id);
    if (citation) {
        showEditCitationModal(citation);
    }
}

async function deleteCitation(id) {
    if (!confirm('Are you sure you want to delete this citation?')) {
        return;
    }

    showLoading();
    try {
        await API.deleteCitation(id);
        showToast('Citation deleted successfully', 'success');
        await loadCitations();
    } catch (error) {
        console.error('Error deleting citation:', error);
        showToast('Failed to delete citation', 'error');
    } finally {
        hideLoading();
    }
}
