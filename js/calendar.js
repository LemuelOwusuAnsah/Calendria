(function() {
    const fullDateDisplay = document.getElementById('fullDateDisplay');
    const gridEl = document.getElementById('calendarGrid');
    const calendarContainer = document.getElementById('calendarContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const todayBtn = document.getElementById('todayBtn');
    const dayInput = document.getElementById('dayInput');
    const monthInput = document.getElementById('monthInput');
    const yearInput = document.getElementById('yearInput');
    const goBtn = document.getElementById('goBtn');

    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();
    let selectedDay = currentDate.getDate();
    let selectedYear = currentYear;
    let selectedMonth = currentMonth;

    let touchStartY = 0;
    let isSwiping = false;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function updateFullDate(year, month, day) {
        const dateObj = new Date(year, month, day);
        const dayName = dayNames[dateObj.getDay()];
        const monthName = monthNames[dateObj.getMonth()];
        const dayNum = dateObj.getDate();
        const yearNum = dateObj.getFullYear();
        if (fullDateDisplay) {
            fullDateDisplay.textContent = dayName + ', ' + dayNum + ' ' + monthName + ', ' + yearNum;
        }
    }

    function renderCalendar(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        if (dayInput) dayInput.value = selectedDay;
        if (monthInput) monthInput.value = monthNames[month];
        if (yearInput) yearInput.value = year;

        if (gridEl) gridEl.innerHTML = '';
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            let dayNumber;
            let isOtherMonth = false;
            let displayMonth = month;
            let displayYear = year;

            if (i < firstDay) {
                dayNumber = daysInPrevMonth - firstDay + i + 1;
                isOtherMonth = true;
                if (month === 0) {
                    displayMonth = 11;
                    displayYear = year - 1;
                } else {
                    displayMonth = month - 1;
                }
            } else if (i >= firstDay + daysInMonth) {
                dayNumber = i - (firstDay + daysInMonth) + 1;
                isOtherMonth = true;
                if (month === 11) {
                    displayMonth = 0;
                    displayYear = year + 1;
                } else {
                    displayMonth = month + 1;
                }
            } else {
                dayNumber = i - firstDay + 1;
            }

            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = dayNumber;

            if (isOtherMonth) {
                dayDiv.classList.add('other-month');
            }

            if (!isOtherMonth && year === todayYear && month === todayMonth && dayNumber === todayDate) {
                dayDiv.classList.add('today');
            }

            if (!isOtherMonth && year === selectedYear && month === selectedMonth && dayNumber === selectedDay) {
                dayDiv.classList.add('selected');
            }

            if (!isOtherMonth) {
                dayDiv.setAttribute('data-day', dayNumber);
                dayDiv.setAttribute('data-month', month);
                dayDiv.setAttribute('data-year', year);

                dayDiv.addEventListener('click', function() {
                    selectDay(dayNumber, month, year);
                });

                dayDiv.addEventListener('touchend', function(e) {
                    if (!isSwiping) {
                        e.preventDefault();
                        selectDay(dayNumber, month, year);
                    }
                });
            }

            if (gridEl) gridEl.appendChild(dayDiv);
        }

        document.dispatchEvent(new CustomEvent('calendarRendered', {
            detail: { year: year, month: month }
        }));
    }

    function selectDay(day, month, year) {
        selectedDay = day;
        selectedMonth = month;
        selectedYear = year;
        updateFullDate(year, month, day);
        renderCalendar(currentYear, currentMonth);

        if (typeof window.CalendriaEvents !== 'undefined') {
            window.CalendriaEvents.render(day, month, year);
        }

        if (typeof window.CalendriaHistory !== 'undefined') {
            window.CalendriaHistory.add(day, month, year);
        }

        document.dispatchEvent(new CustomEvent('daySelected', {
            detail: { day: day, month: month, year: year }
        }));
    }

    function changeYear(delta) {
        currentYear += delta;
        if (selectedDay > new Date(currentYear, currentMonth + 1, 0).getDate()) {
            selectedDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        }
        selectedYear = currentYear;
        renderCalendar(currentYear, currentMonth);
        updateFullDate(currentYear, currentMonth, selectedDay);
    }

    function changeMonth(delta) {
        currentMonth += delta;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        if (selectedDay > new Date(currentYear, currentMonth + 1, 0).getDate()) {
            selectedDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        }
        selectedYear = currentYear;
        selectedMonth = currentMonth;
        renderCalendar(currentYear, currentMonth);
        updateFullDate(currentYear, currentMonth, selectedDay);
    }

    function goToToday() {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();
        selectedDay = today.getDate();
        selectedYear = currentYear;
        selectedMonth = currentMonth;
        renderCalendar(currentYear, currentMonth);
        updateFullDate(currentYear, currentMonth, selectedDay);

        if (typeof window.CalendriaEvents !== 'undefined') {
            window.CalendriaEvents.render(selectedDay, selectedMonth, selectedYear);
        }
    }

    function goToDate() {
        const dayVal = parseInt(dayInput ? dayInput.value : '');
        const monthVal = monthInput ? monthInput.value.trim() : '';
        const yearVal = parseInt(yearInput ? yearInput.value : '');
        let valid = false;
        let targetDay = selectedDay;
        let targetMonth = currentMonth;
        let targetYear = currentYear;

        if (!isNaN(dayVal) && dayVal >= 1 && dayVal <= 31) {
            targetDay = dayVal;
            valid = true;
        }

        if (monthVal !== '') {
            const lowerVal = monthVal.toLowerCase();
            const matchedIndex = monthNames.findIndex(function(name) {
                return name.toLowerCase() === lowerVal;
            });
            if (matchedIndex !== -1) {
                targetMonth = matchedIndex;
                valid = true;
            } else {
                if (monthInput) monthInput.value = monthNames[currentMonth];
                return;
            }
        }

        if (!isNaN(yearVal) && yearVal >= 1900 && yearVal <= 2100) {
            targetYear = yearVal;
            valid = true;
        } else if (yearVal !== '' && !isNaN(yearVal)) {
            if (yearInput) yearInput.value = currentYear;
            return;
        }

        if (valid) {
            const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate();
            if (targetDay > maxDay) {
                targetDay = maxDay;
                if (dayInput) dayInput.value = targetDay;
            }
            currentYear = targetYear;
            currentMonth = targetMonth;
            selectedDay = targetDay;
            selectedYear = targetYear;
            selectedMonth = targetMonth;
            renderCalendar(currentYear, currentMonth);
            updateFullDate(currentYear, currentMonth, selectedDay);

            if (typeof window.CalendriaEvents !== 'undefined') {
                window.CalendriaEvents.render(selectedDay, selectedMonth, selectedYear);
            }
        }
    }

    function initSwipe() {
        if (!calendarContainer) return;

        calendarContainer.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
            isSwiping = false;
        }, { passive: true });

        calendarContainer.addEventListener('touchmove', function(e) {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            if (Math.abs(deltaY) > 40) {
                isSwiping = true;
                if (deltaY > 0) {
                    changeYear(-1);
                } else {
                    changeYear(1);
                }
                touchStartY = touchY;
            }
        }, { passive: true });

        calendarContainer.addEventListener('wheel', function(e) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    changeYear(1);
                } else {
                    changeYear(-1);
                }
            }
        }, { passive: false });
    }

    function initEventListeners() {
        if (prevBtn) prevBtn.addEventListener('click', function() { changeMonth(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function() { changeMonth(1); });
        if (todayBtn) todayBtn.addEventListener('click', goToToday);
        if (goBtn) goBtn.addEventListener('click', goToDate);

        if (dayInput) {
            dayInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') goBtn.click();
            });
        }
        if (monthInput) {
            monthInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') goBtn.click();
            });
        }
        if (yearInput) {
            yearInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') goBtn.click();
            });
        }
    }

    function getState() {
        return {
            currentYear: currentYear,
            currentMonth: currentMonth,
            selectedDay: selectedDay,
            selectedMonth: selectedMonth,
            selectedYear: selectedYear
        };
    }

    function setState(state) {
        if (state.currentYear !== undefined) currentYear = state.currentYear;
        if (state.currentMonth !== undefined) currentMonth = state.currentMonth;
        if (state.selectedDay !== undefined) selectedDay = state.selectedDay;
        if (state.selectedMonth !== undefined) selectedMonth = state.selectedMonth;
        if (state.selectedYear !== undefined) selectedYear = state.selectedYear;
        renderCalendar(currentYear, currentMonth);
        updateFullDate(selectedYear, selectedMonth, selectedDay);
    }

    function init() {
        initEventListeners();
        initSwipe();
        renderCalendar(currentYear, currentMonth);
        updateFullDate(currentYear, currentMonth, selectedDay);
    }

    window.Calendria = {
        render: renderCalendar,
        selectDay: selectDay,
        prevMonth: function() { changeMonth(-1); },
        nextMonth: function() { changeMonth(1); },
        today: goToToday,
        goTo: goToDate,
        getState: getState,
        setState: setState,
        monthNames: monthNames,
        dayNames: dayNames
    };

    document.addEventListener('DOMContentLoaded', init);
})();