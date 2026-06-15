const CONFIG = {
    API_BASE_URL: 'http://localhost:8000/api/v1',
    FRONTEND_URL: 'http://localhost:3000',
    AUTH_URL: 'http://localhost:8000/auth',
    
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REGISTER: '/auth/register',
            REFRESH: '/auth/refresh',
            VERIFY: '/auth/verify'
        },
        DOCUMENTS: {
            LIST: '/documents',
            UPLOAD: '/documents/upload',
            DELETE: '/documents/{id}',
            GET: '/documents/{id}',
            ANALYZE: '/documents/{id}/analyze',
            SUMMARIZE: '/documents/{id}/summarize'
        },
        SEARCH: {
            SEMANTIC: '/search/semantic',
            KEYWORD: '/search/keyword',
            HYBRID: '/search/hybrid'
        },
        CHAT: {
            SEND: '/chat/send',
            HISTORY: '/chat/history',
            CLEAR: '/chat/clear'
        },
        HYPOTHESES: {
            LIST: '/hypotheses',
            GENERATE: '/hypotheses/generate',
            DELETE: '/hypotheses/{id}',
            UPDATE: '/hypotheses/{id}'
        },
        KNOWLEDGE_GRAPH: {
            BUILD: '/knowledge-graph/build',
            QUERY: '/knowledge-graph/query',
            EXPORT: '/knowledge-graph/export'
        },
        EXPERIMENTS: {
            LIST: '/experiments',
            CREATE: '/experiments',
            UPDATE: '/experiments/{id}',
            DELETE: '/experiments/{id}'
        },
        CITATIONS: {
            LIST: '/citations',
            ADD: '/citations',
            DELETE: '/citations/{id}',
            IMPORT: '/citations/import',
            EXPORT: '/citations/export'
        },
        TEAMS: {
            LIST: '/teams',
            CREATE: '/teams',
            INVITE: '/teams/{id}/invite',
            MEMBERS: '/teams/{id}/members'
        }
    },
    
    STORAGE_KEYS: {
        TOKEN: 'auth_token',
        REFRESH_TOKEN: 'refresh_token',
        USER: 'user_data',
        THEME: 'theme_preference'
    },
    
    FILE_TYPES: {
        PDF: 'application/pdf',
        TXT: 'text/plain',
        DOC: 'application/msword',
        DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    
    MAX_FILE_SIZE: 52428800, // 50MB
    
    RATE_LIMIT: {
        REQUESTS: 100,
        PERIOD: 60 // seconds
    }
};
