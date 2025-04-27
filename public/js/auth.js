// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const logoutLink = document.getElementById('logoutLink');
const authLinks = document.getElementById('authLinks');
const userLinks = document.getElementById('userLinks');
const expenseTracker = document.getElementById('expenseTracker');
const authForms = document.getElementById('authForms');

// Check if user is logged in
const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
        showExpenseTracker();
    } else {
        showAuthForms();
    }
};

// Show expense tracker
const showExpenseTracker = () => {
    authForms.classList.add('d-none');
    expenseTracker.classList.remove('d-none');
    authLinks.classList.add('d-none');
    userLinks.classList.remove('d-none');
};

// Show auth forms
const showAuthForms = () => {
    authForms.classList.remove('d-none');
    expenseTracker.classList.add('d-none');
    authLinks.classList.remove('d-none');
    userLinks.classList.add('d-none');
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
};

// Event Listeners
loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
});

registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('d-none');
    registerForm.classList.remove('d-none');
});

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    showAuthForms();
});

// Login Form Submit
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            showExpenseTracker();
            loadExpenses();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error logging in');
    }
});

// Register Form Submit
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            showExpenseTracker();
            loadExpenses();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error registering');
    }
});

// Check auth status on page load
checkAuth(); 