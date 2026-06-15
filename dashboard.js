async function loadDashboard() {
    showLoading();
    try {
        const [documents, chats, hypotheses, experiments] = await Promise.all([
            API.getDocuments().catch(() => ({ total: 0 })),
            API.getChatHistory().catch(() => ({ total: 0 })),
            API.getHypotheses().catch(() => ({ total: 0 })),
            API.getExperiments().catch(() => ({ total: 0 }))
        ]);

        document.getElementById('totalDocuments').textContent = documents.total || documents.length || 0;
        document.getElementById('totalChats').textContent = chats.total || chats.length || 0;
        document.getElementById('totalHypotheses').textContent = hypotheses.total || hypotheses.length || 0;
        document.getElementById('totalExperiments').textContent = experiments.total || experiments.length || 0;

        await loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard', 'error');
    } finally {
        hideLoading();
    }
}

async function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    
    const activities = [
        { type: 'document', message: 'Uploaded "Machine Learning Survey.pdf"', time: '2 hours ago' },
        { type: 'chat', message: 'Started chat about neural networks', time: '4 hours ago' },
        { type: 'hypothesis', message: 'Generated hypothesis for deep learning', time: '1 day ago' },
        { type: 'experiment', message: 'Created experiment "Image Classification"', time: '2 days ago' }
    ];

    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <p>${activity.message}</p>
            <small>${activity.time}</small>
        </div>
    `).join('');
}
