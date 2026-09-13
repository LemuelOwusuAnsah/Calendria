(function() {
    function getCurrentMonthYear() {
        if (window.Calendria && window.Calendria.getState) {
            const state = window.Calendria.getState();
            return { month: state.currentMonth, year: state.currentYear };
        }
        const now = new Date();
        return { month: now.getMonth(), year: now.getFullYear() };
    }

    function getMonthName(month) {
        if (window.Calendria && window.Calendria.monthNames) {
            return window.Calendria.monthNames[month];
        }
        return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
    }

    function getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return year + '-' + month + '-' + day + '_' + hours + '-' + minutes;
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function getEventsForMonth(month, year) {
        const events = [];
        if (!window.CalendriaEvents) return events;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayEvents = window.CalendriaEvents.get(d, month, year);
            dayEvents.forEach(function(ev) {
                events.push({
                    day: d,
                    month: month,
                    year: year,
                    title: ev.title,
                    time: ev.time,
                    description: ev.description,
                    color: ev.color
                });
            });
        }
        return events;
    }

    function getHolidaysForMonth(month, year) {
        if (window.CalendriaHolidays) {
            return window.CalendriaHolidays.month(month, year);
        }
        return [];
    }

    function exportMonthCSV() {
        const { month, year } = getCurrentMonthYear();
        const monthName = getMonthName(month);
        const events = getEventsForMonth(month, year);
        const holidays = getHolidaysForMonth(month, year);

        let csv = 'Date,Day,Type,Title,Time,Description\n';

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

            const holiday = holidays.find(function(h) { return h.day === d; });
            if (holiday) {
                csv += '"' + dateStr + '","' + dayName + '","Holiday","' + holiday.name + '","",""\n';
            }

            const dayEvents = events.filter(function(e) { return e.day === d; });
            dayEvents.forEach(function(ev) {
                csv += '"' + dateStr + '","' + dayName + '","Event","' + ev.title + '","' + (ev.time || '') + '","' + (ev.description || '') + '"\n';
            });
        }

        downloadFile(csv, 'calendria_' + monthName + '_' + year + '_' + getTimestamp() + '.csv', 'text/csv;charset=utf-8;');
        showToast('Exported month as CSV', 'success');
    }

    function exportMonthJSON() {
        const { month, year } = getCurrentMonthYear();
        const monthName = getMonthName(month);
        const events = getEventsForMonth(month, year);
        const holidays = getHolidaysForMonth(month, year);

        const data = {
            app: 'Calendria',
            exported: new Date().toISOString(),
            author: 'Lemuel Owusu-Ansah',
            month: monthName,
            monthIndex: month,
            year: year,
            events: events,
            holidays: holidays
        };

        const json = JSON.stringify(data, null, 2);
        downloadFile(json, 'calendria_' + monthName + '_' + year + '_' + getTimestamp() + '.json', 'application/json;charset=utf-8;');
        showToast('Exported month as JSON', 'success');
    }

    function exportEventsCSV() {
        if (!window.CalendriaEvents) return;

        const allEvents = [];
        const allData = window.CalendriaEvents.getAll ? window.CalendriaEvents.getAll() : null;

        if (allData) {
            Object.keys(allData).forEach(function(key) {
                const parts = key.split('-');
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);

                allData[key].forEach(function(ev) {
                    allEvents.push({
                        day: day,
                        month: month,
                        year: year,
                        title: ev.title,
                        time: ev.time,
                        description: ev.description
                    });
                });
            });
        }

        if (allEvents.length === 0) {
            showToast('No events to export', 'warning');
            return;
        }

        allEvents.sort(function(a, b) {
            if (a.year !== b.year) return a.year - b.year;
            if (a.month !== b.month) return a.month - b.month;
            return a.day - b.day;
        });

        let csv = 'Date,Day,Title,Time,Description\n';
        allEvents.forEach(function(ev) {
            const dateObj = new Date(ev.year, ev.month, ev.day);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = ev.year + '-' + String(ev.month + 1).padStart(2, '0') + '-' + String(ev.day).padStart(2, '0');
            csv += '"' + dateStr + '","' + dayName + '","' + ev.title + '","' + (ev.time || '') + '","' + (ev.description || '') + '"\n';
        });

        downloadFile(csv, 'calendria_all_events_' + getTimestamp() + '.csv', 'text/csv;charset=utf-8;');
        showToast('Exported all events', 'success');
    }

    function exportAllJSON() {
        const data = {
            app: 'Calendria',
            exported: new Date().toISOString(),
            author: 'Lemuel Owusu-Ansah',
            events: window.CalendriaEvents ? window.CalendriaEvents.getAll() : {},
            history: window.CalendriaHistory ? window.CalendriaHistory.get() : []
        };

        const json = JSON.stringify(data, null, 2);
        downloadFile(json, 'calendria_backup_' + getTimestamp() + '.json', 'application/json;charset=utf-8;');
        showToast('Backup exported', 'success');
    }

    function importJSON(file) {
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (!imported.events) {
                        reject('Invalid backup file');
                        return;
                    }
                    resolve(imported);
                } catch (err) {
                    reject('Could not read file');
                }
            };
            reader.readAsText(file);
        });
    }

    function handleImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;

            importJSON(file).then(function(data) {
                if (confirm('Import ' + Object.keys(data.events).length + ' day(s) with events?')) {
                    try {
                        localStorage.setItem('calendria_events', JSON.stringify(data.events));
                        if (window.CalendriaEvents) {
                            window.CalendriaEvents.refreshIndicators();
                        }
                        if (window.Calendria) {
                            const state = window.Calendria.getState();
                            window.Calendria.render(state.currentYear, state.currentMonth);
                        }
                        showToast('Backup imported', 'success');
                    } catch (err) {
                        showToast('Import failed', 'warning');
                    }
                }
            }).catch(function() {
                showToast('Invalid file', 'warning');
            });

            input.remove();
        });

        input.click();
    }

    function exportMonthPDF() {
        const { month, year } = getCurrentMonthYear();
        const monthName = getMonthName(month);
        const events = getEventsForMonth(month, year);
        const holidays = getHolidaysForMonth(month, year);

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showToast('Please allow popups for PDF export', 'warning');
            return;
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        let cells = '';
        for (let i = 0; i < firstDay; i++) {
            cells += '<div class="cell empty"></div>';
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const holiday = holidays.find(function(h) { return h.day === d; });
            const dayEvents = events.filter(function(e) { return e.day === d; });
            let cls = 'cell';
            if (holiday) cls += ' holiday';
            if (dayEvents.length > 0) cls += ' has-event';

            cells += '<div class="' + cls + '">';
            cells += '<div class="day-num">' + d + '</div>';
            if (holiday) cells += '<div class="label holiday-label">' + holiday.name + '</div>';
            dayEvents.slice(0, 2).forEach(function(ev) {
                cells += '<div class="label event-label">' + ev.title + '</div>';
            });
            if (dayEvents.length > 2) {
                cells += '<div class="label more-label">+' + (dayEvents.length - 2) + ' more</div>';
            }
            cells += '</div>';
        }

        const html = [
            '<!DOCTYPE html><html><head><title>Calendria - ' + monthName + ' ' + year + '</title>',
            '<style>',
            'body { font-family: Arial, sans-serif; padding: 20px; }',
            'h1 { color: #0d6efd; text-align: center; margin-bottom: 5px; }',
            'h2 { text-align: center; color: #6c757d; font-weight: 400; margin-bottom: 20px; }',
            '.calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; max-width: 100%; }',
            '.header { font-weight: 700; text-align: center; padding: 8px; background: #0d6efd; color: white; font-size: 12px; }',
            '.cell { min-height: 80px; border: 1px solid #dee2e6; padding: 4px; font-size: 11px; }',
            '.cell.empty { background: #f8f9fa; }',
            '.cell.holiday { background: #fff3cd; }',
            '.cell.has-event { background: #e7f3ff; }',
            '.day-num { font-weight: 700; font-size: 14px; color: #212529; }',
            '.label { font-size: 9px; margin-top: 2px; padding: 1px 3px; border-radius: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
            '.holiday-label { background: #ffc107; color: #000; }',
            '.event-label { background: #0d6efd; color: #fff; }',
            '.more-label { background: #6c757d; color: #fff; }',
            '.footer { text-align: center; margin-top: 20px; font-size: 11px; color: #6c757d; }',
            '@media print { body { padding: 0; } }',
            '</style></head><body>',
            '<h1>Calendria</h1>',
            '<h2>' + monthName + ' ' + year + '</h2>',
            '<div class="calendar">',
            '<div class="header">Sun</div><div class="header">Mon</div><div class="header">Tue</div><div class="header">Wed</div><div class="header">Thu</div><div class="header">Fri</div><div class="header">Sat</div>',
            cells,
            '</div>',
            '<div class="footer">Calendria &middot; Apps by Lemuel Owusu-Ansah</div>',
            '</body></html>'
        ].join('');

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = function() {
            setTimeout(function() {
                printWindow.print();
            }, 300);
        };

        showToast('Print preview opened', 'success');
    }

    function showToast(message, type) {
        const existing = document.querySelector('.export-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'export-toast export-toast-' + (type || 'info');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('show');
        }, 10);

        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, 2500);
    }

    function init() {
        const csvBtn = document.getElementById('exportCsvBtn');
        const jsonBtn = document.getElementById('exportJsonBtn');
        const eventsCsvBtn = document.getElementById('exportEventsCsvBtn');
        const backupBtn = document.getElementById('exportBackupBtn');
        const importBtn = document.getElementById('importBackupBtn');
        const pdfBtn = document.getElementById('exportPdfBtn');

        if (csvBtn) csvBtn.addEventListener('click', exportMonthCSV);
        if (jsonBtn) jsonBtn.addEventListener('click', exportMonthJSON);
        if (eventsCsvBtn) eventsCsvBtn.addEventListener('click', exportEventsCSV);
        if (backupBtn) backupBtn.addEventListener('click', exportAllJSON);
        if (importBtn) importBtn.addEventListener('click', handleImport);
        if (pdfBtn) pdfBtn.addEventListener('click', exportMonthPDF);
    }

    window.CalendriaExport = {
        monthCSV: exportMonthCSV,
        monthJSON: exportMonthJSON,
        eventsCSV: exportEventsCSV,
        allJSON: exportAllJSON,
        importFile: handleImport,
        monthPDF: exportMonthPDF,
        toast: showToast
    };

    document.addEventListener('DOMContentLoaded', init);
})();