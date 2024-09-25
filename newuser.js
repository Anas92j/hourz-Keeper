
document.getElementById('createUserBtn').addEventListener('click', createUser);

function createUser() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    if (localStorage.getItem(newUsername)) {
        alert('اسم المستخدم موجود بالفعل');
    } else {
        const userData = { password: newPassword, reports: [] };
        localStorage.setItem(newUsername, JSON.stringify(userData));
        alert('تم إنشاء الحساب بنجاح');
        window.location.href = 'login.html';  // Redirect to the login page
    }
}
