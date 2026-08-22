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
        fullDateDisplay.textContent = dayName + ', ' + dayNum + ' ' + monthName + ', ' + yearNum;
    }

    function renderCalendar(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        if (dayInput.value != selectedDay) {
            dayInput.value = selectedDay;
        }
        if (monthInput.value !== monthNames[month]) {
            monthInput.value = monthNames[month];
        }
        if (yearInput.value != year) {
            yearInput.value = year;
        }

        gridEl.innerHTML = '';
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            let dayNumber;
            let isOtherMonth = false;

            if (i < firstDay) {
                dayNumber = daysInPrevMonth - firstDay + i + 1;
                isOtherMonth = true;
            } else if (i >= firstDay + daysInMonth) {
                dayNumber = i - (firstDay + daysInMonth) + 1;
                isOtherMonth = true;
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
                dayDiv.addEventListener('click', function() {
                    selectedDay = dayNumber;
                    selectedYear = year;
                    selectedMonth = month;
                    updateFullDate(year, month, dayNumber);
                    renderCalendar(year, month);
                });

                dayDiv.addEventListener('touchend', function(e) {
                    if (!isSwiping) {
                        selectedDay = dayNumber;
                        selectedYear = year;
                        selectedMonth = month;
                        updateFullDate(year, month, dayNumber);
                        renderCalendar(year, month);
                    }
                });
            }

            gridEl.appendChild(dayDiv);
        }
    }

    function changeYear(delta) {
        currentYear += delta;
        if (selectedDay > new Date(currentYear, currentMonth, 0).getDate()) {
            selectedDay = new Date(currentYear, currentMonth, 0).getDate();
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
        if (selectedDay > new Date(currentYear, currentMonth, 0).getDate()) {
            selectedDay = new Date(currentYear, currentMonth, 0).getDate();
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
    }

    function goToDate() {
        const dayVal = parseInt(dayInput.value);
        const monthVal = monthInput.value.trim();
        const yearVal = parseInt(yearInput.value);
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
            const matchedIndex = monthNames.findIndex(name => name.toLowerCase() === lowerVal);
            if (matchedIndex !== -1) {
                targetMonth = matchedIndex;
                valid = true;
            } else {
                monthInput.value = monthNames[currentMonth];
                return;
            }
        }

        if (!isNaN(yearVal) && yearVal >= 1900 && yearVal <= 2100) {
            targetYear = yearVal;
            valid = true;
        } else if (yearVal !== '' && !isNaN(yearVal)) {
            yearInput.value = currentYear;
            return;
        }

        if (valid) {
            const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate();
            if (targetDay > maxDay) {
                targetDay = maxDay;
                dayInput.value = targetDay;
            }
            currentYear = targetYear;
            currentMonth = targetMonth;
            selectedDay = targetDay;
            selectedYear = targetYear;
            selectedMonth = targetMonth;
            renderCalendar(currentYear, currentMonth);
            updateFullDate(currentYear, currentMonth, selectedDay);
        }
    }

    calendarContainer.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
    }, { passive: true });

    calendarContainer.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        if (Math.abs(deltaY) > 30) {
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

    prevBtn.addEventListener('click', function() {
        changeMonth(-1);
    });

    nextBtn.addEventListener('click', function() {
        changeMonth(1);
    });

    todayBtn.addEventListener('click', goToToday);

    dayInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            goBtn.click();
        }
    });

    monthInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            goBtn.click();
        }
    });

    yearInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            goBtn.click();
        }
    });

    goBtn.addEventListener('click', goToDate);

    renderCalendar(currentYear, currentMonth);
    updateFullDate(currentYear, currentMonth, selectedDay);

    document.addEventListener('DOMContentLoaded', function() {
        const htmlEl = document.documentElement;
        const themeToggle = document.createElement('button');
        themeToggle.className = 'btn btn-outline-secondary btn-sm position-fixed bottom-0 end-0 m-3 rounded-circle';
        themeToggle.style.width = '44px';
        themeToggle.style.height = '44px';
        themeToggle.style.zIndex = '1050';
        themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        document.body.appendChild(themeToggle);

        themeToggle.addEventListener('click', function() {
            const currentTheme = htmlEl.getAttribute('data-bs-theme');
            if (currentTheme === 'dark') {
                htmlEl.setAttribute('data-bs-theme', 'light');
                themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
            } else {
                htmlEl.setAttribute('data-bs-theme', 'dark');
                themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
            }
        });
    });
})();