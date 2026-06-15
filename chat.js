class ChatManager {
    constructor() {
        this.messages = [];
        this.selectedDocuments = [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('sendChatBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        document.getElementById('selectDocumentBtn').addEventListener('click', () => this.showDocumentSelector());
    }

    async loadChat() {
        showLoading();
        try {
            this.messages = await API.getChatHistory();
            this.displayMessages();
            await this.loadChatDocuments();
        } catch (error) {
            console.error('Error loading chat:', error);
            showToast('Failed to load chat history', 'error');
        } finally {
            hideLoading();
        }
    }

    async loadChatDocuments() {
        try {
            const documents = await API.getDocuments();
            const container = document.getElementById('chatDocuments');
            
            container.innerHTML = documents.map(doc => `
                <div class="chat-document-item ${this.selectedDocuments.includes(doc.id) ? 'selected' : ''}" 
                     onclick="chatManager.toggleDocument('${doc.id}')">
                    <i class="fas fa-file-alt"></i>
                    <span>${doc.title}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading chat documents:', error);
        }
    }

    toggleDocument(id) {
        const index = this.selectedDocuments.indexOf(id);
        if (index > -1) {
            this.selectedDocuments.splice(index, 1);
        } else {
            this.selectedDocuments.push(id);
        }
        this.loadChatDocuments();
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) {
            showToast('Please enter a message', 'warning');
            return;
        }

        this.addMessage('user', message);
        input.value = '';

        try {
            const response = await API.sendMessage(message, this.selectedDocuments);
            this.addMessage('assistant', response.response);
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('assistant', 'Sorry, I encountered an error processing your request.');
            showToast('Failed to send message', 'error');
        }
    }

    addMessage(role, content) {
        this.messages.push({ role, content, timestamp: new Date().toISOString() });
        this.displayMessages();
    }

    displayMessages() {
        const container = document.getElementById('chatMessages');
        
        if (this.messages.length === 0) {
            container.innerHTML = '<p class="empty-state">Start a conversation by asking a question about your documents.</p>';
            return;
        }

        container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.role}">
                <div class="message-content">${formatMessageContent(msg.content)}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    async clearChat() {
        try {
            await API.clearChat();
            this.messages = [];
            this.displayMessages();
            showToast('Chat cleared', 'success');
        } catch (error) {
            console.error('Error clearing chat:', error);
            showToast('Failed to clear chat', 'error');
        }
    }

    showDocumentSelector() {
        showDocumentSelectionModal();
    }
}

const chatManager = new ChatManager();

async function loadChat() {
    await chatManager.loadChat();
}

function formatMessageContent(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}
