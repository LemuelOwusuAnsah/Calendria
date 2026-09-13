(function() {
    const HOLIDAYS = {
        '01-01': { name: "New Year's Day", type: 'public' },
        '01-07': { name: 'Constitution Day', type: 'public' },
        '03-06': { name: 'Independence Day', type: 'public' },
        '05-01': { name: 'May Day (Workers Day)', type: 'public' },
        '05-25': { name: 'African Union Day', type: 'public' },
        '07-01': { name: 'Republic Day', type: 'public' },
        '09-21': { name: 'Kwame Nkrumah Memorial Day', type: 'public' },
        '12-05': { name: 'Farmer\'s Day', type: 'public' },
        '12-25': { name: 'Christmas Day', type: 'public' },
        '12-26': { name: 'Boxing Day', type: 'public' },
        '04-18': { name: 'Good Friday', type: 'religious', yearly: false },
        '04-21': { name: 'Easter Monday', type: 'religious', yearly: false },
        '01-01': { name: "New Year's Day", type: 'public' },
        '12-24': { name: 'Christmas Eve', type: 'observance' },
        '12-31': { name: "New Year's Eve", type: 'observance' },
        '02-14': { name: "Valentine's Day", type: 'observance' },
        '03-08': { name: "International Women's Day", type: 'observance' },
        '04-22': { name: 'Earth Day', type: 'observance' },
        '06-05': { name: 'World Environment Day', type: 'observance' },
        '09-27': { name: 'World Tourism Day', type: 'observance' },
        '10-01': { name: 'International Day of Older Persons', type: 'observance' },
        '10-31': { name: 'Halloween', type: 'observance' },
        '11-20': { name: 'Universal Children\'s Day', type: 'observance' },
        '12-10': { name: 'Human Rights Day', type: 'observance' }
    };

    const VARIABLE_HOLIDAYS = {
        '2024': {
            '03-29': { name: 'Good Friday', type: 'religious' },
            '04-01': { name: 'Easter Monday', type: 'religious' },
            '04-10': { name: 'Eid al-Fitr', type: 'religious' },
            '06-17': { name: 'Eid al-Adha', type: 'religious' }
        },
        '2025': {
            '04-18': { name: 'Good Friday', type: 'religious' },
            '04-21': { name: 'Easter Monday', type: 'religious' },
            '03-31': { name: 'Eid al-Fitr', type: 'religious' },
            '06-07': { name: 'Eid al-Adha', type: 'religious' }
        },
        '2026': {
            '04-03': { name: 'Good Friday', type: 'religious' },
            '04-06': { name: 'Easter Monday', type: 'religious' },
            '03-20': { name: 'Eid al-Fitr', type: 'religious' },
            '05-27': { name: 'Eid al-Adha', type: 'religious' }
        },
        '2027': {
            '03-26': { name: 'Good Friday', type: 'religious' },
            '03-29': { name: 'Easter Monday', type: 'religious' },
            '03-10': { name: 'Eid al-Fitr', type: 'religious' },
            '05-17': { name: 'Eid al-Adha', type: 'religious' }
        },
        '2028': {
            '04-14': { name: 'Good Friday', type: 'religious' },
            '04-17': { name: 'Easter Monday', type: 'religious' },
            '02-27': { name: 'Eid al-Fitr', type: 'religious' },
            '05-05': { name: 'Eid al-Adha', type: 'religious' }
        },
        '2029': {
            '03-30': { name: 'Good Friday', type: 'religious' },
            '04-02': { name: 'Easter Monday', type: 'religious' },
            '02-15': { name: 'Eid al-Fitr', type: 'religious' },
            '04-24': { name: 'Eid al-Adha', type: 'religious' }
        },
        '2030': {
            '04-19': { name: 'Good Friday', type: 'religious' },
            '04-22': { name: 'Easter Monday', type: 'religious' },
            '02-04': { name: 'Eid al-Fitr', type: 'religious' },
            '04-14': { name: 'Eid al-Adha', type: 'religious' }
        }
    };

    function getHoliday(day, month, year) {
        const key = String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');

        const yearKey = String(year);
        if (VARIABLE_HOLIDAYS[yearKey] && VARIABLE_HOLIDAYS[yearKey][key]) {
            return VARIABLE_HOLIDAYS[yearKey][key];
        }

        if (HOLIDAYS[key] && HOLIDAYS[key].yearly !== false) {
            return HOLIDAYS[key];
        }

        return null;
    }

    function isHoliday(day, month, year) {
        return getHoliday(day, month, year) !== null;
    }

    function getHolidaysForMonth(month, year) {
        const results = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let d = 1; d <= daysInMonth; d++) {
            const holiday = getHoliday(d, month, year);
            if (holiday) {
                results.push({
                    day: d,
                    month: month,
                    year: year,
                    name: holiday.name,
                    type: holiday.type
                });
            }
        }

        return results;
    }

    function getHolidaysForYear(year) {
        const results = [];
        for (let m = 0; m < 12; m++) {
            const monthHolidays = getHolidaysForMonth(m, year);
            monthHolidays.forEach(function(h) {
                results.push(h);
            });
        }
        return results;
    }

    function getUpcomingHolidays(daysAhead) {
        const today = new Date();
        const limit = new Date();
        limit.setDate(limit.getDate() + (daysAhead || 60));

        const results = [];
        const currentYear = today.getFullYear();
        const nextYear = currentYear + 1;

        [currentYear, nextYear].forEach(function(year) {
            const yearHolidays = getHolidaysForYear(year);
            yearHolidays.forEach(function(h) {
                const dateObj = new Date(h.year, h.month, h.day);
                if (dateObj >= today && dateObj <= limit) {
                    results.push(Object.assign({}, h, { date: dateObj }));
                }
            });
        });

        results.sort(function(a, b) { return a.date - b.date; });
        return results;
    }

    function getTodayHoliday() {
        const today = new Date();
        return getHoliday(today.getDate(), today.getMonth(), today.getFullYear());
    }

    function getTypeLabel(type) {
        switch (type) {
            case 'public': return 'Public Holiday';
            case 'religious': return 'Religious Holiday';
            case 'observance': return 'Observance';
            default: return 'Holiday';
        }
    }

    function getTypeColor(type) {
        switch (type) {
            case 'public': return 'holiday-public';
            case 'religious': return 'holiday-religious';
            case 'observance': return 'holiday-observance';
            default: return 'holiday-default';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function markCalendarHolidays() {
        document.querySelectorAll('.calendar-day').forEach(function(dayEl) {
            dayEl.querySelectorAll('.holiday-dot').forEach(function(dot) {
                dot.remove();
            });
            dayEl.classList.remove('is-holiday');
            dayEl.removeAttribute('title');

            const dayNum = dayEl.getAttribute('data-day');
            const monthNum = dayEl.getAttribute('data-month');
            const yearNum = dayEl.getAttribute('data-year');

            if (dayNum && monthNum && yearNum) {
                const holiday = getHoliday(parseInt(dayNum), parseInt(monthNum), parseInt(yearNum));
                if (holiday) {
                    dayEl.classList.add('is-holiday');
                    dayEl.setAttribute('title', holiday.name);

                    const dot = document.createElement('span');
                    dot.className = 'holiday-dot ' + getTypeColor(holiday.type);
                    dayEl.appendChild(dot);
                }
            }
        });
    }

    function renderHolidayList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const state = window.Calendria ? window.Calendria.getState() : null;
        if (!state) return;

        const holidays = getHolidaysForMonth(state.currentMonth, state.currentYear);

        if (holidays.length === 0) {
            container.innerHTML = [
                '<div class="holidays-empty">',
                '  <i class="bi bi-calendar-check"></i>',
                '  <p>No holidays this month</p>',
                '</div>'
            ].join('');
            return;
        }

        let html = '<div class="holidays-list">';
        holidays.forEach(function(h) {
            html += '<div class="holiday-item ' + getTypeColor(h.type) + '">';
            html += '<div class="holiday-date">';
            html += '<span class="holiday-day">' + h.day + '</span>';
            html += '<span class="holiday-month">' + monthNames()[h.month].slice(0, 3) + '</span>';
            html += '</div>';
            html += '<div class="holiday-info">';
            html += '<div class="holiday-name">' + escapeHtml(h.name) + '</div>';
            html += '<div class="holiday-type">' + getTypeLabel(h.type) + '</div>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function monthNames() {
        if (window.Calendria && window.Calendria.monthNames) {
            return window.Calendria.monthNames;
        }
        return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    }

    function renderUpcomingHolidays(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const upcoming = getUpcomingHolidays(60);

        if (upcoming.length === 0) {
            container.innerHTML = [
                '<div class="holidays-empty">',
                '  <i class="bi bi-calendar-check"></i>',
                '  <p>No upcoming holidays</p>',
                '</div>'
            ].join('');
            return;
        }

        let html = '<div class="holidays-list">';
        upcoming.forEach(function(h) {
            html += '<div class="holiday-item ' + getTypeColor(h.type) + '">';
            html += '<div class="holiday-date">';
            html += '<span class="holiday-day">' + h.day + '</span>';
            html += '<span class="holiday-month">' + monthNames()[h.month].slice(0, 3) + '</span>';
            html += '</div>';
            html += '<div class="holiday-info">';
            html += '<div class="holiday-name">' + escapeHtml(h.name) + '</div>';
            html += '<div class="holiday-type">' + getTypeLabel(h.type) + ' &middot; ' + h.year + '</div>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function init() {
        document.addEventListener('calendarRendered', function() {
            markCalendarHolidays();
        });

        document.addEventListener('daySelected', function(e) {
            const holiday = getHoliday(e.detail.day, e.detail.month, e.detail.year);
            if (holiday) {
                document.dispatchEvent(new CustomEvent('holidayDetected', {
                    detail: {
                        day: e.detail.day,
                        month: e.detail.month,
                        year: e.detail.year,
                        holiday: holiday
                    }
                }));
            }
        });

        renderHolidayList('holidaysList');
        renderUpcomingHolidays('upcomingHolidaysList');
    }

    window.CalendriaHolidays = {
        get: getHoliday,
        isHoliday: isHoliday,
        month: getHolidaysForMonth,
        year: getHolidaysForYear,
        upcoming: getUpcomingHolidays,
        today: getTodayHoliday,
        mark: markCalendarHolidays,
        render: renderHolidayList,
        renderUpcoming: renderUpcomingHolidays,
        typeLabel: getTypeLabel,
        typeColor: getTypeColor,
        all: HOLIDAYS,
        variable: VARIABLE_HOLIDAYS
    };

    document.addEventListener('DOMContentLoaded', init);
})();