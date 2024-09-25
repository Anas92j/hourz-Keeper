
document.getElementById('calculateBtn').addEventListener('click', calculateHours);
document.getElementById('logoutBtn').addEventListener('click', logout);

let totalWorkHours = 0;
let totalOvertime = 0;
let hourlyRate = localStorage.getItem('savedHourlyRate') ? parseFloat(localStorage.getItem('savedHourlyRate')) : 0;
let overtimeRate = localStorage.getItem('savedOvertimeRate') ? parseFloat(localStorage.getItem('savedOvertimeRate')) : 0;
let currencySymbol = localStorage.getItem('savedCurrencySymbol') || '';  // Default currency should be blank initially
let workData = [];

window.onload = function() {
    const currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = currentDate;
    document.getElementById('startTime').value = new Date().toLocaleTimeString('ar-EG', { hour12: false }).substring(0, 5);
    
    // Load saved hourly and overtime rates if available
    if (localStorage.getItem('savedHourlyRate')) {
        document.getElementById('hourlyRate').value = localStorage.getItem('savedHourlyRate');
    }
    if (localStorage.getItem('savedOvertimeRate')) {
        document.getElementById('overtimeRate').value = localStorage.getItem('savedOvertimeRate');
    }

    const username = localStorage.getItem('loggedInUser');
    if (username) {
        const userData = JSON.parse(localStorage.getItem(username));
        if (userData && userData.reports) {
            workData = userData.reports;
            refreshTable();
        }
    } else {
        alert('يرجى تسجيل الدخول أولاً');
        window.location.href = 'login.html';
    }
}

function calculateHours() {
    const dateInput = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
    overtimeRate = parseFloat(document.getElementById('overtimeRate').value);
    currencySymbol = document.getElementById('currency').value;

    // Save the hourly and overtime rates locally
    if (hourlyRate && overtimeRate) {
        localStorage.setItem('savedHourlyRate', hourlyRate);
        localStorage.setItem('savedOvertimeRate', overtimeRate);
        localStorage.setItem('savedCurrencySymbol', currencySymbol);
    }

    if (dateInput && startTime) {
        const date = new Date(dateInput);
        const day = getDayName(date);
        const start = new Date('1970-01-01T' + startTime + 'Z');
        const end = endTime ? new Date('1970-01-01T' + endTime + 'Z') : null;
        let workHours = end ? (end - start) / (1000 * 60 * 60) : null;

        if (workHours < 0) workHours += 24;

        let overtime = 0;
        if (workHours && workHours > 8) {
            overtime = workHours - 8;
            workHours = 8;
        }

        const entry = { date: dateInput, day, startTime, endTime: endTime || "غير مكتمل", workHours: workHours ? workHours.toFixed(2) : "غير مكتمل", overtime: overtime.toFixed(2) };
        workData.push(entry);
        addRowToTable(workData.length - 1, entry);
        updateTotals();

        document.getElementById('exportBtn').style.display = 'block';
        document.getElementById('exportBtn').addEventListener('click', exportTableToExcel);
    } else {
        alert('يرجى ملء حقل التاريخ ووقت البدء على الأقل.');
    }
}

function getDayName(date) {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
}

function addRowToTable(index, entry) {
    const table = document.getElementById('workTable').querySelector('tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.day}</td>
        <td>${entry.startTime}</td>
        <td>${entry.endTime}</td>
        <td>${entry.workHours}</td>
        <td>${entry.overtime}</td>
        <td>
            <button onclick="editEntry(${index})">تعديل</button>
            <button onclick="deleteEntry(${index})">حذف</button>
        </td>
    `;

    table.appendChild(row);
    document.getElementById('workTable').style.display = 'table';
}

function updateTotals() {
    totalWorkHours = workData.reduce((sum, entry) => sum + (parseFloat(entry.workHours) || 0), 0);
    totalOvertime = workData.reduce((sum, entry) => sum + (parseFloat(entry.overtime) || 0), 0);

    const totalEarnings = (totalWorkHours * hourlyRate) + (totalOvertime * overtimeRate);

    document.getElementById('totalWorkHours').innerText = totalWorkHours.toFixed(2);
    document.getElementById('totalOvertime').innerText = totalOvertime.toFixed(2);
    document.getElementById('totalEarnings').innerText = totalEarnings.toFixed(2) + ' (' + currencySymbol + ')';
}

function deleteEntry(index) {
    workData.splice(index, 1);
    refreshTable();
}

function editEntry(index) {
    const entry = workData[index];
    document.getElementById('date').value = entry.date;
    document.getElementById('startTime').value = entry.startTime;
    document.getElementById('endTime').value = entry.endTime;

    deleteEntry(index);
}

function refreshTable() {
    const table = document.getElementById('workTable').querySelector('tbody');
    table.innerHTML = '';
    workData.forEach((entry, index) => addRowToTable(index, entry));
    updateTotals();
}

function exportTableToExcel() {
    const table = document.getElementById('workTable');
    const wb = XLSX.utils.table_to_book(table, {sheet:"الورقة1"});
    XLSX.writeFile(wb, "تقرير ساعات العمل.xlsx");
}

function logout() {
    const username = localStorage.getItem('loggedInUser');
    if (username) {
        const userData = JSON.parse(localStorage.getItem(username));
        userData.reports = workData;  // Save reports to the user data
        localStorage.setItem(username, JSON.stringify(userData));
        localStorage.removeItem('loggedInUser');  // Clear logged in state
        window.location.href = 'login.html';  // Redirect to login page
    }
}
