(function () {
    const STORAGE_KEY = 'calendria_theme';
    const DEFAULT_THEME = 'dark';

    function getSavedTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch (e) {}
        return DEFAULT_THEME;
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {}
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
            }
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-bs-theme') || DEFAULT_THEME;
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        saveTheme(next);
    }

    function init() {
        applyTheme(getSavedTheme());
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', toggleTheme);
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    window.CalendriaTheme = {
        get: function () { return document.documentElement.getAttribute('data-bs-theme'); },
        set: function (t) { applyTheme(t); saveTheme(t); },
        toggle: toggleTheme
    };
})();