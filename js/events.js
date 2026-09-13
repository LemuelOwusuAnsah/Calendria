(function() {
    const STORAGE_KEY = 'calendria_events';

    let currentDay = null;
    let currentMonth = null;
    let currentYear = null;
    let editingId = null;

    function loadAll() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {}
        return {};
    }

    function saveAll(events) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch (e) {}
    }

    function getKey(day, month, year) {
        return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    function getEvents(day, month, year) {
        const all = loadAll();
        const key = getKey(day, month, year);
        return all[key] || [];
    }

    function hasEvents(day, month, year) {
        return getEvents(day, month, year).length > 0;
    }

    function addEvent(day, month, year, title, time, description, color) {
        if (!title || title.trim() === '') return null;

        const all = loadAll();
        const key = getKey(day, month, year);
        if (!all[key]) all[key] = [];

        const event = {
            id: generateId(),
            title: title.trim(),
            time: time || '',
            description: (description || '').trim(),
            color: color || 'default',
            createdAt: new Date().toISOString()
        };

        all[key].push(event);
        saveAll(all);
        return event;
    }

    function updateEvent(day, month, year, id, updates) {
        const all = loadAll();
        const key = getKey(day, month, year);
        if (!all[key]) return null;

        const index = all[key].findIndex(function(e) { return e.id === id; });
        if (index === -1) return null;

        all[key][index] = Object.assign({}, all[key][index], updates);
        saveAll(all);
        return all[key][index];
    }

    function deleteEvent(day, month, year, id) {
        const all = loadAll();
        const key = getKey(day, month, year);
        if (!all[key]) return false;

        const before = all[key].length;
        all[key] = all[key].filter(function(e) { return e.id !== id; });
        if (all[key].length === 0) {
            delete all[key];
        }
        saveAll(all);

        document.dispatchEvent(new CustomEvent('eventsChanged', {
            detail: { day: day, month: month, year: year }
        }));

        return before !== (all[key] ? all[key].length : 0);
    }

    function deleteAllForDay(day, month, year) {
        const all = loadAll();
        const key = getKey(day, month, year);
        if (all[key]) {
            delete all[key];
            saveAll(all);
        }

        document.dispatchEvent(new CustomEvent('eventsChanged', {
            detail: { day: day, month: month, year: year }
        }));
    }

    function clearAllEvents() {
        saveAll({});
        document.dispatchEvent(new CustomEvent('eventsChanged', {
            detail: { all: true }
        }));
    }

    function getUpcomingEvents(daysAhead) {
        const all = loadAll();
        const now = new Date();
        const limit = new Date();
        limit.setDate(limit.getDate() + (daysAhead || 30));

        const upcoming = [];
        Object.keys(all).forEach(function(key) {
            const parts = key.split('-');
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const day = parseInt(parts[2]);
            const dateObj = new Date(year, month, day);

            if (dateObj >= now && dateObj <= limit) {
                all[key].forEach(function(event) {
                    upcoming.push(Object.assign({}, event, {
                        day: day,
                        month: month,
                        year: year,
                        date: dateObj
                    }));
                });
            }
        });

        upcoming.sort(function(a, b) { return a.date - b.date; });
        return upcoming;
    }

    function getTodayEvents() {
        const today = new Date();
        return getEvents(today.getDate(), today.getMonth(), today.getFullYear());
    }

    function getEventCount() {
        const all = loadAll();
        let count = 0;
        Object.keys(all).forEach(function(key) {
            count += all[key].length;
        });
        return count;
    }

    function formatDate(day, month, year) {
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getColorClass(color) {
        const allowed = ['default', 'blue', 'green', 'red', 'yellow', 'purple', 'orange'];
        if (allowed.indexOf(color) === -1) return 'default';
        return color;
    }

    function renderEventList(container) {
        if (!container) return;

        const events = getEvents(currentDay, currentMonth, currentYear);

        if (events.length === 0) {
            container.innerHTML = [
                '<div class="events-empty">',
                '  <i class="bi bi-calendar-x"></i>',
                '  <p>No events for this day</p>',
                '</div>'
            ].join('');
            return;
        }

        let html = '<div class="events-list">';
        events.forEach(function(event) {
            const colorClass = getColorClass(event.color);
            html += '<div class="event-item event-color-' + colorClass + '" data-id="' + event.id + '">';
            html += '<div class="event-item-header">';
            html += '<span class="event-item-color-dot"></span>';
            html += '<span class="event-item-title">' + escapeHtml(event.title) + '</span>';
            html += '<div class="event-item-actions">';
            html += '<button class="event-edit-btn" data-edit-id="' + event.id + '" aria-label="Edit"><i class="bi bi-pencil"></i></button>';
            html += '<button class="event-delete-btn" data-delete-id="' + event.id + '" aria-label="Delete"><i class="bi bi-trash3"></i></button>';
            html += '</div>';
            html += '</div>';
            if (event.time) {
                html += '<div class="event-item-time"><i class="bi bi-clock"></i> ' + escapeHtml(event.time) + '</div>';
            }
            if (event.description) {
                html += '<div class="event-item-desc">' + escapeHtml(event.description) + '</div>';
            }
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        container.querySelectorAll('[data-delete-id]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.deleteId;
                if (confirm('Delete this event?')) {
                    deleteEvent(currentDay, currentMonth, currentYear, id);
                    render(currentDay, currentMonth, currentYear);
                }
            });
        });

        container.querySelectorAll('[data-edit-id]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.editId;
                openEditForm(id);
            });
        });
    }

    function renderForm(container) {
        if (!container) return;

        const colors = ['default', 'blue', 'green', 'red', 'yellow', 'purple', 'orange'];
        let colorOptions = '';
        colors.forEach(function(c) {
            colorOptions += '<option value="' + c + '">' + c.charAt(0).toUpperCase() + c.slice(1) + '</option>';
        });

        container.innerHTML = [
            '<div class="event-form">',
            '  <h4 class="event-form-title">' + (editingId ? 'Edit Event' : 'Add Event') + '</h4>',
            '  <div class="event-form-row">',
            '    <input type="text" id="eventTitleInput" placeholder="Event title" maxlength="80">',
            '  </div>',
            '  <div class="event-form-row event-form-row-2">',
            '    <input type="time" id="eventTimeInput">',
            '    <select id="eventColorInput">' + colorOptions + '</select>',
            '  </div>',
            '  <div class="event-form-row">',
            '    <textarea id="eventDescInput" placeholder="Description (optional)" rows="2" maxlength="200"></textarea>',
            '  </div>',
            '  <div class="event-form-actions">',
            '    <button class="event-cancel-btn" id="eventCancelBtn">Cancel</button>',
            '    <button class="event-save-btn" id="eventSaveBtn">' + (editingId ? 'Update' : 'Save') + '</button>',
            '  </div>',
            '</div>'
        ].join('');

        const titleInput = document.getElementById('eventTitleInput');
        const cancelBtn = document.getElementById('eventCancelBtn');
        const saveBtn = document.getElementById('eventSaveBtn');

        if (titleInput) titleInput.focus();

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                editingId = null;
                render(currentDay, currentMonth, currentYear);
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                saveCurrentEvent();
            });
        }

        if (titleInput) {
            titleInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    saveCurrentEvent();
                }
            });
        }
    }

    function saveCurrentEvent() {
        const titleInput = document.getElementById('eventTitleInput');
        const timeInput = document.getElementById('eventTimeInput');
        const colorInput = document.getElementById('eventColorInput');
        const descInput = document.getElementById('eventDescInput');

        const title = titleInput ? titleInput.value.trim() : '';
        if (title === '') {
            titleInput.classList.add('input-error');
            titleInput.focus();
            return;
        }

        if (editingId) {
            updateEvent(currentDay, currentMonth, currentYear, editingId, {
                title: title,
                time: timeInput ? timeInput.value : '',
                color: colorInput ? colorInput.value : 'default',
                description: descInput ? descInput.value.trim() : ''
            });
            editingId = null;
        } else {
            addEvent(
                currentDay,
                currentMonth,
                currentYear,
                title,
                timeInput ? timeInput.value : '',
                descInput ? descInput.value.trim() : '',
                colorInput ? colorInput.value : 'default'
            );
        }

        document.dispatchEvent(new CustomEvent('eventsChanged', {
            detail: { day: currentDay, month: currentMonth, year: currentYear }
        }));

        render(currentDay, currentMonth, currentYear);
    }

    function openEditForm(id) {
        const events = getEvents(currentDay, currentMonth, currentYear);
        const event = events.find(function(e) { return e.id === id; });
        if (!event) return;

        editingId = id;
        renderPanel();
        renderForm(document.getElementById('eventsFormContainer'));

        const titleInput = document.getElementById('eventTitleInput');
        const timeInput = document.getElementById('eventTimeInput');
        const colorInput = document.getElementById('eventColorInput');
        const descInput = document.getElementById('eventDescInput');

        if (titleInput) titleInput.value = event.title;
        if (timeInput) timeInput.value = event.time || '';
        if (colorInput) colorInput.value = event.color || 'default';
        if (descInput) descInput.value = event.description || '';
    }

    function renderPanel() {
        const panel = document.getElementById('eventsPanel');
        if (!panel) return;

        const dateStr = formatDate(currentDay, currentMonth, currentYear);

        panel.innerHTML = [
            '<div class="events-header">',
            '  <div class="events-header-title">',
            '    <i class="bi bi-calendar-event"></i>',
            '    <span>' + dateStr + '</span>',
            '  </div>',
            '  <button class="events-add-btn" id="eventsAddBtn">',
            '    <i class="bi bi-plus-lg"></i> Add',
            '  </button>',
            '</div>',
            '<div id="eventsListContainer"></div>',
            '<div id="eventsFormContainer" class="events-form-container hidden"></div>'
        ].join('');

        const addBtn = document.getElementById('eventsAddBtn');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                editingId = null;
                const formContainer = document.getElementById('eventsFormContainer');
                const listContainer = document.getElementById('eventsListContainer');
                if (formContainer) {
                    formContainer.classList.remove('hidden');
                    renderForm(formContainer);
                }
                if (listContainer) listContainer.classList.add('hidden');
            });
        }

        renderEventList(document.getElementById('eventsListContainer'));
    }

    function render(day, month, year) {
        currentDay = day;
        currentMonth = month;
        currentYear = year;
        editingId = null;
        renderPanel();
    }

    function markDaysWithEvents() {
        const all = loadAll();
        document.querySelectorAll('.calendar-day').forEach(function(dayEl) {
            dayEl.querySelectorAll('.event-indicator').forEach(function(ind) {
                ind.remove();
            });

            const dayNum = dayEl.getAttribute('data-day');
            const monthNum = dayEl.getAttribute('data-month');
            const yearNum = dayEl.getAttribute('data-year');

            if (dayNum && monthNum && yearNum) {
                const key = getKey(parseInt(dayNum), parseInt(monthNum), parseInt(yearNum));
                if (all[key] && all[key].length > 0) {
                    const indicator = document.createElement('span');
                    indicator.className = 'event-indicator';
                    indicator.textContent = all[key].length;
                    dayEl.appendChild(indicator);
                }
            }
        });
    }

    function init() {
        document.addEventListener('daySelected', function(e) {
            render(e.detail.day, e.detail.month, e.detail.year);
        });

        document.addEventListener('calendarRendered', function() {
            markDaysWithEvents();
        });

        document.addEventListener('eventsChanged', function() {
            markDaysWithEvents();
        });

        const today = new Date();
        render(today.getDate(), today.getMonth(), today.getFullYear());
    }

    window.CalendriaEvents = {
        render: render,
        add: addEvent,
        update: updateEvent,
        delete: deleteEvent,
        deleteAllForDay: deleteAllForDay,
        clearAll: clearAllEvents,
        get: getEvents,
        has: hasEvents,
        upcoming: getUpcomingEvents,
        today: getTodayEvents,
        count: getEventCount,
        refreshIndicators: markDaysWithEvents
    };

    document.addEventListener('DOMContentLoaded', init);
})();