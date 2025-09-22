/*
==================================================
FIREBASE CONFIGURATION MODULE
==================================================
Author: Attendance Tracker System
Description: Centralized Firebase configuration
Last Updated: 2024
==================================================
*/

// Firebase Configuration - Single source of truth
const firebaseConfig = {
  apiKey: "AIzaSyAJAl0Y-vtu-edqDBiOUWZHLRuPpg2W7AY",
  authDomain: "attendancetracker-f8461.firebaseapp.com",
  projectId: "attendancetracker-f8461",
  storageBucket: "attendancetracker-f8461.appspot.com",
  messagingSenderId: "87952419692",
  appId: "1:87952419692:web:6ca63cb53cc467be972149"
};

// Initialize Firebase
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.log('Firebase already initialized');
}

// Create and export Firebase services immediately to window
window.auth = firebase.auth();
window.db = firebase.firestore();
window.storage = firebase.storage();

// Also create the FirebaseConfig object for new code
window.FirebaseConfig = {
  auth: window.auth,
  db: window.db,
  storage: window.storage
};

// Configure Firestore settings for better performance
window.db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Enable offline persistence
window.db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser doesn\'t support all features required for persistence.');
  }
});

// Common utility functions
const FirebaseUtils = {
  // Check if user is authenticated
  isAuthenticated: () => window.auth.currentUser !== null,
  
  // Get current user
  getCurrentUser: () => window.auth.currentUser,
  
  // Get current user's UID safely
  getCurrentUserId: () => {
    const user = window.auth.currentUser;
    return user ? user.uid : null;
  },
  
  // Get current user's email safely
  getCurrentUserEmail: () => {
    const user = window.auth.currentUser;
    return user ? user.email : null;
  },
  
  // Logout function with proper error handling
  logout: async function() {
    try {
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Firebase
      await window.auth.signOut();
      
      // Redirect to login page
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if Firebase signout fails
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'index.html';
    }
  },
  
  // Wait for auth state to be ready
  waitForAuth: () => {
    return new Promise((resolve) => {
      const unsubscribe = window.auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },
  
  // Check if Firebase is connected
  checkConnection: async () => {
    try {
      // Try to read from Firestore to check connection
      await window.db.doc('system/test').get();
      return true;
    } catch (error) {
      console.warn('Firebase connection check failed:', error);
      return false;
    }
  }
};

// Auth state change listener with error handling
window.auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user.email);
    // Store user info in session storage for quick access
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem('userId', user.uid);
  } else {
    console.log('User is signed out');
    // Clear session storage when user signs out
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId');
  }
}, (error) => {
  console.error('Auth state change error:', error);
});

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.code) {
    // Firebase-specific errors
    switch (event.reason.code) {
      case 'permission-denied':
        console.error('Firebase permission denied:', event.reason);
        break;
      case 'unavailable':
        console.error('Firebase service unavailable:', event.reason);
        break;
      case 'unauthenticated':
        console.error('Firebase unauthenticated:', event.reason);
        // Redirect to login if not on login page
        if (!window.location.pathname.includes('index.html')) {
          window.location.href = 'index.html';
        }
        break;
      default:
        console.error('Firebase error:', event.reason);
    }
  }
});

// Export everything for use in other scripts
window.FirebaseConfig = {
  auth: window.auth,
  db: window.db,
  storage: window.storage,
  utils: FirebaseUtils
};
