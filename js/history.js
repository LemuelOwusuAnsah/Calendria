(function() {
    const STORAGE_KEY = 'calendria_history';
    const MAX_ENTRIES = 50;

    function loadAll() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {}
        return [];
    }

    function saveAll(entries) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {}
    }

    function getKey(day, month, year) {
        return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }

    function add(day, month, year) {
        if (typeof day !== 'number' || typeof month !== 'number' || typeof year !== 'number') return;
        if (day < 1 || day > 31 || month < 0 || month > 11) return;

        const key = getKey(day, month, year);
        let entries = loadAll();

        entries = entries.filter(function(e) {
            return e.key !== key;
        });

        entries.unshift({
            key: key,
            day: day,
            month: month,
            year: year,
            viewedAt: new Date().toISOString()
        });

        if (entries.length > MAX_ENTRIES) {
            entries = entries.slice(0, MAX_ENTRIES);
        }

        saveAll(entries);
        render();
    }

    function getAll() {
        return loadAll();
    }

    function getRecent(limit) {
        const entries = loadAll();
        if (limit) {
            return entries.slice(0, limit);
        }
        return entries;
    }

    function remove(key) {
        let entries = loadAll();
        entries = entries.filter(function(e) {
            return e.key !== key;
        });
        saveAll(entries);
        render();
    }

    function clear() {
        saveAll([]);
        render();
    }

    function has(day, month, year) {
        const key = getKey(day, month, year);
        return loadAll().some(function(e) {
            return e.key === key;
        });
    }

    function getMostViewed() {
        const entries = loadAll();
        if (entries.length === 0) return null;
        return entries[0];
    }

    function getByMonth(month, year) {
        return loadAll().filter(function(e) {
            return e.month === month && e.year === year;
        });
    }

    function formatViewedTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return diffMins + ' min ago';
        if (diffHours < 24) return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';
        if (diffDays < 7) return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    function formatShortDate(day, month, year) {
        const monthName = (window.Calendria && window.Calendria.monthNames)
            ? window.Calendria.monthNames[month].slice(0, 3)
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
        return day + ' ' + monthName + ' ' + year;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function render(containerId) {
        const container = document.getElementById(containerId || 'historyList');
        if (!container) return;

        const entries = getAll();

        if (entries.length === 0) {
            container.innerHTML = [
                '<div class="history-empty">',
                '  <i class="bi bi-clock-history"></i>',
                '  <p>No recent dates yet</p>',
                '</div>'
            ].join('');
            return;
        }

        let html = '<div class="history-list-inner">';
        entries.forEach(function(entry) {
            html += '<div class="history-item" data-key="' + entry.key + '">';
            html += '<div class="history-item-date">';
            html += '<i class="bi bi-calendar3"></i>';
            html += '<span>' + formatShortDate(entry.day, entry.month, entry.year) + '</span>';
            html += '</div>';
            html += '<div class="history-item-meta">';
            html += '<span class="history-item-time">' + formatViewedTime(entry.viewedAt) + '</span>';
            html += '<button class="history-item-delete" data-delete-key="' + entry.key + '" aria-label="Remove">';
            html += '<i class="bi bi-x-lg"></i>';
            html += '</button>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        container.querySelectorAll('.history-item').forEach(function(item) {
            item.addEventListener('click', function(e) {
                if (e.target.closest('[data-delete-key]')) return;
                const key = this.dataset.key;
                if (!key) return;
                const parts = key.split('-');
                if (window.Calendria) {
                    window.Calendria.setState({
                        currentYear: parseInt(parts[0]),
                        currentMonth: parseInt(parts[1]) - 1,
                        selectedYear: parseInt(parts[0]),
                        selectedMonth: parseInt(parts[1]) - 1,
                        selectedDay: parseInt(parts[2])
                    });
                }
            });
        });

        container.querySelectorAll('[data-delete-key]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                remove(this.dataset.deleteKey);
            });
        });
    }

    function init() {
        document.addEventListener('daySelected', function(e) {
            add(e.detail.day, e.detail.month, e.detail.year);
        });

        render();
    }

    window.CalendriaHistory = {
        add: add,
        get: getAll,
        recent: getRecent,
        remove: remove,
        clear: clear,
        has: has,
        mostViewed: getMostViewed,
        byMonth: getByMonth,
        render: render,
        format: formatViewedTime
    };

    document.addEventListener('DOMContentLoaded', init);
})();