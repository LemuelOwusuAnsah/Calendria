(function () {
    function getState() {
        if (window.Calendria && window.Calendria.getState) {
            return window.Calendria.getState();
        }
        const now = new Date();
        return {
            selectedDay: now.getDate(),
            selectedMonth: now.getMonth(),
            selectedYear: now.getFullYear()
        };
    }

    function getMonthName(month) {
        if (window.Calendria && window.Calendria.monthNames) {
            return window.Calendria.monthNames[month];
        }
        return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
    }

    function formatDateString(day, month, year) {
        return day + ' ' + getMonthName(month) + ' ' + year;
    }

    function buildShareText() {
        const s = getState();
        const dateStr = formatDateString(s.selectedDay, s.selectedMonth, s.selectedYear);
        const parts = ['📅 ' + dateStr];
        if (window.CalendriaEvents) {
            const evs = window.CalendriaEvents.get(s.selectedDay, s.selectedMonth, s.selectedYear);
            if (evs && evs.length > 0) {
                parts.push('');
                parts.push('Events:');
                evs.forEach(function (e) {
                    const time = e.time ? ' (' + e.time + ')' : '';
                    parts.push('• ' + e.title + time);
                });
            }
        }
        if (window.CalendriaHolidays) {
            const h = window.CalendriaHolidays.get(s.selectedDay, s.selectedMonth, s.selectedYear);
            if (h) {
                parts.push('');
                parts.push('🎉 ' + h.name);
            }
        }
        parts.push('');
        parts.push('— via Calendria');
        return parts.join('\n');
    }

    function buildShareUrl() {
        const s = getState();
        const base = window.location.origin + window.location.pathname;
        const date = s.selectedYear + '-' + String(s.selectedMonth + 1).padStart(2, '0') + '-' + String(s.selectedDay).padStart(2, '0');
        return base + '?date=' + date;
    }

    function showToast(msg) {
        if (window.CalendriaExport && window.CalendriaExport.toast) {
            window.CalendriaExport.toast(msg, 'success');
        }
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    function shareDate() {
        const text = buildShareText();
        if (navigator.share) {
            navigator.share({ title: 'Calendria', text: text, url: buildShareUrl() }).catch(function () {});
            return;
        }
        copyToClipboard(text).then(function () {
            showToast('Copied to clipboard');
        }).catch(function () {
            showToast('Could not copy');
        });
    }

    function copyLink() {
        const url = buildShareUrl();
        copyToClipboard(url).then(function () {
            showToast('Link copied');
        }).catch(function () {
            showToast('Could not copy');
        });
    }

    function readUrlDate() {
        const params = new URLSearchParams(window.location.search);
        const d = params.get('date');
        if (!d) return;
        const parts = d.split('-');
        if (parts.length !== 3) return;
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        if (isNaN(y) || isNaN(m) || isNaN(day)) return;
        if (window.Calendria && window.Calendria.setState) {
            window.Calendria.setState({
                currentYear: y,
                currentMonth: m,
                selectedYear: y,
                selectedMonth: m,
                selectedDay: day
            });
        }
    }

    function init() {
        readUrlDate();
    }

    document.addEventListener('DOMContentLoaded', init);

    window.CalendriaShare = {
        date: shareDate,
        link: copyLink,
        text: buildShareText,
        url: buildShareUrl
    };
})();