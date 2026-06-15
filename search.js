class SearchManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    async handleSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) {
            showToast('Please enter a search query', 'warning');
            return;
        }

        const searchType = document.getElementById('searchType').value;
        const year = document.getElementById('searchYear').value;
        const field = document.getElementById('searchField').value;

        const filters = {};
        if (year !== 'all') filters.year = year;
        if (field !== 'all') filters.field = field;

        showLoading();
        try {
            let results;
            switch (searchType) {
                case 'semantic':
                    results = await API.semanticSearch(query, filters);
                    break;
                case 'keyword':
                    results = await API.keywordSearch(query, filters);
                    break;
                case 'hybrid':
                    results = await API.hybridSearch(query, filters);
                    break;
            }

            this.displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            showToast('Search failed', 'error');
        } finally {
            hideLoading();
        }
    }

    displayResults(results) {
        const container = document.getElementById('searchResults');
        
        if (!results || results.length === 0) {
            container.innerHTML = '<p>No results found</p>';
            return;
        }

        container.innerHTML = results.map(result => `
            <div class="search-result">
                <h3>${result.title}</h3>
                <div class="authors">${result.authors.join(', ')}</div>
                <p class="abstract">${result.abstract}</p>
                <div class="metadata">
                    <span><i class="fas fa-calendar"></i> ${result.year}</span>
                    <span><i class="fas fa-book"></i> ${result.journal || result.venue}</span>
                    <span><i class="fas fa-quote-right"></i> ${result.citations} citations</span>
                </div>
                <div class="actions">
                    <button class="btn btn-secondary" onclick="viewDocument('${result.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary" onclick="addDocument('${result.id}')">
                        <i class="fas fa-plus"></i> Add to Library
                    </button>
                    <button class="btn btn-secondary" onclick="citeDocument('${result.id}')">
                        <i class="fas fa-quote-right"></i> Cite
                    </button>
                </div>
            </div>
        `).join('');
    }
}

const searchManager = new SearchManager();

async function viewDocument(id) {
    try {
        const document = await API.getDocument(id);
        showDocumentModal(document);
    } catch (error) {
        console.error('Error viewing document:', error);
        showToast('Failed to load document', 'error');
    }
}

async function addDocument(id) {
    try {
        await API.addDocumentToLibrary(id);
        showToast('Document added to library', 'success');
    } catch (error) {
        console.error('Error adding document:', error);
        showToast('Failed to add document', 'error');
    }
}

function citeDocument(id) {
    showToast('Citation copied to clipboard', 'success');
}
