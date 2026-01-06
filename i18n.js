/**
 * Willnicht - Internationalization (i18n)
 * Supported languages: Russian (ru), English (en), German (de)
 */

const TRANSLATIONS = {
    ru: {
        // Header
        nav_features: 'Возможности',
        nav_how_it_works: 'Как это работает',
        nav_pricing: 'Тарифы',
        btn_start_free: 'Начать бесплатно',

        // Hero
        hero_badge: 'Powered by AI',
        hero_title_1: 'Продавайте на willhaben',
        hero_title_2: 'без языкового барьера',
        hero_subtitle: 'Загрузите фото — получите описание на немецком, рыночную цену для Австрии и готовое объявление для willhaben.at. Идеально для экспатов.',
        hero_btn_upload: 'Загрузить фото',
        hero_btn_learn: 'Узнать больше',
        stat_evaluated_val: '10K+',
        stat_evaluated: 'товаров оценено',
        stat_accuracy_val: '98%',
        stat_accuracy: 'точность цены',
        stat_time_val: '5 сек',
        stat_time: 'время оценки',
        badge_ai: '🤖 AI анализ',
        badge_fast: '⚡ 5 сек',
        card_market_price: 'Рыночная цена',
        card_recommended: 'Рекомендуемая',

        // Features
        features_badge: 'Возможности',
        features_title: 'Всё, что нужно для успешных продаж',
        features_subtitle: 'Автоматизируйте рутину и сфокусируйтесь на главном',
        feature_1_title: 'Умное распознавание',
        feature_1_desc: 'AI анализирует фото и определяет категорию, бренд, состояние и особенности товара',
        feature_2_title: 'Точная оценка',
        feature_2_desc: 'Алгоритм анализирует тысячи объявлений и даёт рыночную цену с точностью до 98%',
        feature_3_title: 'Готовые описания',
        feature_3_desc: 'Получите продающий текст для листинга с SEO-оптимизацией и тегами',
        feature_4_title: 'Мгновенный результат',
        feature_4_desc: 'Оценка готова за 5 секунд. Загружайте до 10 фото одновременно',
        feature_5_title: 'История оценок',
        feature_5_desc: 'Все ваши товары сохраняются. Экспортируйте в CSV для учёта',
        feature_6_title: 'Безопасность',
        feature_6_desc: 'Ваши данные защищены. Фото не передаются третьим лицам',

        // How it works
        how_badge: 'Как это работает',
        how_title: 'Три простых шага',
        how_subtitle: 'От фото до готового листинга за минуту',
        step_1_title: 'Загрузите фото',
        step_1_desc: 'Перетащите изображения товара или выберите из галереи. Поддерживаем JPG, PNG, WebP.',
        step_2_title: 'AI анализирует',
        step_2_desc: 'Нейросеть распознаёт товар, ищет аналоги и рассчитывает оптимальную цену.',
        step_3_title: 'Получите результат',
        step_3_desc: 'Описание, рыночная цена и рекомендация готовы. Копируйте и публикуйте!',

        // Upload
        upload_badge: 'Попробуйте сейчас',
        upload_title: 'Загрузите фото товара',
        upload_subtitle: '3 бесплатных оценки каждый месяц',
        upload_drag: 'Перетащите фото сюда',
        upload_click: 'или нажмите для выбора',
        upload_hint: 'JPG, PNG, WebP до 10MB • Максимум 10 фото',
        btn_analyze: 'Получить оценку',
        btn_analyzing: 'Анализирую...',

        // Results
        results_title: 'Результаты оценки',
        btn_export: 'Экспорт',
        btn_clear: 'Очистить',
        results_empty_title: 'Пока нет оценок',
        results_empty_desc: 'Загрузите фото товара выше, чтобы получить оценку',
        market_price: 'Marktpreis',
        recommended: 'Empfohlen',
        btn_publish: 'Auf willhaben veröffentlichen',
        btn_copy: 'Kopieren',

        // Pricing
        pricing_badge: 'Тарифы',
        pricing_title: 'Выберите свой план',
        pricing_subtitle: 'Начните бесплатно, масштабируйтесь по мере роста',
        plan_free: 'Free',
        plan_pro_monthly: 'Pro Monthly',
        plan_pro_yearly: 'Pro Yearly',
        plan_starter: 'Starter',
        plan_free_desc: 'Для тестирования',
        plan_starter_desc: 'Для начинающих',
        plan_pro_desc: 'Для активных продавцов',
        plan_yearly_desc: '~€56/мес • Лучшая цена',
        month: '/месяц',
        year: '/год',
        badge_monthly: 'Месяц',
        badge_discount: '-43% Скидка',

        // Pricing features
        pf_evaluations_3: '3 оценки в месяц',
        pf_evaluations_30: '30 оценок в месяц',
        pf_german_desc: 'Описание на немецком',
        pf_price_range: 'Диапазон цен',
        pf_no_listing: 'Готовое объявление',
        pf_no_history: 'История и экспорт',
        pf_unlimited: 'Безлимитные оценки',
        pf_seo_german: 'SEO-описания на немецком',
        pf_willhaben_listing: 'Готовое объявление для willhaben',
        pf_bulk: 'Bulk-загрузка (50 фото)',
        pf_history_csv: 'История + экспорт CSV',
        pf_all_pro: 'Всё из Pro Monthly',
        pf_2_months_free: '2 месяца бесплатно',
        pf_priority_support: 'Приоритетная поддержка',
        pf_early_access: 'Ранний доступ к фичам',
        pf_future_integrations: 'Будущие интеграции (eBay)',
        btn_choose_starter: 'Выбрать Starter',
        btn_choose_pro: 'Выбрать Pro',
        btn_choose_yearly: 'Выбрать Yearly',

        // Footer
        footer_tagline: 'AI-оценка товаров для маркетплейсов',
        footer_product: 'Продукт',
        footer_company: 'Компания',
        footer_support: 'Поддержка',
        footer_about: 'О нас',
        footer_blog: 'Блог',
        footer_contact: 'Контакты',
        footer_faq: 'FAQ',
        footer_api: 'API документация',
        footer_status: 'Статус системы',
        footer_privacy: 'Политика конфиденциальности',
        footer_terms: 'Условия использования',
        footer_rights: '© 2026 Willnicht. Все права защищены.',

        // Notifications
        notify_success: 'Оценка завершена!',
        notify_demo: 'Demo режим: показаны примеры результатов',
        notify_error: 'Ошибка',
        notify_copied: 'Beschreibung kopiert!',
        notify_exported: 'CSV exportiert!',
        notify_cleared: 'Ergebnisse gelöscht',
        notify_unsupported: 'Неподдерживаемый формат',
        notify_too_large: 'Файл слишком большой',
        notify_max_files: 'Максимум файлов',
        confirm_clear: 'Удалить все результаты?',
        notify_no_results: 'Нет результатов для экспорта',
        btn_auto_post: 'Авто-публикация',
        tooltip_pro_only: 'Доступно только в Pro',
        terms_manual: 'Вы соглашаетесь с условиями сервиса и обязуетесь самостоятельно копировать и переносить данные. Автоматизация в статусе Beta (Enterprise).',

        // App Internal
        settings_title: 'Настройки',
        label_your_lang: 'Ваш язык',
        label_marketplace_lang: 'Язык площадки',
        latest_result_title: 'Результат',
        history_title: 'История оценок',
        results_empty_desc_history: 'Здесь будут отображаться ваши предыдущие оценки',
        expired_label: 'Истек',
        label_additional_text: 'Дополнительная информация',
        placeholder_additional_text: 'Например: "Это винтажная вещь, учти дефекты..."',
        show_more: 'Показать еще',
        show_less: 'Свернуть',

        // Authentication
        login_title: 'Вход',
        login_subtitle: 'Введите email и пароль для доступа к сервису',
        register_title: 'Регистрация',
        register_subtitle: 'Создайте аккаунт для доступа к сервису',
        btn_enter: 'Войти',
        btn_register: 'Зарегистрироваться',
        login_no_account: 'Нет аккаунта?',
        login_has_account: 'Уже есть аккаунт?',
        notify_logging_in: 'Вход...',
        notify_login_success: 'Вход выполнен успешно',
        notify_login_error: 'Ошибка входа',
        notify_invalid_credentials: 'Неверный email или пароль',
        notify_email_not_confirmed: 'Email не подтвержден',
        notify_registering: 'Регистрация...',
        notify_register_success: 'Регистрация успешна! Проверьте email для подтверждения',
        notify_register_error: 'Ошибка регистрации',
        notify_user_exists: 'Пользователь с таким email уже существует',
        notify_passwords_dont_match: 'Пароли не совпадают',
        notify_logout_success: 'Вы вышли из системы',
        notify_logout_error: 'Ошибка выхода',
        notify_limit_reached: 'Достигнут лимит оценок за месяц',
        notify_deleted: 'Оценка удалена',
        notify_fill_all_fields: 'Заполните все поля',
        notify_password_too_short: 'Пароль должен быть минимум 6 символов',
    },

    en: {
        // Header
        nav_features: 'Features',
        nav_how_it_works: 'How it works',
        nav_pricing: 'Pricing',
        btn_start_free: 'Start for free',

        // Hero
        hero_badge: 'Powered by AI',
        hero_title_1: 'Sell on willhaben',
        hero_title_2: 'without language barrier',
        hero_subtitle: 'Upload a photo — get a German description, Austrian market price, and a ready listing for willhaben.at. Perfect for expats.',
        hero_btn_upload: 'Upload photo',
        hero_btn_learn: 'Learn more',
        stat_evaluated_val: '10K+',
        stat_evaluated: 'items evaluated',
        stat_accuracy_val: '98%',
        stat_accuracy: 'price accuracy',
        stat_time_val: '5 sec',
        stat_time: 'evaluation time',
        badge_ai: '🤖 AI Analysis',
        badge_fast: '⚡ 5 sec',
        card_market_price: 'Market Price',
        card_recommended: 'Recommended',

        // Features
        features_badge: 'Features',
        features_title: 'Everything you need for successful sales',
        features_subtitle: 'Automate the routine and focus on what matters',
        feature_1_title: 'Smart recognition',
        feature_1_desc: 'AI analyzes photos and determines category, brand, condition, and item features',
        feature_2_title: 'Accurate pricing',
        feature_2_desc: 'Algorithm analyzes thousands of listings and provides market price with 98% accuracy',
        feature_3_title: 'Ready descriptions',
        feature_3_desc: 'Get SEO-optimized selling text with tags for your listing',
        feature_4_title: 'Instant results',
        feature_4_desc: 'Evaluation ready in 5 seconds. Upload up to 10 photos at once',
        feature_5_title: 'Evaluation history',
        feature_5_desc: 'All your items are saved. Export to CSV for accounting',
        feature_6_title: 'Security',
        feature_6_desc: 'Your data is protected. Photos are not shared with third parties',

        // How it works
        how_badge: 'How it works',
        how_title: 'Three simple steps',
        how_subtitle: 'From photo to ready listing in a minute',
        step_1_title: 'Upload photo',
        step_1_desc: 'Drag and drop images or select from gallery. We support JPG, PNG, WebP.',
        step_2_title: 'AI analyzes',
        step_2_desc: 'Neural network recognizes the item, finds analogues, and calculates optimal price.',
        step_3_title: 'Get results',
        step_3_desc: 'Description, market price, and recommendation ready. Copy and publish!',

        // Upload
        upload_badge: 'Try now',
        upload_title: 'Upload your item photo',
        upload_subtitle: '3 free evaluations every month',
        upload_drag: 'Drag photos here',
        upload_click: 'or click to select',
        upload_hint: 'JPG, PNG, WebP up to 10MB • Maximum 10 photos',
        btn_analyze: 'Get evaluation',
        btn_analyzing: 'Analyzing...',

        // Results
        results_title: 'Evaluation results',
        btn_export: 'Export',
        btn_clear: 'Clear',
        results_empty_title: 'No evaluations yet',
        results_empty_desc: 'Upload an item photo above to get an evaluation',
        market_price: 'Market price',
        recommended: 'Recommended',
        btn_publish: 'Publish on willhaben',
        btn_copy: 'Copy',

        // Pricing
        pricing_badge: 'Pricing',
        pricing_title: 'Choose your plan',
        pricing_subtitle: 'Start for free, scale as you grow',
        plan_free: 'Free',
        plan_pro_monthly: 'Pro Monthly',
        plan_pro_yearly: 'Pro Yearly',
        plan_starter: 'Starter',
        plan_free_desc: 'For testing',
        plan_starter_desc: 'For beginners',
        plan_pro_desc: 'For active sellers',
        plan_yearly_desc: '~€56/mo • Best value',
        month: '/month',
        year: '/year',
        badge_monthly: 'Monthly',
        badge_discount: '-43% Off',

        // Pricing features
        pf_evaluations_3: '3 evaluations per month',
        pf_evaluations_30: '30 evaluations per month',
        pf_german_desc: 'German description',
        pf_price_range: 'Price range',
        pf_no_listing: 'Ready listing',
        pf_no_history: 'History and export',
        pf_unlimited: 'Unlimited evaluations',
        pf_seo_german: 'SEO descriptions in German',
        pf_willhaben_listing: 'Ready listing for willhaben',
        pf_bulk: 'Bulk upload (50 photos)',
        pf_history_csv: 'History + CSV export',
        pf_all_pro: 'Everything from Pro Monthly',
        pf_2_months_free: '2 months free',
        pf_priority_support: 'Priority support',
        pf_early_access: 'Early access to features',
        pf_future_integrations: 'Future integrations (eBay)',
        btn_choose_starter: 'Choose Starter',
        btn_choose_pro: 'Choose Pro',
        btn_choose_yearly: 'Choose Yearly',

        // Footer
        footer_tagline: 'AI product evaluation for marketplaces',
        footer_product: 'Product',
        footer_company: 'Company',
        footer_support: 'Support',
        footer_about: 'About',
        footer_blog: 'Blog',
        footer_contact: 'Contact',
        footer_faq: 'FAQ',
        footer_api: 'API documentation',
        footer_status: 'System status',
        footer_privacy: 'Privacy policy',
        footer_terms: 'Terms of use',
        footer_rights: '© 2026 Willnicht. All rights reserved.',

        // Notifications
        notify_success: 'Evaluation complete!',
        notify_demo: 'Demo mode: showing example results',
        notify_error: 'Error',
        notify_copied: 'Description copied!',
        notify_exported: 'CSV exported!',
        notify_cleared: 'Results cleared',
        notify_unsupported: 'Unsupported format',
        notify_too_large: 'File too large',
        notify_max_files: 'Maximum files',
        confirm_clear: 'Delete all results?',
        notify_no_results: 'No results to export',
        btn_auto_post: 'Auto-publish',
        tooltip_pro_only: 'Available only in Pro',
        terms_manual: 'You agree to the Terms and undertake to manually copy and transfer data. Automation is in Beta status (Enterprise).',

        // App Internal
        settings_title: 'Settings',
        label_your_lang: 'Your language',
        label_marketplace_lang: 'Marketplace language',
        latest_result_title: 'Result',
        history_title: 'Evaluation History',
        results_empty_desc_history: 'Your previous evaluations will appear here',
        expired_label: 'Expired',
        label_additional_text: 'Additional Information',
        placeholder_additional_text: 'E.g., "This is vintage, consider defects..."',
        show_more: 'Show more',
        show_less: 'Show less',

        // Authentication
        login_title: 'Login',
        login_subtitle: 'Enter email and password to access the service',
        register_title: 'Register',
        register_subtitle: 'Create an account to access the service',
        btn_enter: 'Login',
        btn_register: 'Register',
        login_no_account: "Don't have an account?",
        login_has_account: 'Already have an account?',
        notify_logging_in: 'Logging in...',
        notify_login_success: 'Login successful',
        notify_login_error: 'Login error',
        notify_invalid_credentials: 'Invalid email or password',
        notify_email_not_confirmed: 'Email not confirmed',
        notify_registering: 'Registering...',
        notify_register_success: 'Registration successful! Check your email for confirmation',
        notify_register_error: 'Registration error',
        notify_user_exists: 'User with this email already exists',
        notify_passwords_dont_match: 'Passwords do not match',
        notify_logout_success: 'Logged out successfully',
        notify_logout_error: 'Logout error',
        notify_limit_reached: 'Monthly evaluation limit reached',
        notify_deleted: 'Evaluation deleted',
    },

    de: {
        // Header
        nav_features: 'Funktionen',
        nav_how_it_works: 'So funktioniert\'s',
        nav_pricing: 'Preise',
        btn_start_free: 'Kostenlos starten',

        // Hero
        hero_badge: 'Powered by AI',
        hero_title_1: 'Verkaufen auf willhaben',
        hero_title_2: 'ohne Sprachbarriere',
        hero_subtitle: 'Laden Sie ein Foto hoch — erhalten Sie eine deutsche Beschreibung, österreichischen Marktpreis und eine fertige Anzeige für willhaben.at. Perfekt für Expats.',
        hero_btn_upload: 'Foto hochladen',
        hero_btn_learn: 'Mehr erfahren',
        stat_evaluated_val: '10K+',
        stat_evaluated: 'Artikel bewertet',
        stat_accuracy_val: '98%',
        stat_accuracy: 'Preisgenauigkeit',
        stat_time_val: '5 Sek.',
        stat_time: 'Bewertungszeit',
        badge_ai: '🤖 KI-Analyse',
        badge_fast: '⚡ 5 Sek.',
        card_market_price: 'Marktpreis',
        card_recommended: 'Empfohlen',

        // Features
        features_badge: 'Funktionen',
        features_title: 'Alles was Sie für erfolgreiche Verkäufe brauchen',
        features_subtitle: 'Automatisieren Sie die Routine und konzentrieren Sie sich auf das Wesentliche',
        feature_1_title: 'Smarte Erkennung',
        feature_1_desc: 'KI analysiert Fotos und erkennt Kategorie, Marke, Zustand und Eigenschaften',
        feature_2_title: 'Genaue Bewertung',
        feature_2_desc: 'Algorithmus analysiert Tausende von Anzeigen und liefert Marktpreis mit 98% Genauigkeit',
        feature_3_title: 'Fertige Beschreibungen',
        feature_3_desc: 'Erhalten Sie SEO-optimierte Verkaufstexte mit Tags für Ihr Inserat',
        feature_4_title: 'Sofortiges Ergebnis',
        feature_4_desc: 'Bewertung in 5 Sekunden. Laden Sie bis zu 10 Fotos gleichzeitig hoch',
        feature_5_title: 'Bewertungshistorie',
        feature_5_desc: 'Alle Ihre Artikel werden gespeichert. Export als CSV möglich',
        feature_6_title: 'Sicherheit',
        feature_6_desc: 'Ihre Daten sind geschützt. Fotos werden nicht an Dritte weitergegeben',

        // How it works
        how_badge: 'So funktioniert\'s',
        how_title: 'Drei einfache Schritte',
        how_subtitle: 'Vom Foto zur fertigen Anzeige in einer Minute',
        step_1_title: 'Foto hochladen',
        step_1_desc: 'Bilder per Drag & Drop oder aus der Galerie auswählen. Wir unterstützen JPG, PNG, WebP.',
        step_2_title: 'KI analysiert',
        step_2_desc: 'Neuronales Netzwerk erkennt den Artikel, findet Vergleichsangebote und berechnet den optimalen Preis.',
        step_3_title: 'Ergebnis erhalten',
        step_3_desc: 'Beschreibung, Marktpreis und Empfehlung sind fertig. Kopieren und veröffentlichen!',

        // Upload
        upload_badge: 'Jetzt testen',
        upload_title: 'Laden Sie Ihr Artikelfoto hoch',
        upload_subtitle: '3 kostenlose Bewertungen pro Monat',
        upload_drag: 'Fotos hierher ziehen',
        upload_click: 'oder klicken zum Auswählen',
        upload_hint: 'JPG, PNG, WebP bis 10MB • Maximal 10 Fotos',
        btn_analyze: 'Bewertung erhalten',
        btn_analyzing: 'Analysiere...',

        // Results
        results_title: 'Bewertungsergebnisse',
        btn_export: 'Exportieren',
        btn_clear: 'Löschen',
        results_empty_title: 'Noch keine Bewertungen',
        results_empty_desc: 'Laden Sie oben ein Artikelfoto hoch, um eine Bewertung zu erhalten',
        market_price: 'Marktpreis',
        recommended: 'Empfohlen',
        btn_publish: 'Auf willhaben veröffentlichen',
        btn_copy: 'Kopieren',

        // Pricing
        pricing_badge: 'Preise',
        pricing_title: 'Wählen Sie Ihren Plan',
        pricing_subtitle: 'Starten Sie kostenlos, skalieren Sie nach Bedarf',
        plan_free: 'Free',
        plan_pro_monthly: 'Pro Monatlich',
        plan_pro_yearly: 'Pro Jährlich',
        plan_starter: 'Starter',
        plan_free_desc: 'Zum Testen',
        plan_starter_desc: 'Für Anfänger',
        plan_pro_desc: 'Für aktive Verkäufer',
        plan_yearly_desc: '~€56/Mon. • Bester Wert',
        month: '/Monat',
        year: '/Jahr',
        badge_monthly: 'Monatlich',
        badge_discount: '-43% Rabatt',

        // Pricing features
        pf_evaluations_3: '3 Bewertungen pro Monat',
        pf_evaluations_30: '30 Bewertungen pro Monat',
        pf_german_desc: 'Deutsche Beschreibung',
        pf_price_range: 'Preisspanne',
        pf_no_listing: 'Fertiges Inserat',
        pf_no_history: 'Historie und Export',
        pf_unlimited: 'Unbegrenzte Bewertungen',
        pf_seo_german: 'SEO-Beschreibungen auf Deutsch',
        pf_willhaben_listing: 'Fertiges Inserat für willhaben',
        pf_bulk: 'Bulk-Upload (50 Fotos)',
        pf_history_csv: 'Historie + CSV-Export',
        pf_all_pro: 'Alles aus Pro Monatlich',
        pf_2_months_free: '2 Monate gratis',
        pf_priority_support: 'Prioritäts-Support',
        pf_early_access: 'Früher Zugang zu Features',
        pf_future_integrations: 'Künftige Integrationen (eBay)',
        btn_choose_starter: 'Starter wählen',
        btn_choose_pro: 'Pro wählen',
        btn_choose_yearly: 'Jährlich wählen',

        // Footer
        footer_tagline: 'KI-Artikelbewertung für Marktplätze',
        footer_product: 'Produkt',
        footer_company: 'Unternehmen',
        footer_support: 'Support',
        footer_about: 'Über uns',
        footer_blog: 'Blog',
        footer_contact: 'Kontakt',
        footer_faq: 'FAQ',
        footer_api: 'API-Dokumentation',
        footer_status: 'Systemstatus',
        footer_privacy: 'Datenschutz',
        footer_terms: 'Nutzungsbedingungen',
        footer_rights: '© 2026 Willnicht. Alle Rechte vorbehalten.',

        // Notifications
        notify_success: 'Bewertung abgeschlossen!',
        notify_demo: 'Demo-Modus: Beispielergebnisse werden angezeigt',
        notify_error: 'Fehler',
        notify_copied: 'Beschreibung kopiert!',
        notify_exported: 'CSV exportiert!',
        notify_cleared: 'Ergebnisse gelöscht',
        notify_unsupported: 'Nicht unterstütztes Format',
        notify_too_large: 'Datei zu groß',
        notify_max_files: 'Maximum Dateien',
        confirm_clear: 'Alle Ergebnisse löschen?',
        notify_no_results: 'Keine Ergebnisse zum Exportieren',
        btn_auto_post: 'Auto-Veröffentlichung',
        tooltip_pro_only: 'Nur in Pro verfügbar',
        terms_manual: 'Sie stimmen den Nutzungsbedingungen zu und verpflichten sich, Daten manuell zu kopieren. Automatisierung im Beta-Status (Enterprise).',

        // App Internal
        settings_title: 'Einstellungen',
        label_your_lang: 'Ihre Sprache',
        label_marketplace_lang: 'Marktplatz-Sprache',
        latest_result_title: 'Ergebnis',
        history_title: 'Bewertungshistorie',
        results_empty_desc_history: 'Hier erscheinen Ihre früheren Bewertungen',
        expired_label: 'Abgelaufen',
        label_additional_text: 'Zusatzinformation',
        placeholder_additional_text: 'Z.B. "Vintage-Artikel, bitte Mängel beachten..."',
        show_more: 'Mehr anzeigen',
        show_less: 'Weniger anzeigen',

        // Authentication
        login_title: 'Anmelden',
        login_subtitle: 'Geben Sie Email und Passwort ein, um auf den Service zuzugreifen',
        register_title: 'Registrieren',
        register_subtitle: 'Erstellen Sie ein Konto, um auf den Service zuzugreifen',
        btn_enter: 'Anmelden',
        btn_register: 'Registrieren',
        login_no_account: 'Kein Konto?',
        login_has_account: 'Haben Sie bereits ein Konto?',
        notify_logging_in: 'Anmelden...',
        notify_login_success: 'Anmeldung erfolgreich',
        notify_login_error: 'Anmeldefehler',
        notify_invalid_credentials: 'Ungültige Email oder Passwort',
        notify_email_not_confirmed: 'Email nicht bestätigt',
        notify_registering: 'Registrierung...',
        notify_register_success: 'Registrierung erfolgreich! Überprüfen Sie Ihre Email für Bestätigung',
        notify_register_error: 'Registrierungsfehler',
        notify_user_exists: 'Benutzer mit dieser Email existiert bereits',
        notify_passwords_dont_match: 'Passwörter stimmen nicht überein',
        notify_logout_success: 'Erfolgreich abgemeldet',
        notify_logout_error: 'Abmeldefehler',
        notify_limit_reached: 'Monatliches Bewertungslimit erreicht',
        notify_deleted: 'Bewertung gelöscht',
    }
};

// Current language
let currentLang = localStorage.getItem('willnicht_lang') || 'ru';

// Get translation
function t(key) {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.ru[key] || key;
}

// Set language
function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;

    currentLang = lang;
    localStorage.setItem('willnicht_lang', lang);

    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang;

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Update placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Update dropdown current label
    const activeLangLabel = document.getElementById('activeLangLabel');
    if (activeLangLabel) {
        activeLangLabel.textContent = lang.toUpperCase();
    }

    // Update active state of dropdown items
    document.querySelectorAll('.lang-dropdown-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });

    // Close dropdown after selection
    const langSelector = document.querySelector('.lang-selector');
    if (langSelector) {
        langSelector.classList.remove('active');
    }
}

// Initialize i18n
function initI18n() {
    // Apply current language
    setLanguage(currentLang);

    // Dropdown toggle
    const langSelectorTitle = document.querySelector('.lang-selector-title');
    const langSelector = document.querySelector('.lang-selector');

    if (langSelectorTitle && langSelector) {
        langSelectorTitle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = langSelector.classList.toggle('active');
            // Update aria-expanded for accessibility
            langSelectorTitle.setAttribute('aria-expanded', isOpen.toString());
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            langSelector.classList.remove('active');
            // Update aria-expanded when closing
            langSelectorTitle.setAttribute('aria-expanded', 'false');
        });
    }

    // Add click handlers to language buttons
    document.querySelectorAll('.lang-dropdown-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            setLanguage(btn.dataset.lang);
        });
    });
}

// Export for use in app.js
window.t = t;
window.setLanguage = setLanguage;
window.initI18n = initI18n;
window.currentLang = () => currentLang;
