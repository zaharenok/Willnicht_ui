/**
 * Supabase Client Initialization
 * 
 * This file initializes the Supabase client for the Willnicht application.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Go to Project Settings > API
 * 3. Copy your project URL and anon/public key
 * 4. Replace the placeholder values below
 * 5. Run the schema.sql file in the Supabase SQL Editor
 */

// ========================================
// CONFIGURATION
// ========================================
const SUPABASE_CONFIG = {
    // Replace these with your actual Supabase project credentials
    url: 'https://tqqedqqxbesniofizplh.supabase.co',
    anonKey: 'sb_publishable_imcXDM8F0iOc4_J45tqPDQ_o1XECL5J',
    
    // Optional: Additional client options
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    }
};

// ========================================
// SUPABASE CLIENT
// ========================================
let supabaseClient = null;

/**
 * Initialize the Supabase client
 * @returns {Object} Supabase client instance
 */
function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    // Check if credentials are configured
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_PROJECT_URL_HERE' ||
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        console.warn('Supabase credentials not configured. Please update SUPABASE_CONFIG in supabase/client.js');
        return null;
    }

    try {
        // Initialize Supabase client (using CDN version)
        // @ts-ignore
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey,
            SUPABASE_CONFIG.options
        );

        // console.log('Supabase client initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        return null;
    }
}

/**
 * Get the Supabase client instance
 * @returns {Object} Supabase client instance
 */
function getSupabase() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Auth response
 */
async function signUp(email, password) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Sign in an existing user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Auth response
 */
async function signIn(email, password) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Sign out the current user
 * @returns {Promise<Object>} Auth response
 */
async function signOut() {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }

    return { success: true };
}

/**
 * Get the current user session
 * @returns {Promise<Object|null>} User session or null
 */
async function getSession() {
    const supabase = getSupabase();
    if (!supabase) {
        return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error);
        return null;
    }

    return session;
}

/**
 * Get the current user
 * @returns {Promise<Object|null>} User object or null
 */
async function getCurrentUser() {
    const session = await getSession();
    return session?.user || null;
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function with (event, session) parameters
 * @returns {Object} Subscription object
 */
function onAuthStateChange(callback) {
    const supabase = getSupabase();
    if (!supabase) {
        return { unsubscribe: () => {} };
    }

    return supabase.auth.onAuthStateChange(callback);
}

// ========================================
// DATABASE FUNCTIONS - LISTINGS
// ========================================

/**
 * Fetch all listings for the current user
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of listings to fetch
 * @param {number} options.offset - Number of listings to skip
 * @returns {Promise<Array>} Array of listings
 */
async function fetchListings(options = {}) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { limit = 50, offset = 0 } = options;

    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Fetch a single listing by ID
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Listing object
 */
async function fetchListingById(id) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Create a new listing
 * @param {Object} listing - Listing data
 * @returns {Promise<Object>} Created listing
 */
async function createListing(listing) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('listings')
        .insert([listing])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Update an existing listing
 * @param {string} id - Listing ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated listing
 */
async function updateListing(id, updates) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Delete a listing
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Deletion response
 */
async function deleteListing(id) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

    if (error) {
        throw error;
    }

    return { success: true };
}

// ========================================
// DATABASE FUNCTIONS - PROFILES
// ========================================

/**
 * Fetch the current user's profile
 * @returns {Promise<Object>} User profile
 */
async function fetchProfile() {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Update the current user's profile
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated profile
 */
async function updateProfile(updates) {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if Supabase is properly configured
 * @returns {boolean} True if configured
 */
function isSupabaseConfigured() {
    return SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_PROJECT_URL_HERE' &&
           SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';
}

/**
 * Get user's evaluation count for current month
 * @returns {Promise<number>} Number of evaluations this month
 */
async function getUserEvaluationCount() {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase.rpc('get_user_evaluations_count');

    if (error) {
        throw error;
    }

    return data || 0;
}

/**
 * Check if user can create a new evaluation
 * @returns {Promise<boolean>} True if user can create evaluation
 */
async function canCreateEvaluation() {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase.rpc('can_create_evaluation');

    if (error) {
        throw error;
    }

    return data || false;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSupabase,
        getSupabase,
        signUp,
        signIn,
        signOut,
        getSession,
        getCurrentUser,
        onAuthStateChange,
        fetchListings,
        fetchListingById,
        createListing,
        updateListing,
        deleteListing,
        fetchProfile,
        updateProfile,
        isSupabaseConfigured,
        getUserEvaluationCount,
        canCreateEvaluation
    };
}
