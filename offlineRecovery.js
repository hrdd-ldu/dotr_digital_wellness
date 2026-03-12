// offlineRecovery.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Offline/Online Status Indicator ---
    // Creates a banner at the top of the screen when the user loses connection
    const networkBanner = document.createElement('div');
    networkBanner.id = 'network-status-banner';
    networkBanner.className = 'fixed top-0 left-0 w-full text-center py-2 text-sm font-bold text-white z-[9999] transition-all duration-300 transform -translate-y-full';
    document.body.appendChild(networkBanner);

    function updateNetworkStatus() {
        if (navigator.onLine) {
            networkBanner.classList.add('-translate-y-full');
            networkBanner.classList.remove('bg-red-500');
        } else {
            networkBanner.textContent = '⚠️ You are currently offline. Progress is being saved locally.';
            networkBanner.classList.remove('-translate-y-full');
            networkBanner.classList.add('bg-red-500');
        }
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // --- 2. Auto-Save Form Data (Reflections & Evaluations) ---
    // Saves text inputs so they aren't lost on refresh
    const textAreas = [
        'ref1-q1', 'ref1-q2', 
        'ref2-q1', 'ref2-q2',
        'eval-insight', 'eval-suggest'
    ];

    textAreas.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Restore saved data on load
            const savedText = localStorage.getItem(`draft_${id}`);
            if (savedText) el.value = savedText;

            // Save to local storage on every keystroke
            el.addEventListener('input', (e) => {
                localStorage.setItem(`draft_${id}`, e.target.value);
            });
        }
    });
});

// --- 3. Override Video Timer for Persistence ---
// This replaces the existing startTimer function in digi.html to inject localStorage saving
window.startTimer = function(mod, btnId, dur) {
    const storageKey = `dotr_video_progress_${mod}`;
    
    // Fetch previous progress or start at 0
    let p = parseInt(localStorage.getItem(storageKey)) || 0; 
    const fill = document.getElementById(`timer-fill-${mod}`); 
    const btn = document.getElementById(btnId);
    
    // If already unlocked, fill bar and exit
    if(!btn.disabled) { 
        fill.style.width="100%"; 
        return; 
    }
    
    // Visually restore the progress bar immediately
    fill.style.width = `${(p/dur)*100}%`;

    const int = setInterval(() => {
        if(!document.hidden) {
            p++;
            
            // Save progress to local storage every 5 seconds to minimize browser workload
            if (p % 5 === 0) {
                localStorage.setItem(storageKey, p);
            }
        }
        
        fill.style.width = `${(p/dur)*100}%`;
        
        // When timer finishes
        if(p >= dur) { 
            clearInterval(int); 
            btn.disabled = false; 
            btn.classList.remove('opacity-50','cursor-not-allowed'); 
            
            // Clear the local storage since the requirement is met
            localStorage.removeItem(storageKey); 
        }
    }, 1000);
}