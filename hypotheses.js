class HypothesesManager {
    constructor() {
        this.hypotheses = [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('generateHypothesisBtn').addEventListener('click', () => this.showGenerateModal());
        document.getElementById('exportHypothesesBtn').addEventListener('click', () => this.exportHypotheses());
    }

    async loadHypotheses() {
        showLoading();
        try {
            this.hypotheses = await API.getHypotheses();
            this.displayHypotheses();
        } catch (error) {
            console.error('Error loading hypotheses:', error);
            showToast('Failed to load hypotheses', 'error');
        } finally {
            hideLoading();
        }
    }

    displayHypotheses() {
        const container = document.getElementById('hypothesesList');
        
        if (!this.hypotheses || this.hypotheses.length === 0) {
            container.innerHTML = '<p>No hypotheses generated yet</p>';
            return;
        }

        container.innerHTML = this.hypotheses.map(hyp => `
            <div class="hypothesis-card">
                <h3>${hyp.title}</h3>
                <p class="hypothesis-text">${hyp.hypothesis}</p>
                <div class="metadata">
                    <span><i class="fas fa-calendar"></i> ${formatDate(hyp.created_at)}</span>
                    <span><i class="fas fa-star"></i> Confidence: ${hyp.confidence_score}%</span>
                </div>
                <div class="actions">
                    <button class="btn btn-secondary" onclick="viewHypothesisDetail('${hyp.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-secondary" onclick="createExperimentFromHypothesis('${hyp.id}')">
                        <i class="fas fa-flask"></i> Create Experiment
                    </button>
                    <button class="btn btn-danger" onclick="deleteHypothesis('${hyp.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    showGenerateModal() {
        const modal = document.getElementById('hypothesisModal');
        modal.classList.remove('hidden');
        this.loadDocumentsForSelection();
    }

    async loadDocumentsForSelection() {
        try {
            const documents = await API.getDocuments();
            const container = document.getElementById('hypothesisDocuments');
            
            container.innerHTML = documents.map(doc => `
                <div class="document-selector-item" onclick="hypothesesManager.toggleDocumentSelection('${doc.id}', this)">
                    ${doc.title}
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    }

    toggleDocumentSelection(id, element) {
        element.classList.toggle('selected');
    }

    async generateHypothesis() {
        const topic = document.getElementById('hypothesisTopic').value.trim();
        const context = document.getElementById('hypothesisContext').value.trim();
        const selectedDocs = Array.from(document.querySelectorAll('.document-selector-item.selected'))
            .map(el => el.dataset.id);

        if (!topic) {
            showToast('Please enter a research topic', 'warning');
            return;
        }

        showLoading();
        try {
            const hypothesis = await API.generateHypothesis({
                topic,
                context,
                document_ids: selectedDocs
            });

            this.hypotheses.push(hypothesis);
            this.displayHypotheses();
            this.closeModal();
            showToast('Hypothesis generated successfully', 'success');
        } catch (error) {
            console.error('Error generating hypothesis:', error);
            showToast('Failed to generate hypothesis', 'error');
        } finally {
            hideLoading();
        }
    }

    closeModal() {
        const modal = document.getElementById('hypothesisModal');
        modal.classList.add('hidden');
        document.getElementById('hypothesisTopic').value = '';
        document.getElementById('hypothesisContext').value = '';
    }

    async exportHypotheses() {
        if (this.hypotheses.length === 0) {
            showToast('No hypotheses to export', 'warning');
            return;
        }

        try {
            const data = JSON.stringify(this.hypotheses, null, 2);
            downloadFile(data, 'hypotheses.json', 'application/json');
            showToast('Hypotheses exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting hypotheses:', error);
            showToast('Failed to export hypotheses', 'error');
        }
    }
}

const hypothesesManager = new HypothesesManager();

document.getElementById('generateHypothesisSubmit').addEventListener('click', () => {
    hypothesesManager.generateHypothesis();
});

async function loadHypotheses() {
    await hypothesesManager.loadHypotheses();
}

async function viewHypothesisDetail(id) {
    showLoading();
    try {
        const hypothesis = await API.getHypothesis(id);
        showHypothesisDetailModal(hypothesis);
    } catch (error) {
        console.error('Error viewing hypothesis:', error);
        showToast('Failed to load hypothesis', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteHypothesis(id) {
    if (!confirm('Are you sure you want to delete this hypothesis?')) {
        return;
    }

    showLoading();
    try {
        await API.deleteHypothesis(id);
        showToast('Hypothesis deleted successfully', 'success');
        await loadHypotheses();
    } catch (error) {
        console.error('Error deleting hypothesis:', error);
        showToast('Failed to delete hypothesis', 'error');
    } finally {
        hideLoading();
    }
}

async function createExperimentFromHypothesis(id) {
    navigateTo('experiments');
    setTimeout(() => {
        showExperimentModalWithHypothesis(id);
    }, 500);
}
