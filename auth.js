class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        this.refreshToken = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        this.user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER) || 'null');
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
    }

    async handleLogin() {
        try {
            const response = await fetch(`${CONFIG.AUTH_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    redirect_uri: CONFIG.FRONTEND_URL
                })
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.auth_url;
            } else {
                showToast('Failed to initiate login', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Login failed', 'error');
        }
    }

    async handleLogout() {
        try {
            if (this.token) {
                await fetch(CONFIG.ENDPOINTS.AUTH.LOGOUT, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
            window.location.href = '/';
        }
    }

    async handleCallback(code, state) {
        try {
            const response = await fetch(`${CONFIG.AUTH_URL}/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code, state })
            });

            if (response.ok) {
                const data = await response.json();
                this.setAuth(data.access_token, data.refresh_token, data.user);
                window.location.href = '/';
            } else {
                showToast('Authentication failed', 'error');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Callback error:', error);
            showToast('Authentication failed', 'error');
            window.location.href = '/';
        }
    }

    setAuth(token, refreshToken, user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
        this.updateUI();
    }

    clearAuth() {
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        this.updateUI();
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (this.user) {
            loginBtn.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userName.textContent = this.user.name || this.user.email;
        } else {
            loginBtn.classList.remove('hidden');
            userInfo.classList.add('hidden');
        }
    }

    async refreshAccessToken() {
        if (!this.refreshToken) {
            this.clearAuth();
            return false;
        }

        try {
            const response = await fetch(CONFIG.ENDPOINTS.AUTH.REFRESH, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.access_token;
                localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.access_token);
                return true;
            } else {
                this.clearAuth();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.clearAuth();
            return false;
        }
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    async checkAuth() {
        if (this.isAuthenticated()) {
            try {
                const response = await fetch(CONFIG.ENDPOINTS.AUTH.VERIFY, {
                    headers: this.getAuthHeaders()
                });

                if (!response.ok) {
                    const refreshed = await this.refreshAccessToken();
                    if (!refreshed) {
                        this.clearAuth();
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
                this.clearAuth();
            }
        }
        this.updateUI();
    }
}

const authManager = new AuthManager();
