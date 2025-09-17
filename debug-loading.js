// Debug script to manually hide loading screen
// Run this in browser console if loading screen is stuck

console.log('=== LOADING SCREEN DEBUG SCRIPT ===');

function forceHideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        console.log('Found loading screen element');
        
        // Method 1: Set display to none
        loadingScreen.style.display = 'none';
        
        // Method 2: Set opacity to 0
        loadingScreen.style.opacity = '0';
        
        // Method 3: Set visibility to hidden
        loadingScreen.style.visibility = 'hidden';
        
        // Method 4: Remove from DOM entirely
        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 100);
        
        console.log('Loading screen forcibly hidden');
        return true;
    } else {
        console.log('Loading screen element not found');
        return false;
    }
}

function debugLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        console.log('Loading Screen Debug Info:');
        console.log('- Element found:', !!loadingScreen);
        console.log('- Display:', getComputedStyle(loadingScreen).display);
        console.log('- Opacity:', getComputedStyle(loadingScreen).opacity);
        console.log('- Visibility:', getComputedStyle(loadingScreen).visibility);
        console.log('- Z-index:', getComputedStyle(loadingScreen).zIndex);
        console.log('- Position:', getComputedStyle(loadingScreen).position);
        console.log('- Animation:', getComputedStyle(loadingScreen).animation);
    } else {
        console.log('Loading screen element not found');
    }
}

// Run debug
debugLoadingScreen();

// Auto-hide after 1 second
setTimeout(() => {
    console.log('Auto-hiding loading screen...');
    forceHideLoadingScreen();
}, 1000);

console.log('To manually hide: run forceHideLoadingScreen()');
console.log('To debug: run debugLoadingScreen()');