class DocumentsManager {
    constructor() {
        this.documents = [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('uploadBtn').addEventListener('click', () => showUploadModal());
        document.getElementById('createReviewBtn').addEventListener('click', () => this.createLiteratureReview());
        document.getElementById('generateSummaryBtn').addEventListener('click', () => this.generateSummary());
    }

    async loadDocuments() {
        showLoading();
        try {
            this.documents = await API.getDocuments();
            this.displayDocuments();
        } catch (error) {
            console.error('Error loading documents:', error);
            showToast('Failed to load documents', 'error');
        } finally {
            hideLoading();
        }
    }

    displayDocuments() {
        const container = document.getElementById('documentsList');
        
        if (!this.documents || this.documents.length === 0) {
            container.innerHTML = '<p>No documents uploaded yet</p>';
            return;
        }

        container.innerHTML = this.documents.map(doc => `
            <div class="document-card">
                <div class="document-info">
                    <h3>${doc.title}</h3>
                    <p>
                        <span><i class="fas fa-file"></i> ${doc.file_type}</span>
                        <span><i class="fas fa-database"></i> ${formatFileSize(doc.file_size)}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(doc.uploaded_at)}</span>
                    </p>
                </div>
                <div class="document-actions">
                    <button class="btn btn-secondary" onclick="viewDocumentDetail('${doc.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary" onclick="analyzeDocument('${doc.id}')">
                        <i class="fas fa-microscope"></i> Analyze
                    </button>
                    <button class="btn btn-secondary" onclick="summarizeDocument('${doc.id}')">
                        <i class="fas fa-file-alt"></i> Summarize
                    </button>
                    <button class="btn btn-danger" onclick="deleteDocument('${doc.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async createLiteratureReview() {
        if (this.documents.length === 0) {
            showToast('No documents available for review', 'warning');
            return;
        }

        showLoading();
        try {
            const review = await API.createLiteratureReview({
                document_ids: this.documents.map(d => d.id)
            });
            showLiteratureReviewModal(review);
        } catch (error) {
            console.error('Error creating literature review:', error);
            showToast('Failed to create literature review', 'error');
        } finally {
            hideLoading();
        }
    }

    async generateSummary() {
        if (this.documents.length === 0) {
            showToast('No documents available for summary', 'warning');
            return;
        }

        showLoading();
        try {
            const summary = await API.generateCombinedSummary({
                document_ids: this.documents.map(d => d.id)
            });
            showSummaryModal(summary);
        } catch (error) {
            console.error('Error generating summary:', error);
            showToast('Failed to generate summary', 'error');
        } finally {
            hideLoading();
        }
    }
}

const documentsManager = new DocumentsManager();

async function loadDocuments() {
    await documentsManager.loadDocuments();
}

async function viewDocumentDetail(id) {
    showLoading();
    try {
        const document = await API.getDocument(id);
        showDocumentDetailModal(document);
    } catch (error) {
        console.error('Error viewing document:', error);
        showToast('Failed to load document', 'error');
    } finally {
        hideLoading();
    }
}

async function analyzeDocument(id) {
    showLoading();
    try {
        const analysis = await API.analyzeDocument(id);
        showAnalysisModal(analysis);
    } catch (error) {
        console.error('Error analyzing document:', error);
        showToast('Failed to analyze document', 'error');
    } finally {
        hideLoading();
    }
}

async function summarizeDocument(id) {
    showLoading();
    try {
        const summary = await API.summarizeDocument(id);
        showSummaryModal(summary);
    } catch (error) {
        console.error('Error summarizing document:', error);
        showToast('Failed to summarize document', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteDocument(id) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }

    showLoading();
    try {
        await API.deleteDocument(id);
        showToast('Document deleted successfully', 'success');
        await loadDocuments();
    } catch (error) {
        console.error('Error deleting document:', error);
        showToast('Failed to delete document', 'error');
    } finally {
        hideLoading();
    }
}
