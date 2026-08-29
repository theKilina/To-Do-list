// DOM элементы через querySelector
const taskInput = document.querySelector('#taskInput');
const addBtn = document.querySelector('#addBtn');
const taskList = document.querySelector('#taskList');
const totalCount = document.querySelector('#totalCount');
const completedCount = document.querySelector('#completedCount');

// Состояние приложения
let tasks = [];
let nextId = 1;
let currentUser = null;

// Работа с localStorage (с привязкой к пользователю)
function getStorageKey() {
    if (!currentUser) return null;
    return `tasks_${currentUser.id}`;
}

function saveTasks() {
    const key = getStorageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(tasks));
    localStorage.setItem(`${key}_nextId`, String(nextId));
}

function loadTasks() {
    const key = getStorageKey();
    if (!key) return;
    
    const savedTasks = localStorage.getItem(key);
    const savedNextId = localStorage.getItem(`${key}_nextId`);
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        // Если у пользователя нет задач, создаем примеры
        tasks = [
            { id: 1, text: 'Изучить JavaScript', completed: false },
            { id: 2, text: 'Сделать приложение', completed: false },
            { id: 3, text: 'Подготовиться к собеседованию', completed: true }
        ];
        nextId = 4;
    }
    if (savedNextId) {
        nextId = Number(savedNextId);
    }
}

// Отображение
function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="empty-message">Пока нет задач. Добавьте первую!</li>';
        updateStats();
        return;
    }
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        const span = document.createElement('span');
        span.className = `task-text ${task.completed ? 'completed' : ''}`;
        span.textContent = task.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        li.append(checkbox, span, deleteBtn);
        taskList.append(li);
    });
    
    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    totalCount.textContent = total;
    completedCount.textContent = completed;
}

// Управление задачами
function addTask() {
    const text = taskInput.value.trim();
    if (text === '') {
        alert('Введите текст задачи!');
        return;
    }
    
    tasks.push({
        id: nextId,
        text: text,
        completed: false
    });
    nextId++;
    
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

function deleteTask(id) {
    if (!confirm('Удалить задачу?')) return;
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Инициализация приложения
function initApp() {
    // Получаем текущего пользователя из системы авторизации
    if (window.auth) {
        currentUser = window.auth.getCurrentUser();
        if (currentUser) {
            loadTasks();
            renderTasks();
            taskInput.focus();
            
            // Добавляем обработчики событий
            addBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') addTask();
            });
        }
    }
}

// Сохраняем функцию для вызова из auth.js
window.initApp = initApp;

// Если пользователь уже авторизован при загрузке
if (window.auth && window.auth.checkAuth()) {
    initApp();
}