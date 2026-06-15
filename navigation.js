class Navigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.initEventListeners();
        this.handleInitialRoute();
    }

    initEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            });
        });

        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
    }

    handleInitialRoute() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            this.navigateTo(hash);
        } else {
            this.navigateTo('dashboard');
        }
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            this.navigateTo(hash);
        }
    }

    navigateTo(page) {
        if (page === this.currentPage) return;

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            window.location.hash = page;
            this.loadPageData(page);
        }
    }

    async loadPageData(page) {
        switch (page) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'documents':
                await loadDocuments();
                break;
            case 'chat':
                await loadChat();
                break;
            case 'hypotheses':
                await loadHypotheses();
                break;
            case 'experiments':
                await loadExperiments();
                break;
            case 'citations':
                await loadCitations();
                break;
            case 'teams':
                await loadTeams();
                break;
        }
    }
}

const navigation = new Navigation();

function navigateTo(page) {
    navigation.navigateTo(page);
}
