/**
 * Triple Failsafe WordPress Integration Verification
 * Run this in the browser console when in WordPress editor
 */

console.clear();
console.log('🔍 TRIPLE FAILSAFE VERIFICATION\n');

// 1. Environment Check
console.log('1️⃣ ENVIRONMENT CHECK:');
const isInEditor = window.parent !== window && window.location.search.includes('edit_mode=1');
console.log(`   In WordPress Editor: ${isInEditor ? '✅ YES' : '❌ NO'}`);
console.log(`   Current URL: ${window.location.href}`);

// 2. System Availability
console.log('\n2️⃣ SYSTEM AVAILABILITY:');
console.log(`   Triple Failsafe: ${window.violetTripleFailsafe ? '✅ Available' : '❌ Not Found'}`);
console.log(`   Content Storage: ${typeof window.saveContent === 'function' ? '✅ Available' : '⚠️ Limited'}`);
console.log(`   WordPress Bridge: ${window.violetBridge ? '✅ Available' : '⚠️ Not Loaded'}`);

// 3. Storage Layer Status
console.log('\n3️⃣ STORAGE LAYERS:');
const checkStorage = () => {
    const primary = localStorage.getItem('violet-content-primary');
    const backup = localStorage.getItem('violet-content-backup');
    const session = sessionStorage.getItem('violet-content-session');
    
    console.log(`   LocalStorage Primary: ${primary ? '✅ ' + JSON.parse(primary).data ? Object.keys(JSON.parse(primary).data).length + ' fields' : '✅ Has data' : '❌ Empty'}`);
    console.log(`   LocalStorage Backup: ${backup ? '✅ ' + Object.keys(JSON.parse(backup)).length + ' fields' : '❌ Empty'}`);
    console.log(`   SessionStorage: ${session ? '✅ Has data' : '❌ Empty'}`);
    
    // Check IndexedDB
    if (window.indexedDB) {
        const request = window.indexedDB.open('VioletContentDB', 1);
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['content'], 'readonly');
            const store = transaction.objectStore('content');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = function() {
                console.log(`   IndexedDB: ${getAllRequest.result.length > 0 ? '✅ ' + getAllRequest.result.length + ' records' : '❌ Empty'}`);
                db.close();
            };
        };
    }
};
checkStorage();

// 4. Content Check
console.log('\n4️⃣ CURRENT CONTENT:');
if (window.violetTripleFailsafe) {
    window.violetTripleFailsafe.getContent().then(content => {
        console.log('   Content fields:', Object.keys(content));
        console.log('   Sample:', content.hero_title || 'No hero_title found');
    });
}

// 5. Test Functions
console.log('\n5️⃣ TEST FUNCTIONS:');

// Test save function
window.testTripleFailsafeSave = async function(fieldName = 'test_field', value = 'Triple Failsafe Test ' + Date.now()) {
    console.log(`\n🧪 Testing save: ${fieldName} = "${value}"`);
    
    if (window.violetTripleFailsafe) {
        await window.violetTripleFailsafe.testSave(fieldName, value);
        console.log('✅ Save completed');
        
        // Verify save
        const content = await window.violetTripleFailsafe.getContent();
        if (content[fieldName] === value) {
            console.log('✅ Verification: Content saved correctly');
        } else {
            console.log('❌ Verification: Content mismatch');
        }
    } else {
        console.error('❌ Triple Failsafe not available');
    }
};

// Test WordPress message
window.testWordPressMessage = function() {
    console.log('\n📤 Sending WordPress save message...');
    window.postMessage({
        type: 'violet-apply-saved-changes',
        savedChanges: [
            { field_name: 'hero_title', field_value: 'WordPress Message Test ' + Date.now() },
            { field_name: 'test_message', field_value: 'From WordPress at ' + new Date().toLocaleTimeString() }
        ]
    }, '*');
    console.log('✅ Message sent');
};

// Test failover
window.testFailover = async function() {
    console.log('\n🔄 Testing failover recovery...');
    
    // Corrupt primary storage
    localStorage.setItem('violet-content-primary', 'CORRUPTED_DATA');
    console.log('💥 Primary storage corrupted');
    
    // Try to load content
    if (window.violetTripleFailsafe) {
        const content = await window.violetTripleFailsafe.getContent();
        console.log('📋 Recovered content:', Object.keys(content).length > 0 ? '✅ Success' : '❌ Failed');
    }
};

// 6. Instructions
console.log('\n📋 INSTRUCTIONS:');
console.log('1. Test save: testTripleFailsafeSave()');
console.log('2. Test WordPress: testWordPressMessage()');
console.log('3. Test failover: testFailover()');
console.log('4. Make edits and save in WordPress toolbar');
console.log('5. Refresh and check persistence');

// 7. Auto-monitoring
console.log('\n📊 MONITORING ACTIVE:');
let lastSaveCount = 0;

// Monitor storage changes
const monitorStorage = setInterval(() => {
    const primary = localStorage.getItem('violet-content-primary');
    if (primary) {
        try {
            const data = JSON.parse(primary);
            const currentCount = data.data ? Object.keys(data.data).length : 0;
            if (currentCount !== lastSaveCount) {
                console.log(`📝 Storage updated: ${currentCount} fields (was ${lastSaveCount})`);
                lastSaveCount = currentCount;
            }
        } catch (e) {}
    }
}, 2000);

// Listen for messages
window.addEventListener('message', (event) => {
    if (event.data.type && event.data.type.includes('violet')) {
        console.log(`📨 Message received: ${event.data.type}`);
    }
});

console.log('\n✨ Verification script ready!');
