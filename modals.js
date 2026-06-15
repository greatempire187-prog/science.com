function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('hidden');
    initUploadHandler();
}

function hideUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.add('hidden');
}

function initUploadHandler() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

async function handleFiles(files) {
    if (files.length === 0) return;

    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    uploadProgress.classList.remove('hidden');

    for (const file of files) {
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showToast(`File ${file.name} is too large`, 'error');
            continue;
        }

        try {
            await API.uploadDocument(file, (progress) => {
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Uploading ${file.name}: ${Math.round(progress)}%`;
            });
            showToast(`${file.name} uploaded successfully`, 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showToast(`Failed to upload ${file.name}`, 'error');
        }
    }

    uploadProgress.classList.add('hidden');
    progressFill.style.width = '0%';
    hideUploadModal();
    await loadDocuments();
}

function showAddCitationModal() {
    const modalHtml = `
        <div class="modal" id="addCitationModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add Citation</h2>
                    <button class="modal-close" onclick="closeModal('addCitationModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="citationTitle" placeholder="Enter title..." />
                    </div>
                    <div class="form-group">
                        <label>Authors (comma separated)</label>
                        <input type="text" id="citationAuthors" placeholder="Author 1, Author 2, ..." />
                    </div>
                    <div class="form-group">
                        <label>Year</label>
                        <input type="number" id="citationYear" placeholder="2024" />
                    </div>
                    <div class="form-group">
                        <label>Journal/Publisher</label>
                        <input type="text" id="citationJournal" placeholder="Enter journal or publisher..." />
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="citationType">
                            <option value="article">Article</option>
                            <option value="book">Book</option>
                            <option value="conference">Conference</option>
                            <option value="preprint">Preprint</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="submitAddCitation()">Add Citation</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitAddCitation() {
    const data = {
        title: document.getElementById('citationTitle').value.trim(),
        authors: document.getElementById('citationAuthors').value.split(',').map(a => a.trim()),
        year: parseInt(document.getElementById('citationYear').value),
        journal: document.getElementById('citationJournal').value.trim(),
        type: document.getElementById('citationType').value
    };

    if (!data.title || !data.authors.length || !data.year) {
        showToast('Please fill in required fields', 'warning');
        return;
    }

    citationsManager.addCitation(data);
    closeModal('addCitationModal');
}

function showEditCitationModal(citation) {
    const modalHtml = `
        <div class="modal" id="editCitationModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Citation</h2>
                    <button class="modal-close" onclick="closeModal('editCitationModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="editCitationTitle" value="${citation.title}" />
                    </div>
                    <div class="form-group">
                        <label>Authors (comma separated)</label>
                        <input type="text" id="editCitationAuthors" value="${citation.authors.join(', ')}" />
                    </div>
                    <div class="form-group">
                        <label>Year</label>
                        <input type="number" id="editCitationYear" value="${citation.year}" />
                    </div>
                    <div class="form-group">
                        <label>Journal/Publisher</label>
                        <input type="text" id="editCitationJournal" value="${citation.journal || ''}" />
                    </div>
                    <button class="btn btn-primary" onclick="submitEditCitation('${citation.id}')">Update Citation</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitEditCitation(id) {
    const data = {
        title: document.getElementById('editCitationTitle').value.trim(),
        authors: document.getElementById('editCitationAuthors').value.split(',').map(a => a.trim()),
        year: parseInt(document.getElementById('editCitationYear').value),
        journal: document.getElementById('editCitationJournal').value.trim()
    };

    API.updateCitation(id, data).then(() => {
        showToast('Citation updated successfully', 'success');
        closeModal('editCitationModal');
        loadCitations();
    }).catch(error => {
        console.error('Error updating citation:', error);
        showToast('Failed to update citation', 'error');
    });
}

function showCreateTeamModal() {
    const modalHtml = `
        <div class="modal" id="createTeamModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create Team</h2>
                    <button class="modal-close" onclick="closeModal('createTeamModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Team Name</label>
                        <input type="text" id="teamName" placeholder="Enter team name..." />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="teamDescription" placeholder="Describe the team..."></textarea>
                    </div>
                    <button class="btn btn-primary" onclick="submitCreateTeam()">Create Team</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitCreateTeam() {
    const data = {
        name: document.getElementById('teamName').value.trim(),
        description: document.getElementById('teamDescription').value.trim()
    };

    if (!data.name) {
        showToast('Please enter a team name', 'warning');
        return;
    }

    teamsManager.createTeam(data);
    closeModal('createTeamModal');
}

function showInviteMemberModal(teams) {
    const teamsOptions = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    const modalHtml = `
        <div class="modal" id="inviteMemberModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Invite Member</h2>
                    <button class="modal-close" onclick="closeModal('inviteMemberModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Select Team</label>
                        <select id="inviteTeamSelect">${teamsOptions}</select>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="inviteEmail" placeholder="Enter email address..." />
                    </div>
                    <button class="btn btn-primary" onclick="submitInviteMember()">Send Invitation</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitInviteMember() {
    const teamId = document.getElementById('inviteTeamSelect').value;
    const email = document.getElementById('inviteEmail').value.trim();

    if (!email) {
        showToast('Please enter an email address', 'warning');
        return;
    }

    teamsManager.inviteMember(teamId, email);
    closeModal('inviteMemberModal');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function showDocumentDetailModal(document) {
    const modalHtml = `
        <div class="modal" id="documentDetailModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${document.title}</h2>
                    <button class="modal-close" onclick="closeModal('documentDetailModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Type:</strong> ${document.file_type}</p>
                    <p><strong>Size:</strong> ${formatFileSize(document.file_size)}</p>
                    <p><strong>Uploaded:</strong> ${formatDate(document.uploaded_at)}</p>
                    ${document.summary ? `<p><strong>Summary:</strong> ${document.summary}</p>` : ''}
                    ${document.metadata ? `<pre>${JSON.stringify(document.metadata, null, 2)}</pre>` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function showAnalysisModal(analysis) {
    const modalHtml = `
        <div class="modal" id="analysisModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Document Analysis</h2>
                    <button class="modal-close" onclick="closeModal('analysisModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <h3>Key Topics</h3>
                    <ul>${analysis.topics.map(t => `<li>${t.topic} (${t.confidence}%)</li>`).join('')}</ul>
                    <h3>Entities</h3>
                    <ul>${analysis.entities.map(e => `<li>${e.text} (${e.type})</li>`).join('')}</ul>
                    <h3>Sentiment</h3>
                    <p>${analysis.sentiment}</p>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function showSummaryModal(summary) {
    const modalHtml = `
        <div class="modal" id="summaryModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Document Summary</h2>
                    <button class="modal-close" onclick="closeModal('summaryModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${summary.text}</p>
                    ${summary.key_points ? `
                        <h3>Key Points</h3>
                        <ul>${summary.key_points.map(p => `<li>${p}</li>`).join('')}</ul>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function showHypothesisDetailModal(hypothesis) {
    const modalHtml = `
        <div class="modal" id="hypothesisDetailModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${hypothesis.title}</h2>
                    <button class="modal-close" onclick="closeModal('hypothesisDetailModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Hypothesis:</strong> ${hypothesis.hypothesis}</p>
                    <p><strong>Confidence:</strong> ${hypothesis.confidence_score}%</p>
                    <p><strong>Created:</strong> ${formatDate(hypothesis.created_at)}</p>
                    ${hypothesis.rationale ? `<p><strong>Rationale:</strong> ${hypothesis.rationale}</p>` : ''}
                    ${hypothesis.references ? `
                        <h3>References</h3>
                        <ul>${hypothesis.references.map(r => `<li>${r}</li>`).join('')}</ul>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function showExperimentDetailModal(experiment) {
    const modalHtml = `
        <div class="modal" id="experimentDetailModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${experiment.name}</h2>
                    <button class="modal-close" onclick="closeModal('experimentDetailModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Description:</strong> ${experiment.description}</p>
                    <p><strong>Status:</strong> ${experiment.status}</p>
                    <p><strong>Start Date:</strong> ${formatDate(experiment.start_date)}</p>
                    ${experiment.results ? `
                        <h3>Results</h3>
                        <pre>${JSON.stringify(experiment.results, null, 2)}</pre>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function showTeamDetailModal(team, members) {
    const modalHtml = `
        <div class="modal" id="teamDetailModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${team.name}</h2>
                    <button class="modal-close" onclick="closeModal('teamDetailModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Description:</strong> ${team.description || 'No description'}</p>
                    <h3>Members</h3>
                    <ul>${members.map(m => `<li>${m.name} (${m.email})</li>`).join('')}</ul>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function showDocumentSelectionModal() {
    API.getDocuments().then(documents => {
        const modalHtml = `
            <div class="modal" id="documentSelectionModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Select Documents</h2>
                        <button class="modal-close" onclick="closeModal('documentSelectionModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="document-selector">
                            ${documents.map(doc => `
                                <div class="document-selector-item ${chatManager.selectedDocuments.includes(doc.id) ? 'selected' : ''}" 
                                     onclick="chatManager.toggleDocument('${doc.id}'); closeModal('documentSelectionModal');">
                                    ${doc.title}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    });
}

function showLiteratureReviewModal(review) {
    const modalHtml = `
        <div class="modal" id="literatureReviewModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Literature Review</h2>
                    <button class="modal-close" onclick="closeModal('literatureReviewModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="review-content">${review.content}</div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal && !modal.id.startsWith('upload') && !modal.id.startsWith('hypothesis') && !modal.id.startsWith('experiment')) {
            modal.remove();
        } else if (modal) {
            modal.classList.add('hidden');
        }
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (!modal.id.startsWith('upload') && !modal.id.startsWith('hypothesis') && !modal.id.startsWith('experiment')) {
                modal.remove();
            } else {
                modal.classList.add('hidden');
            }
        }
    });
});
