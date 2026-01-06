/**
 * Willnicht - Auth Modal Logic for index.html
 */

// ========================================
// DOM ELEMENTS
// ========================================
const authModal = document.getElementById('authModal');
const authModalBackdrop = document.getElementById('authModalBackdrop');
const authModalClose = document.getElementById('authModalClose');
const registerFormModal = document.getElementById('registerFormModal');
const loginFormModal = document.getElementById('loginFormModal');

// Buttons that open the modal
const startFreeBtn = document.getElementById('startFreeBtn');
const heroStartBtn = document.querySelector('.hero-start-btn');
const mobileStartFreeBtns = document.querySelectorAll('.mobile-start-free-btn');

// Forms
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Switch links
const showLoginFormFromRegister = document.getElementById('showLoginFormFromRegister');
const showRegisterFormFromLogin = document.getElementById('showRegisterFormFromLogin');

// ========================================
// MODAL FUNCTIONS
// ========================================

/**
 * Open auth modal with register form
 */
function openAuthModal() {
    if (authModal) {
        authModal.hidden = false;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        showRegisterForm();
    }
}

/**
 * Close auth modal
 */
function closeAuthModal() {
    if (authModal) {
        authModal.hidden = true;
        document.body.style.overflow = ''; // Restore scrolling
    }
}

/**
 * Show register form, hide login form
 */
function showRegisterForm() {
    if (registerFormModal) registerFormModal.hidden = false;
    if (loginFormModal) loginFormModal.hidden = true;
}

/**
 * Show login form, hide register form
 */
function showLoginForm() {
    if (registerFormModal) registerFormModal.hidden = true;
    if (loginFormModal) loginFormModal.hidden = false;
}

/**
 * Redirect to app.html after successful auth
 */
function redirectToApp() {
    window.location.href = 'app.html';
}

// ========================================
// EVENT LISTENERS
// ========================================

// Open modal on button click
startFreeBtn?.addEventListener('click', openAuthModal);
heroStartBtn?.addEventListener('click', openAuthModal);
mobileStartFreeBtns.forEach(btn => btn?.addEventListener('click', openAuthModal));

// Close modal
authModalClose?.addEventListener('click', closeAuthModal);
authModalBackdrop?.addEventListener('click', closeAuthModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !authModal?.hidden) {
        closeAuthModal();
    }
});

// Switch between forms
showLoginFormFromRegister?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

showRegisterFormFromLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});

// ========================================
// FORM SUBMISSION
// ========================================

registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;

    if (!email || !password || !passwordConfirm) {
        showNotification(t('notify_fill_all_fields') || 'Заполните все поля', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showNotification(t('notify_passwords_dont_match') || 'Пароли не совпадают', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification(t('notify_password_too_short') || 'Пароль должен быть минимум 6 символов', 'error');
        return;
    }

    try {
        showNotification(t('notify_registering') || 'Регистрация...', 'info');

        const data = await signUp(email, password);

        if (data.user) {
            showNotification(t('notify_register_success') || 'Регистрация успешна! Перенаправление...', 'success');
            setTimeout(() => redirectToApp(), 1500);
        }
    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = t('notify_register_error') || 'Ошибка регистрации';

        if (error.message.includes('User already registered')) {
            errorMessage = t('notify_user_exists') || 'Пользователь с таким email уже существует';
        } else {
            errorMessage = `${errorMessage}: ${error.message}`;
        }

        showNotification(errorMessage, 'error');
    }
});

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showNotification(t('notify_fill_all_fields') || 'Заполните все поля', 'error');
        return;
    }

    try {
        showNotification(t('notify_logging_in') || 'Вход...', 'info');

        const data = await signIn(email, password);

        if (data.user) {
            showNotification(t('notify_login_success') || 'Вход выполнен успешно! Перенаправление...', 'success');
            setTimeout(() => redirectToApp(), 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = t('notify_login_error') || 'Ошибка входа';

        if (error.message.includes('Invalid login credentials')) {
            errorMessage = t('notify_invalid_credentials') || 'Неверный email или пароль';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = t('notify_email_not_confirmed') || 'Email не подтвержден';
        } else {
            errorMessage = `${errorMessage}: ${error.message}`;
        }

        showNotification(errorMessage, 'error');
    }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Show notification toast (simple version)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 20px;
        background: ${type === 'error' ? '#fee' : type === 'success' ? '#efe' : '#fff'};
        border-left: 4px solid ${type === 'error' ? '#f44' : type === 'success' ? '#4c4' : '#44f'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
