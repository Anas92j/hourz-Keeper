
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('newUserBtn').addEventListener('click', function() {
    window.location.href = 'new_user.html';
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const storedUser = localStorage.getItem(username);

    if (storedUser) {
        const storedData = JSON.parse(storedUser);
        if (storedData.password === password) {
            alert('تسجيل الدخول ناجح');
            localStorage.setItem('loggedInUser', username);
            window.location.href = 'index.html';  // Redirect to the main program interface
        } else {
            alert('كلمة المرور غير صحيحة');
        }
    } else {
        alert('اسم المستخدم غير موجود');
    }
}
