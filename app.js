document.addEventListener('DOMContentLoaded', async () => {
    await authManager.checkAuth();
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
        await authManager.handleCallback(code, state);
    }

    await loadDashboard();
});

window.addEventListener('beforeunload', () => {
    if (chatManager.messages.length > 0) {
        localStorage.setItem('chatMessages', JSON.stringify(chatManager.messages));
    }
});

window.addEventListener('load', () => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
        try {
            chatManager.messages = JSON.parse(savedMessages);
        } catch (error) {
            console.error('Error loading saved messages:', error);
        }
        localStorage.removeItem('chatMessages');
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        authManager.checkAuth();
    }
});

window.addEventListener('online', () => {
    showToast('You are back online', 'success');
});

window.addEventListener('offline', () => {
    showToast('You are offline', 'warning');
});

function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('hidden');
    initUploadHandler();
}

document.getElementById('uploadModal').querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('uploadModal').classList.add('hidden');
});

document.getElementById('hypothesisModal').querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('hypothesisModal').classList.add('hidden');
});

document.getElementById('experimentModal').querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('experimentModal').classList.add('hidden');
});

document.getElementById('uploadModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('uploadModal')) {
        document.getElementById('uploadModal').classList.add('hidden');
    }
});

document.getElementById('hypothesisModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('hypothesisModal')) {
        document.getElementById('hypothesisModal').classList.add('hidden');
    }
});

document.getElementById('experimentModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('experimentModal')) {
        document.getElementById('experimentModal').classList.add('hidden');
    }
});

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

setInterval(() => {
    authManager.checkAuth();
}, 300000);
