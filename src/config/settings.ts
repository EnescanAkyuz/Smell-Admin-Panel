export const SETTINGS = {
    SITE_NAME: 'Smell Admin',
    SITE_LOGO_TEXT: 'S',
    DEFAULT_PAGE_TITLE: 'Admin Panel',
    CURRENCY: 'TL',
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    DATE_FORMAT: 'tr-TR',
    MODULAR_FEATURES: {
        REVIEWS: true,
        BANNERS: true,
        LEGAL_TEXTS: true,
    },
    BRANDING: {
        PRIMARY_COLOR: '#7c3aed',
        SECONDARY_COLOR: '#4f46e5',
    }
};
