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
    webhookUrl: 'https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3',

    // User settings
    userEmail: null, // Will be set from Supabase auth
    languageChoice: 'German', // Default language for descriptions
    pageAndSection: 'https://www.willnicht.com/app#form1',

    // File upload limits
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],

    // UI settings
    animationDuration: 300,

    // Storage keys (legacy, will be migrated to Supabase)
    storageKey: 'willnicht_results',
    
    // Supabase integration
    useSupabase: true, // Set to false to use localStorage fallback
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
    appWrapper: document.getElementById('appWrapper'),
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
            const href = anchor.getAttribute('href');
            // Skip empty hash links
            if (!href || href === '#') {
                return;
            }
            e.preventDefault();
            const target = document.querySelector(href);
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

    // Clear existing previews
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Add new previews
    state.files.forEach(item => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.dataset.id = item.id;

        const img = document.createElement('img');
        img.src = item.preview;
        img.alt = 'Preview';

        const button = document.createElement('button');
        button.className = 'preview-remove';
        button.textContent = '×';
        button.onclick = () => removeFile(item.id);

        div.appendChild(img);
        div.appendChild(button);
        container.appendChild(div);
    });

    // Update upload area state
    if (state.files.length > 0) {
        elements.uploadArea?.classList.add('has-files');

        // Hide empty state container when files are uploaded
        const emptyStateContainer = document.getElementById('emptyStateContainer');
        if (emptyStateContainer) {
            emptyStateContainer.hidden = true;
        }
    } else {
        elements.uploadArea?.classList.remove('has-files');

        // Show empty state container when no files
        const emptyStateContainer = document.getElementById('emptyStateContainer');
        if (emptyStateContainer) {
            emptyStateContainer.hidden = false;
        }
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
    console.log('=== initButtons called ===');
    console.log('analyzeBtn element:', elements.analyzeBtn);

    // Analyze button
    if (elements.analyzeBtn) {
        console.log('Adding click listener to analyzeBtn');
        elements.analyzeBtn.addEventListener('click', handleAnalyze);
    } else {
        console.error('analyzeBtn not found!');
    }

    // Export button
    elements.exportBtn?.addEventListener('click', handleExport);

    // Clear button
    elements.clearBtn?.addEventListener('click', handleClear);
}

// ========================================
// ANALYZE HANDLER
// ========================================
async function handleAnalyze() {
    console.log('=== handleAnalyze called ===');
    console.log('state.files.length:', state.files.length);
    console.log('state.isLoading:', state.isLoading);

    if (state.files.length === 0 || state.isLoading) {
        console.log('Exiting early: no files or already loading');
        return;
    }

    // Check if user can create evaluation (Supabase only)
    console.log('Checking Supabase evaluation limit...');
    console.log('CONFIG.useSupabase:', CONFIG.useSupabase);
    console.log('isSupabaseConfigured():', isSupabaseConfigured());
    console.log('currentUser:', currentUser);

    if (CONFIG.useSupabase && isSupabaseConfigured() && currentUser) {
        try {
            console.log('Calling canCreateEvaluation()...');
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            const canCreate = await Promise.race([canCreateEvaluation(), timeoutPromise]);
            console.log('canCreate result:', canCreate);
            if (!canCreate) {
                showNotification(t('notify_limit_reached') || 'Достигнут лимит оценок за месяц', 'warning');
                return;
            }
        } catch (error) {
            console.warn('Could not check evaluation limit:', error);
            // Continue anyway - don't block the upload
            console.log('Continuing with upload despite limit check failure...');
        }
    } else {
        console.log('Skipping Supabase check (conditions not met)');
    }

    console.log('Starting analysis process...');
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

        // Capture language preferences
        const userLanguage = userLangSelect ? userLangSelect.value : 'Russian';
        const marketplaceLanguage = marketLangSelect ? marketLangSelect.value : 'German';

        // Create FormData (Multipart)
        const formData = new FormData();

        // Append text fields
        const userEmail = CONFIG.userEmail || currentUser?.email || 'olegzakharchenko@gmail.com';
        formData.append("email", userEmail);
        formData.append("user_language", userLanguage);
        formData.append("marketplace_language", marketplaceLanguage);
        formData.append("source_url", CONFIG.pageAndSection);
        formData.append("additional_text", additionalTextInput ? additionalTextInput.value : '');

        // Append files - CRITICAL FIX: append actual File objects, not wrapped objects
        state.files.forEach((item, index) => {
            console.log(`Appending file ${index}:`, {
                name: item.file.name,
                type: item.file.type,
                size: item.file.size
            });
            formData.append("image", item.file); // item.file is the actual File object
        });

        console.log('Sending to webhook:', CONFIG.webhookUrl);
        console.log('Email:', userEmail);
        console.log('Files count:', state.files.length);

        // Debug FormData contents
        const formDataEntries = Array.from(formData.entries());
        console.log('FormData entries:', formDataEntries.map(e => `${e[0]}: ${e[1]}`));

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

            console.log('Processing items:', items.length);

            items.forEach((item, index) => {
                console.log(`Processing item ${index}:`, item);

                // Parse market price (format: "25 EUR" or similar)
                const marketPriceStr = item.market_price || '0 EUR';
                const marketPriceNum = parseFloat(marketPriceStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

                // Parse suggested price (format: "15 EUR" or similar)
                const suggestedPriceStr = item.suggested_price || '0 EUR';
                const suggestedPriceNum = parseFloat(suggestedPriceStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

                // Map webhook response to our format
                const result = {
                    id: generateId(),
                    title: item.item || item.german_title || item.title || `Товар ${index + 1}`,
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
                    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes from now
                    webhookId: item.ID || null,
                    confidence: item.confidence || null,
                    userLanguage: userLanguage,
                    marketplaceLanguage: marketplaceLanguage
                };

                console.log('Created result:', result);
                state.results.unshift(result);
            });

            console.log('Total results after processing:', state.results.length);
            await saveResults();

            // Reload from Supabase to ensure we have the latest data with proper IDs
            if (CONFIG.useSupabase && isSupabaseConfigured() && currentUser) {
                console.log('Reloading listings from Supabase after save...');
                await loadListingsFromSupabase();
            }

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
    console.log('=== renderResults called ===');
    console.log('state.results.length:', state.results.length);

    const grid = elements.resultsGrid;
    const section = elements.resultsSection;
    const empty = elements.resultsEmpty;
    const latestContainer = elements.latestResultContainer;
    const latestContent = elements.latestResultContent;

    console.log('grid element:', grid);
    console.log('section element:', section);
    console.log('latestContainer element:', latestContainer);
    console.log('latestContent element:', latestContent);

    if (!grid) {
        console.error('resultsGrid element not found!');
        return;
    }

    if (state.results.length === 0) {
        console.log('No results to display');
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
        console.log('Rendering latest result');
        if (latestContainer) latestContainer.hidden = false;
        const latestItem = state.results[0];
        console.log('Latest item:', latestItem);

        if (latestContent) {
            const cardHTML = renderResultCard(latestItem, true);
            console.log('Generated card HTML length:', cardHTML.length);
            latestContent.innerHTML = cardHTML;
        } else {
            console.error('latestContent element not found!');
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
                <button class="btn btn-ghost btn-delete" onclick="deleteResult('${item.id}')" aria-label="Удалить">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
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

/**
 * Delete a single result
 * @param {string} id - Result ID to delete
 */
async function deleteResult(id) {
    if (!confirm(t('confirm_delete') || 'Удалить эту оценку?')) {
        return;
    }

    // Try to delete from Supabase first
    if (CONFIG.useSupabase && isSupabaseConfigured() && currentUser) {
        try {
            await deleteListing(id);
            showNotification(t('notify_deleted') || 'Оценка удалена', 'success');
        } catch (error) {
            console.warn('Could not delete from Supabase:', error);
            // Continue with local deletion
        }
    }

    // Remove from local state
    state.results = state.results.filter(r => r.id !== id);

    // Save updated state
    saveResults();
    renderResults();

    showNotification(t('notify_deleted') || 'Оценка удалена', 'success');
}

// Make function globally available
window.deleteResult = deleteResult;

function handleExport() {
    if (state.results.length === 0) {
        showNotification(t('notify_no_results'), 'warning');
        return;
    }

    const csv = generateCSV();
    downloadFile(csv, 'willnicht_export.csv', 'text/csv');
    showNotification(t('notify_exported'), 'success');
}

async function handleClear() {
    if (state.results.length === 0) return;

    if (confirm(t('confirm_clear'))) {
        // Try to delete from Supabase if configured
        if (CONFIG.useSupabase && isSupabaseConfigured() && currentUser) {
            try {
                const supabase = getSupabase();
                if (supabase) {
                    // Delete all user's listings
                    const { error } = await supabase
                        .from('listings')
                        .delete()
                        .gte('created_at', '1970-01-01'); // Delete all (will be filtered by RLS)
                    
                    if (error) {
                        console.warn('Could not delete from Supabase:', error);
                    }
                }
            } catch (error) {
                console.warn('Could not delete from Supabase:', error);
            }
        }

        // Clear local state
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
// DATA STORAGE (Supabase + localStorage fallback)
// ========================================

/**
 * Save results to storage (Supabase or localStorage)
 */
async function saveResults() {
    console.log('=== saveResults called ===');
    console.log('state.results.length:', state.results.length);
    console.log('CONFIG.useSupabase:', CONFIG.useSupabase);
    console.log('isSupabaseConfigured():', isSupabaseConfigured());
    console.log('currentUser:', currentUser);

    // ALWAYS save to localStorage first as backup
    console.log('Saving to localStorage as backup...');
    saveResultsToLocalStorage();

    // Try to save the latest result to Supabase if available
    if (state.results.length > 0 && CONFIG.useSupabase && isSupabaseConfigured() && currentUser) {
        console.log('Attempting to save to Supabase...');
        try {
            // Only save the newest result to Supabase
            const latestResult = state.results[0];
            console.log('Saving latest result to Supabase:', latestResult.title);
            await saveListingToSupabase(latestResult);
            console.log('Successfully saved to Supabase');
            // Update evaluations count after saving
            await updateEvaluationsCount();
            console.log('Updated evaluations count');
        } catch (error) {
            console.error('Could not save to Supabase:', error);
            console.log('Results are saved in localStorage, continuing...');
            // Already saved to localStorage above, no need to do it again
        }
    } else {
        console.log('Using localStorage (conditions not met for Supabase)');
    }
    console.log('=== saveResults completed ===');
}

/**
 * Resize image for Supabase storage to reduce base64 size
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<string>} Resized base64 image
 */
async function resizeImageForSupabase(base64Image) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Create canvas with max dimensions 800x800
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate new dimensions maintaining aspect ratio
            const maxDimension = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDimension) {
                    height = (height * maxDimension) / width;
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = (width * maxDimension) / height;
                    height = maxDimension;
                }
            }

            canvas.width = Math.round(width);
            canvas.height = Math.round(height);

            // Draw resized image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to base64 with reduced quality (0.7)
            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(resizedBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image for resizing'));
        img.src = base64Image;
    });
}

/**
 * Save a single listing to Supabase
 */
async function saveListingToSupabase(result) {
    console.log('=== saveListingToSupabase called ===');
    console.log('Result to save:', result.title);

    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    // Check if user can create evaluation
    console.log('Checking if user can create evaluation...');
    // SKIP THIS CHECK FOR NOW - it's causing timeouts
    // TODO: Fix Supabase RPC functions properly
    /*
    try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout checking evaluation limit')), 3000)
        );
        const canCreate = await Promise.race([canCreateEvaluation(), timeoutPromise]);
        console.log('canCreateEvaluation result:', canCreate);

        if (!canCreate) {
            showNotification(t('notify_limit_reached') || 'Достигнут лимит оценок за месяц', 'warning');
            throw new Error('Evaluation limit reached');
        }
    } catch (error) {
        console.warn('Could not check evaluation limit in saveListingToSupabase:', error);
        // Continue with save anyway - don't block
        console.log('Continuing with save despite limit check failure...');
    }
    */

    // Resize image before saving to Supabase to avoid timeout
    console.log('Processing image for Supabase...');
    const processedImage = await resizeImageForSupabase(result.image);
    console.log('Original image size:', result.image.length, 'bytes');
    console.log('Processed image size:', processedImage.length, 'bytes');

    const listingData = {
        title: result.title,
        description: result.description,
        category: result.category,
        market_price_min: result.marketPrice.min,
        market_price_max: result.marketPrice.max,
        recommended_price: result.recommendedPrice,
        currency: result.marketPrice.currency,
        image_data: processedImage, // Use resized image
        webhook_id: result.webhookId || null,
        confidence: result.confidence || null,
        user_language: result.userLanguage || null,
        marketplace_language: result.marketplaceLanguage || null,
        user_id: currentUser.id // CRITICAL: Link to current user
    };

    console.log('Inserting listing data into Supabase...');

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout saving to Supabase')), 10000) // 10 second timeout
    );

    const insertPromise = supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();

    const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

    if (error) {
        console.error('Supabase insert error:', error);
        throw error;
    }

    console.log('Supabase insert successful, data:', data);

    // Update the result with the Supabase ID
    result.id = data.id;
    console.log('Listing saved to Supabase with ID:', data.id);

    return data;
}

/**
 * Load listings from Supabase for the current user
 */
async function loadListingsFromSupabase() {
    console.log('=== loadListingsFromSupabase called ===');
    const supabase = getSupabase();
    if (!supabase || !currentUser) {
        console.log('Skipping loadListingsFromSupabase: supabase=', !!supabase, 'currentUser=', !!currentUser);
        return;
    }

    try {
        console.log('Fetching listings from Supabase...');

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout fetching listings')), 10000) // 10 second timeout
        );
        const listings = await Promise.race([fetchListings(), timeoutPromise]);

        console.log(`Fetched ${listings.length} listings from Supabase`);

        // Convert Supabase listings to app format
        state.results = listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            marketPrice: {
                min: listing.market_price_min,
                max: listing.market_price_max,
                currency: listing.currency
            },
            recommendedPrice: listing.recommended_price,
            image: listing.image_data,
            createdAt: listing.created_at,
            updatedAt: listing.updated_at,
            webhookId: listing.webhook_id,
            confidence: listing.confidence,
            userLanguage: listing.user_language,
            marketplaceLanguage: listing.marketplace_language
        }));

        console.log(`Loaded ${state.results.length} listings from Supabase`);
        console.log('state.results after loading from Supabase:', state.results.length);
        renderResults();
    } catch (error) {
        console.error('Error loading listings from Supabase:', error);
        // Fallback to localStorage
        console.log('Falling back to localStorage...');
        loadSavedResultsFromLocalStorage();
    }
}

/**
 * Save results to localStorage (fallback)
 */
function saveResultsToLocalStorage() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.results));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

/**
 * Load saved results from localStorage (fallback)
 */
function loadSavedResultsFromLocalStorage() {
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

/**
 * Load saved results (wrapper function)
 */
async function loadSavedResults() {
    // Try Supabase first, then fallback to localStorage
    if (CONFIG.useSupabase && isSupabaseConfigured() && currentUser) {
        await loadListingsFromSupabase();
    } else {
        loadSavedResultsFromLocalStorage();
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
// AUTHENTICATION (Supabase-based)
// ========================================
let currentUser = null;
let authInitialized = false;

async function initAuth() {
    // Initialize Supabase client
    const supabase = getSupabase();

    if (!supabase || !isSupabaseConfigured()) {
        console.warn('Supabase not configured, falling back to localStorage auth');
        initLocalStorageAuth();
        return;
    }

    // Listen to auth state changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session);

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            currentUser = session?.user || null;
            if (currentUser) {
                console.log('User signed in:', currentUser.email);
                CONFIG.userEmail = currentUser.email;
                await showApp(currentUser.email);

                // Load from localStorage FIRST for immediate display
                console.log('Loading from localStorage...');
                loadSavedResultsFromLocalStorage();

                // Then try to load from Supabase
                console.log('Loading user listings from Supabase...');
                await loadListingsFromSupabase();
                console.log('Finished loading user listings');
            }
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            CONFIG.userEmail = null;
            // Redirect to index.html on logout
            window.location.href = 'index.html';
        }
    });

    // Check current session
    const session = await getSession();
    if (session?.user) {
        console.log('Found existing session:', session.user.email);
        currentUser = session.user;
        CONFIG.userEmail = currentUser.email;
        await showApp(currentUser.email);

        // Load from localStorage FIRST for immediate display
        console.log('Loading from localStorage...');
        loadSavedResultsFromLocalStorage();

        console.log('Loading existing user listings from Supabase...');
        await loadListingsFromSupabase();
        console.log('Finished loading existing user listings');
    } else {
        // Don't redirect immediately - wait for auth state change listener
        // The INITIAL_SESSION event will fire if session is being restored
        console.log('No session found, waiting for auth state change...');
    }

    authInitialized = true;

    // Set a timeout to redirect if still no session after 2 seconds
    // This gives Supabase time to restore the session from localStorage
    setTimeout(async () => {
        const finalSession = await getSession();
        if (!finalSession?.user) {
            console.log('No session restored after timeout, redirecting to login');
            window.location.href = 'index.html';
        }
    }, 2000);

    // Logout Button
    elements.logoutBtn?.addEventListener('click', async () => {
        await handleLogout();
    });
}

/**
 * Handle login with email and password
 */
async function handleLogin(email, password) {
    try {
        showNotification(t('notify_logging_in') || 'Вход...', 'info');
        
        const data = await signIn(email, password);
        
        if (data.user) {
            showNotification(t('notify_login_success') || 'Вход выполнен успешно', 'success');
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
}

/**
 * Handle registration with email and password
 */
async function handleRegister(email, password, passwordConfirm) {
    try {
        // Validate passwords match
        if (password !== passwordConfirm) {
            showNotification(t('notify_passwords_dont_match') || 'Пароли не совпадают', 'error');
            return;
        }

        showNotification(t('notify_registering') || 'Регистрация...', 'info');
        
        const data = await signUp(email, password);
        
        if (data.user) {
            showNotification(t('notify_register_success') || 'Регистрация успешна! Проверьте email для подтверждения', 'success');
            // Switch to login form
            showLogin();
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
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await signOut();
        showNotification(t('notify_logout_success') || 'Вы вышли из системы', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification(`${t('notify_logout_error') || 'Ошибка выхода'}: ${error.message}`, 'error');
    }
}

/**
 * Show the app interface
 */
async function showApp(email) {
    CONFIG.userEmail = email;

    if (elements.loginSection) elements.loginSection.hidden = true;
    if (elements.registerSection) elements.registerSection.hidden = true;
    if (elements.appWrapper) elements.appWrapper.classList.add('active');
    if (elements.userMenu) elements.userMenu.hidden = false;
    if (elements.userEmailDisplay) elements.userEmailDisplay.textContent = email;

    // Update evaluations count
    await updateEvaluationsCount();

    // Also re-render results to be sure
    renderResults();
}

/**
 * Update the evaluations count indicator
 */
async function updateEvaluationsCount() {
    const evaluationsUsedEl = document.getElementById('evaluationsUsed');
    const evaluationsLimitEl = document.getElementById('evaluationsLimit');
    const evaluationsCountEl = document.getElementById('evaluationsCount');

    if (!evaluationsUsedEl || !evaluationsLimitEl || !evaluationsCountEl) return;

    // Default values for localStorage mode
    let used = 0;
    let limit = 3;

    // Try to get actual values from Supabase
    if (CONFIG.useSupabase && isSupabaseConfigured() && currentUser) {
        try {
            used = await getUserEvaluationCount();

            // Get user's limit from profile
            const profile = await fetchProfile();
            if (profile) {
                limit = profile.evaluations_limit || 3;
            }
        } catch (error) {
            console.warn('Could not fetch evaluation count:', error);
            // Use localStorage count as fallback
            used = state.results.length;
        }
    } else {
        // Use localStorage count
        used = state.results.length;
    }

    // Update UI
    evaluationsUsedEl.textContent = used;
    evaluationsLimitEl.textContent = limit;

    // Update styling based on usage
    evaluationsCountEl.classList.remove('near-limit', 'at-limit');
    if (used >= limit) {
        evaluationsCountEl.classList.add('at-limit');
    } else if (used >= limit * 0.8) {
        evaluationsCountEl.classList.add('near-limit');
    }
}

/**
 * Show the login form
 */
function showLogin() {
    if (elements.loginSection) elements.loginSection.hidden = false;
    if (elements.registerSection) elements.registerSection.hidden = true;
    if (elements.appWrapper) elements.appWrapper.classList.remove('active');
    if (elements.userMenu) elements.userMenu.hidden = true;
}

/**
 * Show the register form
 */
function showRegister() {
    // Not used in app.html anymore (registration happens in modal on index.html)
    console.log('showRegister() called - deprecated for app.html');
}

// ========================================
// FALLBACK: LocalStorage Auth (when Supabase not configured)
// ========================================
function initLocalStorageAuth() {
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
            loginLocalStorage(emailInput.value);
        }
    });

    // Logout Button
    elements.logoutBtn?.addEventListener('click', () => {
        logoutLocalStorage();
    });
}

function loginLocalStorage(email) {
    localStorage.setItem('user_email', email);
    showApp(email);
}

function logoutLocalStorage() {
    localStorage.removeItem('user_email');
    showLogin();
    // Clear results on logout
    state.results = [];
    saveResults();
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
