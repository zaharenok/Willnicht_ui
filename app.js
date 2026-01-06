/**
 * Willnicht - AI Product Evaluation SaaS
 * JavaScript Application Logic
 */

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    // Webhook endpoint for AI processing (Make.com)
    // Replace with your actual webhook URL
    webhookUrl: 'YOUR_WEBHOOK_URL_HERE',

    // User settings
    userEmail: 'user@example.com',
    languageChoice: 'German', // Default language for descriptions
    pageAndSection: 'https://www.willnicht.com/app#form1',

    // File upload limits
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],

    // UI settings
    animationDuration: 300,

    // Storage keys
    storageKey: 'willnicht_results'
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} unsafe - Unsafe string from user input
 * @returns {string} - Escaped string safe for HTML
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ========================================
// STATE MANAGEMENT
// ========================================
const state = {
    files: [],
    results: [],
    isLoading: false
};

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    // ... other elements
    header: document.getElementById('header'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    uploadPreview: document.getElementById('uploadPreview'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    resultsSection: document.getElementById('results'),
    resultsGrid: document.getElementById('resultsGrid'),
    resultsEmpty: document.getElementById('resultsEmpty'),
    exportBtn: document.getElementById('exportBtn'),
    clearBtn: document.getElementById('clearBtn'),
    // Auth elements
    loginSection: document.getElementById('loginSection'),
    appWrapper: document.getElementById('appWrapper'),
    loginForm: document.getElementById('loginForm'),
    userMenu: document.getElementById('userMenu'),
    logoutBtn: document.getElementById('logoutBtn'),
    userEmailDisplay: document.getElementById('userEmailDisplay'),
    // Split view elements
    latestResultContainer: document.getElementById('latestResultContainer'),
    latestResultContent: document.getElementById('latestResultContent')
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initI18n(); // Initialize translations first
    initMobileMenu();
    initUploadArea();
    initButtons();
    loadSavedResults();
    initSmoothScroll();
    initHeaderScroll();

    // Timer init (DISABLED for testing)
    // initTimer();

    // Auth init
    initAuth();
});

// ========================================
// MOBILE MENU
// ========================================
function initMobileMenu() {
    elements.mobileMenuBtn?.addEventListener('click', () => {
        elements.mobileMenu?.classList.toggle('active');
        elements.mobileMenuBtn.classList.toggle('active');
    });

    // Close menu on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            elements.mobileMenu?.classList.remove('active');
            elements.mobileMenuBtn?.classList.remove('active');
        });
    });
}

// ========================================
// HEADER SCROLL EFFECT
// ========================================
function initHeaderScroll() {
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            elements.header?.classList.add('scrolled');
        } else {
            elements.header?.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const headerHeight = elements.header?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// UPLOAD AREA
// ========================================
function initUploadArea() {
    const uploadArea = elements.uploadArea;
    const fileInput = elements.fileInput;

    if (!uploadArea || !fileInput) return;

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        });
    });

    // Handle drop
    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleFiles(fileList) {
    const files = Array.from(fileList);

    // Validate files
    const validFiles = files.filter(file => {
        if (!CONFIG.allowedTypes.includes(file.type)) {
            showNotification(`${t('notify_unsupported')}: ${file.name}`, 'error');
            return false;
        }
        if (file.size > CONFIG.maxFileSize) {
            showNotification(`${t('notify_too_large')}: ${file.name}`, 'error');
            return false;
        }
        return true;
    });

    // Check max files limit
    const totalFiles = state.files.length + validFiles.length;
    if (totalFiles > CONFIG.maxFiles) {
        showNotification(`${t('notify_max_files')} (${CONFIG.maxFiles})`, 'warning');
        validFiles.splice(CONFIG.maxFiles - state.files.length);
    }

    // Add files to state
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.files.push({
                file: file,
                preview: e.target.result,
                id: generateId()
            });
            renderPreviews();
            updateAnalyzeButton();
        };
        reader.readAsDataURL(file);
    });
}

function renderPreviews() {
    const container = elements.uploadPreview;
    if (!container) return;

    container.innerHTML = state.files.map(item => `
        <div class="preview-item" data-id="${item.id}">
            <img src="${item.preview}" alt="Preview">
            <button class="preview-remove" onclick="removeFile('${item.id}')">&times;</button>
        </div>
    `).join('');

    // Update upload area state
    if (state.files.length > 0) {
        elements.uploadArea?.classList.add('has-files');
    } else {
        elements.uploadArea?.classList.remove('has-files');
    }
}

function removeFile(id) {
    state.files = state.files.filter(item => item.id !== id);
    renderPreviews();
    updateAnalyzeButton();
}

function updateAnalyzeButton() {
    if (elements.analyzeBtn) {
        elements.analyzeBtn.disabled = state.files.length === 0 || state.isLoading;
    }
}

// ========================================
// BUTTONS
// ========================================
function initButtons() {
    // Analyze button
    elements.analyzeBtn?.addEventListener('click', handleAnalyze);

    // Export button
    elements.exportBtn?.addEventListener('click', handleExport);

    // Clear button
    elements.clearBtn?.addEventListener('click', handleClear);
}

// ========================================
// ANALYZE HANDLER
// ========================================
async function handleAnalyze() {
    if (state.files.length === 0 || state.isLoading) return;

    state.isLoading = true;
    elements.analyzeBtn?.classList.add('loading');
    elements.analyzeBtn?.setAttribute('aria-busy', 'true');
    const btnText = elements.analyzeBtn?.querySelector('.btn-text');
    if (btnText) btnText.textContent = t('btn_analyzing');
    updateAnalyzeButton();

    try {
        const userLangSelect = document.getElementById('userLangSelect');
        const marketLangSelect = document.getElementById('marketplaceLangSelect');
        const additionalTextInput = document.getElementById('additionalText');

        // Create FormData (Multipart)
        const formData = new FormData();

        // Append text fields
        formData.append("email", CONFIG.userEmail);
        formData.append("user_language", userLangSelect ? userLangSelect.value : 'Russian');
        formData.append("marketplace_language", marketLangSelect ? marketLangSelect.value : 'German');
        formData.append("source_url", CONFIG.pageAndSection);
        formData.append("additional_text", additionalTextInput ? additionalTextInput.value : '');

        // Append files
        state.files.forEach(item => {
            // item.file is the actual File object from input info
            formData.append("image", item.file);
        });

        console.log('Sending to webhook:', CONFIG.webhookUrl);

        // Send to webhook (Multipart)
        const response = await fetch(CONFIG.webhookUrl, {
            method: 'POST',
            body: formData
            // Do NOT set Content-Type header, browser sets it with boundary automatically
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        // Process results - adapt to your webhook response format
        if (data) {
            // If response is array, process each item
            const items = Array.isArray(data) ? data : [data];

            items.forEach((item, index) => {
                // Parse market price (format: "25 EUR" or similar)
                const marketPriceStr = item.market_price || '0 EUR';
                const marketPriceNum = parseFloat(marketPriceStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

                // Parse suggested price (format: "15 EUR" or similar)
                const suggestedPriceStr = item.suggested_price || '0 EUR';
                const suggestedPriceNum = parseFloat(suggestedPriceStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

                // Map webhook response to our format
                const result = {
                    id: generateId(),
                    title: item.german_title || item.item || item.title || `Товар ${index + 1}`,
                    description: item.german_text || item.description || item.text || '',
                    category: item.category || 'Sonstiges',
                    marketPrice: {
                        min: Math.round(marketPriceNum * 0.8), // Assume market range ±20%
                        max: Math.round(marketPriceNum * 1.2),
                        currency: 'EUR'
                    },
                    recommendedPrice: suggestedPriceNum || 0,
                    image: state.files[index]?.preview || '',
                    createdAt: new Date().toISOString(),
                    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes from now
                };
                state.results.unshift(result);
            });

            saveResults();
            renderResults();
            showNotification(t('notify_success'), 'success');

            // Clear uploaded files
            state.files = [];
            renderPreviews();

            // Scroll to results
            scrollToResults();
        }

    } catch (error) {
        console.error('Analysis error:', error);

        // Show error but also fallback to demo mode
        showNotification(`${t('notify_error')}: ${error.message}.`, 'warning');
        generateMockResults();

    } finally {
        state.isLoading = false;
        elements.analyzeBtn?.classList.remove('loading');
        elements.analyzeBtn?.removeAttribute('aria-busy');
        const btnText = elements.analyzeBtn?.querySelector('.btn-text');
        if (btnText) btnText.textContent = t('btn_analyze');
        updateAnalyzeButton();
    }
}

// ========================================
// MOCK DATA (Demo Mode)
// ========================================
function generateMockResults() {
    const mockItems = [
        {
            title: 'Vintage Omega Uhr',
            description: 'Mechanische Omega Seamaster Uhr aus den 1960er Jahren in ausgezeichnetem Zustand. Originales Lederarmband, funktioniert einwandfrei. Perfekt für Sammler.',
            category: 'Uhren & Schmuck',
            marketPrice: { min: 150, max: 200, currency: 'EUR' },
            recommendedPrice: 179,
            confidence: 0.92
        },
        {
            title: 'iPhone 13 Pro 256GB',
            description: 'Apple iPhone 13 Pro in Graphit mit 256GB Speicher. Sehr guter Zustand, Akku bei 89%. Mit Originalverpackung und Ladekabel. Keine Kratzer auf dem Display.',
            category: 'Handys & Smartphones',
            marketPrice: { min: 550, max: 650, currency: 'EUR' },
            recommendedPrice: 599,
            confidence: 0.95
        },
        {
            title: 'IKEA KALLAX Regal',
            description: 'IKEA KALLAX Regal in Weiß, 4x4 Fächer. Sehr guter Zustand, keine Beschädigungen. Maße: 147x147 cm. Selbstabholung in Wien.',
            category: 'Möbel',
            marketPrice: { min: 40, max: 60, currency: 'EUR' },
            recommendedPrice: 45,
            confidence: 0.88
        }
    ];

    // Add mock results for each uploaded file
    state.files.forEach((file, index) => {
        const mock = mockItems[index % mockItems.length];
        state.results.unshift({
            ...mock,
            id: generateId(),
            image: file.preview,
            createdAt: new Date().toISOString()
        });
    });

    saveResults();
    renderResults();

    // Clear uploaded files
    state.files = [];
    renderPreviews();

    scrollToResults();
}

// ========================================
// RESULTS RENDERING
// ========================================
function renderResults() {
    const grid = elements.resultsGrid;
    const section = elements.resultsSection;
    const empty = elements.resultsEmpty;
    const latestContainer = elements.latestResultContainer;
    const latestContent = elements.latestResultContent;

    if (!grid) return;

    if (state.results.length === 0) {
        section?.classList.remove('active');
        if (latestContainer) latestContainer.hidden = true;
        if (empty) empty.hidden = false; // Show empty state for history
        // But if history section is hidden, empty state might be too.
        // Logic: if no results, hide everything.
        return;
    }

    // SPLIT VIEW RENDERING

    // 1. Render Latest Result (The first item)
    if (state.results.length > 0) {
        if (latestContainer) latestContainer.hidden = false;
        const latestItem = state.results[0];

        if (latestContent) {
            latestContent.innerHTML = renderResultCard(latestItem, true);
        }
    }

    // 2. Render History (The rest of items)
    const historyItems = state.results.slice(1);

    if (historyItems.length > 0) {
        section?.classList.add('active');
        if (empty) empty.hidden = true;
        grid.innerHTML = historyItems.map(item => renderResultCard(item, false)).join('');
    } else {
        // If only 1 result, history is effectively empty or hidden
        if (empty) {
            empty.hidden = false;
            empty.innerHTML = `<p>${t('results_empty_desc_history') || 'Previous results will appear here'}</p>`;
        }
        grid.innerHTML = '';
        section?.classList.add('active'); // Keep section active to show "History" title
    }
}

// Helper: Render a single result card HTML
function renderResultCard(item, isLatest = false) {
    const cardClass = isLatest ? 'result-card latest' : 'result-card';

    // Escape user-provided content to prevent XSS
    const safeTitle = escapeHtml(item.title || '');
    const safeCategory = escapeHtml(item.category || 'Sonstiges');
    const safeDescription = escapeHtml(item.description || '');

    // Check if description needs truncation (> 180 chars ≈ 3 lines)
    const needsTruncation = (item.description || '').length > 180;
    const descriptionId = `desc-${item.id}`;

    return `
        <div class="${cardClass}" data-id="${item.id}">
            <div class="result-image">
                ${item.image ? `<img src="${item.image}" alt="${safeTitle}">` : ''}
            </div>
            <div class="result-content">
                <span class="result-category">${safeCategory}</span>
                <h3 class="result-title">${safeTitle}</h3>

                <!-- Description with expand/collapse -->
                <p class="result-description collapsed"
                   id="${descriptionId}"
                   data-full-text="${safeDescription}">
                    ${safeDescription}
                </p>

                ${needsTruncation ? `
                    <button class="result-description-toggle"
                            onclick="toggleDescription('${item.id}')"
                            aria-expanded="false"
                            aria-controls="${descriptionId}">
                        <span>${t('show_more')}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                ` : ''}

                <div class="result-prices">
                    <div class="result-price">
                        <span class="result-price-label">${t('market_price')}</span>
                        <span class="result-price-value">€${item.marketPrice.min} — ${item.marketPrice.max}</span>
                    </div>
                    <div class="result-price recommended">
                        <span class="result-price-label">${t('recommended')}</span>
                        <span class="result-price-value">€${item.recommendedPrice}</span>
                    </div>
                </div>
            </div>
            <div class="result-actions">
                <button class="btn btn-primary" onclick="copyDescription('${item.id}')">
                    ${t('btn_copy')}
                </button>
                <button class="btn btn-secondary" onclick="publishToWillhaben()">
                    ${t('btn_publish')}
                </button>
            </div>
            <div class="result-footer">
                <!-- Timer disabled for testing -->
                <!-- <div class="result-timer" data-expires="${item.expiresAt || ''}">
                    <span class="timer-icon">⏳</span>
                    <span class="timer-text">--:--</span>
                </div> -->
                <div class="terms-disclaimer">
                    ${t('terms_manual')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Toggle description expand/collapse
 * @param {string} id - Result item ID
 */
function toggleDescription(id) {
    const descEl = document.querySelector(`#desc-${id}`);
    const btnEl = document.querySelector(`button[aria-controls="desc-${id}"]`);
    const textEl = btnEl?.querySelector('span');

    if (!descEl || !btnEl) return;

    const isExpanded = descEl.classList.contains('expanded');

    if (isExpanded) {
        // Collapse
        descEl.classList.remove('expanded');
        descEl.classList.add('collapsed');
        btnEl.setAttribute('aria-expanded', 'false');
        if (textEl) textEl.textContent = t('show_more');
    } else {
        // Expand
        descEl.classList.remove('collapsed');
        descEl.classList.add('expanded');
        btnEl.setAttribute('aria-expanded', 'true');
        if (textEl) textEl.textContent = t('show_less');
    }
}

// Make function globally available
window.toggleDescription = toggleDescription;

/**
 * Open willhaben.at in new tab for publishing
 */
function publishToWillhaben() {
    const publishUrl = 'https://www.willhaben.at/iad/anzeigenaufgabe/marktplatz?adTypeId=67&productId=67';
    window.open(publishUrl, '_blank');
}

// Make function globally available
window.publishToWillhaben = publishToWillhaben;

function scrollToResults() {
    setTimeout(() => {
        elements.resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, CONFIG.animationDuration);
}

// ========================================
// ACTIONS
// ========================================
function publishToWillhaben(id) {
    const item = state.results.find(r => r.id === id);
    if (!item) return;

    // TODO: Implement actual willhaben API integration
    showNotification('Willhaben Integration coming soon!', 'info');

    // For now, open willhaben in new tab
    window.open('https://www.willhaben.at/iad/myprofile/posterad', '_blank');
}

function copyDescription(id) {
    const item = state.results.find(r => r.id === id);
    if (!item) return;

    const text = `${item.title}\n\n${item.description}\n\nPreis: €${item.recommendedPrice}`;

    navigator.clipboard.writeText(text).then(() => {
        showNotification(t('notify_copied'), 'success');
    }).catch(() => {
        showNotification(t('notify_error'), 'error');
    });
}

function handleExport() {
    if (state.results.length === 0) {
        showNotification(t('notify_no_results'), 'warning');
        return;
    }

    const csv = generateCSV();
    downloadFile(csv, 'willnicht_export.csv', 'text/csv');
    showNotification(t('notify_exported'), 'success');
}

function handleClear() {
    if (state.results.length === 0) return;

    if (confirm(t('confirm_clear'))) {
        state.results = [];
        saveResults();
        renderResults();
        elements.resultsSection?.classList.remove('active');
        showNotification(t('notify_cleared'), 'info');
    }
}

// ========================================
// CSV EXPORT
// ========================================
function generateCSV() {
    const headers = ['Titel', 'Beschreibung', 'Kategorie', 'Marktpreis Min', 'Marktpreis Max', 'Empfohlener Preis', 'Datum'];

    const rows = state.results.map(item => [
        `"${item.title}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        `"${item.category || ''}"`,
        item.marketPrice.min,
        item.marketPrice.max,
        item.recommendedPrice,
        new Date(item.createdAt).toLocaleDateString('de-AT')
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ========================================
// LOCAL STORAGE
// ========================================
function saveResults() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.results));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadSavedResults() {
    try {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            state.results = JSON.parse(saved);
            renderResults();
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

// ========================================
// NOTIFICATIONS
// ========================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add styles if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 24px;
                right: 24px;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                background: #1a1a1a;
                color: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            }
            .notification-success { background: #34C759; }
            .notification-error { background: #FF3B30; }
            .notification-warning { background: #FF9500; }
            .notification-info { background: #007AFF; }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.7;
            }
            .notification-close:hover { opacity: 1; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ========================================
// UTILITIES
// ========================================
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}


// ========================================
// AUTHENTICATION
// ========================================
function initAuth() {
    // Check if we are on the app page (has login section)
    if (!elements.loginSection) return;

    const savedEmail = localStorage.getItem('user_email');

    if (savedEmail) {
        // User is logged in
        showApp(savedEmail);
    } else {
        // User is logged out
        showLogin();
    }

    // Login Form Submit
    elements.loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.value) {
            login(emailInput.value);
        }
    });

    // Logout Button
    elements.logoutBtn?.addEventListener('click', () => {
        logout();
    });
}

function login(email) {
    localStorage.setItem('user_email', email);
    showApp(email);
}

function logout() {
    localStorage.removeItem('user_email');
    showLogin();
    // Clear results on logout
    state.results = [];
    saveResults();
}

function showApp(email) {
    CONFIG.userEmail = email;

    if (elements.loginSection) elements.loginSection.hidden = true;
    if (elements.appWrapper) elements.appWrapper.classList.add('active');
    if (elements.userMenu) elements.userMenu.hidden = false;
    if (elements.userEmailDisplay) elements.userEmailDisplay.textContent = email;

    // Also re-render results to be sure
    renderResults();
}

function showLogin() {
    if (elements.loginSection) elements.loginSection.hidden = false;
    if (elements.appWrapper) elements.appWrapper.classList.remove('active');
    if (elements.userMenu) elements.userMenu.hidden = true;
}

// Make functions globally available
window.removeFile = removeFile;
window.publishToWillhaben = publishToWillhaben;
window.copyDescription = copyDescription;

// ========================================
// TIMER LOGIC
// ========================================
function initTimer() {
    setInterval(() => {
        const timers = document.querySelectorAll('.result-timer');
        const now = Date.now();

        timers.forEach(timer => {
            const expiresAt = parseInt(timer.dataset.expires);
            if (!expiresAt) return;

            const remaining = expiresAt - now;

            if (remaining <= 0) {
                // Expired
                timer.innerHTML = `<span class="timer-text expired">${t('expired_label')}</span>`;
                timer.classList.add('expired');
            } else {
                // Formatting
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                const text = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                const textEl = timer.querySelector('.timer-text');
                if (textEl) textEl.textContent = text;
            }
        });
    }, 1000);
}
