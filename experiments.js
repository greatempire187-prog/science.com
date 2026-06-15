class ExperimentsManager {
    constructor() {
        this.experiments = [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('createExperimentBtn').addEventListener('click', () => this.showCreateModal());
        document.getElementById('importExperimentBtn').addEventListener('click', () => this.importExperiment());
    }

    async loadExperiments() {
        showLoading();
        try {
            this.experiments = await API.getExperiments();
            this.displayExperiments();
        } catch (error) {
            console.error('Error loading experiments:', error);
            showToast('Failed to load experiments', 'error');
        } finally {
            hideLoading();
        }
    }

    displayExperiments() {
        const container = document.getElementById('experimentsList');
        
        if (!this.experiments || this.experiments.length === 0) {
            container.innerHTML = '<p>No experiments created yet</p>';
            return;
        }

        container.innerHTML = this.experiments.map(exp => `
            <div class="experiment-card">
                <h3>${exp.name}</h3>
                <p>${exp.description}</p>
                <div class="metadata">
                    <span class="status ${exp.status}">${exp.status}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(exp.start_date)}</span>
                    <span><i class="fas fa-clock"></i> ${exp.duration || 'Ongoing'}</span>
                </div>
                <div class="actions">
                    <button class="btn btn-secondary" onclick="viewExperimentDetail('${exp.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-secondary" onclick="updateExperimentStatus('${exp.id}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                    <button class="btn btn-danger" onclick="deleteExperiment('${exp.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    showCreateModal() {
        const modal = document.getElementById('experimentModal');
        modal.classList.remove('hidden');
        this.loadHypothesesForSelection();
    }

    async loadHypothesesForSelection() {
        try {
            const hypotheses = await API.getHypotheses();
            const select = document.getElementById('experimentHypothesis');
            
            select.innerHTML = hypotheses.map(hyp => `
                <option value="${hyp.id}">${hyp.title}</option>
            `).join('');
        } catch (error) {
            console.error('Error loading hypotheses:', error);
        }
    }

    async createExperiment() {
        const name = document.getElementById('experimentName').value.trim();
        const description = document.getElementById('experimentDescription').value.trim();
        const hypothesisId = document.getElementById('experimentHypothesis').value;
        const startDate = document.getElementById('experimentStartDate').value;

        if (!name || !description) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        showLoading();
        try {
            const experiment = await API.createExperiment({
                name,
                description,
                hypothesis_id: hypothesisId,
                start_date: startDate
            });

            this.experiments.push(experiment);
            this.displayExperiments();
            this.closeModal();
            showToast('Experiment created successfully', 'success');
        } catch (error) {
            console.error('Error creating experiment:', error);
            showToast('Failed to create experiment', 'error');
        } finally {
            hideLoading();
        }
    }

    closeModal() {
        const modal = document.getElementById('experimentModal');
        modal.classList.add('hidden');
        document.getElementById('experimentName').value = '';
        document.getElementById('experimentDescription').value = '';
        document.getElementById('experimentStartDate').value = '';
    }

    async importExperiment() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            showLoading();
            try {
                const content = await file.text();
                const data = JSON.parse(content);
                await API.importExperiment(data);
                showToast('Experiment imported successfully', 'success');
                await this.loadExperiments();
            } catch (error) {
                console.error('Error importing experiment:', error);
                showToast('Failed to import experiment', 'error');
            } finally {
                hideLoading();
            }
        };
        input.click();
    }
}

const experimentsManager = new ExperimentsManager();

document.getElementById('createExperimentSubmit').addEventListener('click', () => {
    experimentsManager.createExperiment();
});

async function loadExperiments() {
    await experimentsManager.loadExperiments();
}

async function viewExperimentDetail(id) {
    showLoading();
    try {
        const experiment = await API.getExperiment(id);
        showExperimentDetailModal(experiment);
    } catch (error) {
        console.error('Error viewing experiment:', error);
        showToast('Failed to load experiment', 'error');
    } finally {
        hideLoading();
    }
}

async function updateExperimentStatus(id) {
    const status = prompt('Enter new status (active, completed, pending):');
    if (!status) return;

    showLoading();
    try {
        await API.updateExperiment(id, { status });
        showToast('Experiment status updated', 'success');
        await loadExperiments();
    } catch (error) {
        console.error('Error updating experiment:', error);
        showToast('Failed to update experiment', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteExperiment(id) {
    if (!confirm('Are you sure you want to delete this experiment?')) {
        return;
    }

    showLoading();
    try {
        await API.deleteExperiment(id);
        showToast('Experiment deleted successfully', 'success');
        await loadExperiments();
    } catch (error) {
        console.error('Error deleting experiment:', error);
        showToast('Failed to delete experiment', 'error');
    } finally {
        hideLoading();
    }
}

function showExperimentModalWithHypothesis(hypothesisId) {
    experimentsManager.showCreateModal();
    setTimeout(() => {
        document.getElementById('experimentHypothesis').value = hypothesisId;
    }, 100);
}
