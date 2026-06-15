class API {
    static async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (authManager.token) {
            headers['Authorization'] = `Bearer ${authManager.token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            let response = await fetch(url, config);

            if (response.status === 401) {
                const refreshed = await authManager.refreshAccessToken();
                if (refreshed) {
                    headers['Authorization'] = `Bearer ${authManager.token}`;
                    response = await fetch(url, { ...config, headers });
                }
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || error.message || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    static async uploadFile(endpoint, file, onProgress) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (authManager.token) {
            headers['Authorization'] = `Bearer ${authManager.token}`;
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = (e.loaded / e.total) * 100;
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.statusText));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });

            xhr.open('POST', url);
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });
            xhr.send(formData);
        });
    }

    // Documents
    static async getDocuments() {
        return this.request(CONFIG.ENDPOINTS.DOCUMENTS.LIST);
    }

    static async uploadDocument(file, onProgress) {
        return this.uploadFile(CONFIG.ENDPOINTS.DOCUMENTS.UPLOAD, file, onProgress);
    }

    static async deleteDocument(id) {
        return this.request(CONFIG.ENDPOINTS.DOCUMENTS.DELETE.replace('{id}', id), {
            method: 'DELETE'
        });
    }

    static async getDocument(id) {
        return this.request(CONFIG.ENDPOINTS.DOCUMENTS.GET.replace('{id}', id));
    }

    static async analyzeDocument(id) {
        return this.request(CONFIG.ENDPOINTS.DOCUMENTS.ANALYZE.replace('{id}', id), {
            method: 'POST'
        });
    }

    static async summarizeDocument(id) {
        return this.request(CONFIG.ENDPOINTS.DOCUMENTS.SUMMARIZE.replace('{id}', id), {
            method: 'POST'
        });
    }

    // Search
    static async semanticSearch(query, filters = {}) {
        return this.request(CONFIG.ENDPOINTS_SEARCH.SEMANTIC, {
            method: 'POST',
            body: JSON.stringify({ query, filters })
        });
    }

    static async keywordSearch(query, filters = {}) {
        return this.request(CONFIG.ENDPOINTS.SEARCH.KEYWORD, {
            method: 'POST',
            body: JSON.stringify({ query, filters })
        });
    }

    static async hybridSearch(query, filters = {}) {
        return this.request(CONFIG.ENDPOINTS.SEARCH.HYBRID, {
            method: 'POST',
            body: JSON.stringify({ query, filters })
        });
    }

    // Chat
    static async sendMessage(message, documentIds = []) {
        return this.request(CONFIG.ENDPOINTS.CHAT.SEND, {
            method: 'POST',
            body: JSON.stringify({ message, document_ids: documentIds })
        });
    }

    static async getChatHistory() {
        return this.request(CONFIG.ENDPOINTS.CHAT.HISTORY);
    }

    static async clearChat() {
        return this.request(CONFIG.ENDPOINTS.CHAT.CLEAR, {
            method: 'POST'
        });
    }

    // Hypotheses
    static async getHypotheses() {
        return this.request(CONFIG.ENDPOINTS.HYPOTHESES.LIST);
    }

    static async generateHypothesis(data) {
        return this.request(CONFIG.ENDPOINTS.HYPOTHESES.GENERATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async deleteHypothesis(id) {
        return this.request(CONFIG.ENDPOINTS.HYPOTHESES.DELETE.replace('{id}', id), {
            method: 'DELETE'
        });
    }

    static async updateHypothesis(id, data) {
        return this.request(CONFIG.ENDPOINTS.HYPOTHESES.UPDATE.replace('{id}', id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Knowledge Graph
    static async buildKnowledgeGraph(query) {
        return this.request(CONFIG.ENDPOINTS.KNOWLEDGE_GRAPH.BUILD, {
            method: 'POST',
            body: JSON.stringify({ query })
        });
    }

    static async queryKnowledgeGraph(query) {
        return this.request(CONFIG.ENDPOINTS.KNOWLEDGE_GRAPH.QUERY, {
            method: 'POST',
            body: JSON.stringify({ query })
        });
    }

    static async exportKnowledgeGraph(format = 'json') {
        return this.request(`${CONFIG.ENDPOINTS.KNOWLEDGE_GRAPH.EXPORT}?format=${format}`);
    }

    // Experiments
    static async getExperiments() {
        return this.request(CONFIG.ENDPOINTS.EXPERIMENTS.LIST);
    }

    static async createExperiment(data) {
        return this.request(CONFIG.ENDPOINTS.EXPERIMENTS.CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateExperiment(id, data) {
        return this.request(CONFIG.ENDPOINTS.EXPERIMENTS.UPDATE.replace('{id}', id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteExperiment(id) {
        return this.request(CONFIG.ENDPOINTS.EXPERIMENTS.DELETE.replace('{id}', id), {
            method: 'DELETE'
        });
    }

    // Citations
    static async getCitations() {
        return this.request(CONFIG.ENDPOINTS.CITATIONS.LIST);
    }

    static async addCitation(data) {
        return this.request(CONFIG.ENDPOINTS.CITATIONS.ADD, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async deleteCitation(id) {
        return this.request(CONFIG.ENDPOINTS.CITATIONS.DELETE.replace('{id}', id), {
            method: 'DELETE'
        });
    }

    static async importCitations(file) {
        return this.uploadFile(CONFIG.ENDPOINTS.CITATIONS.IMPORT, file);
    }

    static async exportCitations(format = 'bibtex') {
        return this.request(`${CONFIG.ENDPOINTS.CITATIONS.EXPORT}?format=${format}`);
    }

    // Teams
    static async getTeams() {
        return this.request(CONFIG.ENDPOINTS.TEAMS.LIST);
    }

    static async createTeam(data) {
        return this.request(CONFIG.ENDPOINTS.TEAMS.CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async inviteMember(teamId, email) {
        return this.request(CONFIG.ENDPOINTS.TEAMS.INVITE.replace('{id}', teamId), {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    static async getTeamMembers(teamId) {
        return this.request(CONFIG.ENDPOINTS.TEAMS.MEMBERS.replace('{id}', teamId));
    }
}
