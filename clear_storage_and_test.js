// ========================================
// CLEAR LOCALSTORAGE AND TEST APPLICATION
// ========================================
// Run this in browser DevTools Console (F12)

console.log('🧹 Starting cleanup and test...\n');

// Step 1: Clear localStorage
console.log('Step 1: Clearing localStorage...');
const clearedKeys = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('willnicht') || key.includes('supabase')) {
        clearedKeys.push(key);
    }
}
clearedKeys.forEach(key => localStorage.removeItem(key));
console.log(`✅ Cleared ${clearedKeys.length} keys:`, clearedKeys);

// Step 2: Check application state
console.log('\nStep 2: Checking application state...');
console.log('currentUser:', window.currentUser);
console.log('state.results:', window.state?.results?.length || 0);
console.log('CONFIG.useSupabase:', window.CONFIG?.useSupabase);
console.log('isSupabaseConfigured():', window.isSupabaseConfigured?.());

// Step 3: Check authentication
console.log('\nStep 3: Checking authentication...');
getSupabase()?.auth.getSession().then(({ data: { session } }) => {
    console.log('Session exists:', !!session);
    console.log('User email:', session?.user?.email);
    console.log('User ID:', session?.user?.id);
});

// Step 4: Test localStorage save
console.log('\nStep 4: Testing localStorage save...');
if (window.saveResultsToLocalStorage) {
    window.saveResultsToLocalStorage();
    const saved = localStorage.getItem('willnicht_results');
    console.log('Saved results to localStorage:', saved ? JSON.parse(saved).length : 0);
}

// Step 5: Render results
console.log('\nStep 5: Rendering results...');
if (window.renderResults) {
    window.renderResults();
    console.log('✅ renderResults() called');
}

// Step 6: Check DOM
console.log('\nStep 6: Checking DOM...');
console.log('Latest result container visible:', !document.getElementById('latestResultContainer')?.hidden);
console.log('Empty state visible:', !document.getElementById('emptyStateContainer')?.hidden);
console.log('Result cards:', document.querySelectorAll('.result-card').length);

console.log('\n✅ Test complete! Check the output above for any issues.');
console.log('\n💡 Next steps:');
console.log('1. If you see any errors above, fix them first');
console.log('2. Run the SQL query in Supabase Dashboard (fix_supabase_rls.sql)');
console.log('3. Refresh the page (Cmd+R)');
console.log('4. Try uploading a new photo to test the complete flow');
