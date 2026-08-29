// Система авторизации
class Auth {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.loadUsers();
    }

    // Загрузка пользователей из localStorage
    loadUsers() {
        const saved = localStorage.getItem('users');
        if (saved) {
            this.users = JSON.parse(saved);
        } else {
            // Для демонстрации создаем тестового пользователя
            this.users = [
                {
                    id: 1,
                    name: 'Тестовый Пользователь',
                    email: 'test@test.com',
                    password: '123456'
                }
            ];
            this.saveUsers();
        }
    }

    // Сохранение пользователей
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Регистрация
    register(name, email, password) {
        // Проверка на существующего пользователя
        if (this.users.find(u => u.email === email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            name: name.trim(),
            email: email.trim(),
            password: password
        };

        this.users.push(newUser);
        this.saveUsers();
        return { success: true, message: 'Регистрация успешна' };
    }

    // Вход
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user: user };
        }
        return { success: false, message: 'Неверный email или пароль' };
    }

    // Выход
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // Проверка авторизации
    checkAuth() {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            this.currentUser = JSON.parse(saved);
            return true;
        }
        return false;
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }
}

// Инициализация системы авторизации
const auth = new Auth();

// DOM элементы через querySelector
const authPage = document.querySelector('#authPage');
const appPage = document.querySelector('#appPage');
const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');

const loginEmail = document.querySelector('#loginEmail');
const loginPassword = document.querySelector('#loginPassword');
const loginBtn = document.querySelector('#loginBtn');

const registerName = document.querySelector('#registerName');
const registerEmail = document.querySelector('#registerEmail');
const registerPassword = document.querySelector('#registerPassword');
const registerConfirm = document.querySelector('#registerConfirm');
const registerBtn = document.querySelector('#registerBtn');

const showRegister = document.querySelector('#showRegister');
const showLogin = document.querySelector('#showLogin');
const userNameDisplay = document.querySelector('#userNameDisplay');
const logoutBtn = document.querySelector('#logoutBtn');

// Переключение между формами
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
});

// Регистрация
registerBtn.addEventListener('click', () => {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const confirm = registerConfirm.value;

    // Валидация
    if (!name || !email || !password || !confirm) {
        alert('Заполните все поля');
        return;
    }

    if (password.length < 6) {
        alert('Пароль должен быть минимум 6 символов');
        return;
    }

    if (password !== confirm) {
        alert('Пароли не совпадают');
        return;
    }

    if (!email.includes('@')) {
        alert('Введите корректный email');
        return;
    }

    const result = auth.register(name, email, password);
    if (result.success) {
        alert('Регистрация успешна! Теперь войдите в систему.');
        registerForm.style.display = 'none';
        loginForm.style.display = 'flex';
        registerName.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        registerConfirm.value = '';
        loginEmail.value = email;
    } else {
        alert(result.message);
    }
});

// Вход
loginBtn.addEventListener('click', () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        alert('Введите email и пароль');
        return;
    }

    const result = auth.login(email, password);
    if (result.success) {
        showApp(result.user);
    } else {
        alert(result.message);
    }
});

// Вход по Enter
loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

// Выход
logoutBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
        auth.logout();
        showAuth();
    }
});

// Показать приложение
function showApp(user) {
    authPage.style.display = 'none';
    appPage.style.display = 'block';
    userNameDisplay.textContent = `👤 ${user.name}`;
    // Инициализируем приложение после входа
    if (typeof initApp === 'function') {
        initApp();
    }
}

// Показать страницу авторизации
function showAuth() {
    authPage.style.display = 'block';
    appPage.style.display = 'none';
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    loginEmail.value = '';
    loginPassword.value = '';
}

// Проверка авторизации при загрузке
if (auth.checkAuth()) {
    const user = auth.getCurrentUser();
    showApp(user);
} else {
    showAuth();
}

// Экспортируем для использования в do.js
window.auth = auth;