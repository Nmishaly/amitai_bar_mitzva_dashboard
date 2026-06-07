const HARDCODED_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAe4nHXoNXaLIDi8-3L0axDUrpiAVqoHG8",
  authDomain: "amitai-bar-mitzvah.firebaseapp.com",
  projectId: "amitai-bar-mitzvah",
  storageBucket: "amitai-bar-mitzvah.firebasestorage.app",
  messagingSenderId: "384741194010",
  appId: "1:384741194010:web:9b014829a95fcdab82d4a3"
};  

let firebaseApp = null;
let db = null;
let auth = null;
let isCloudConnected = false;
let isSeeding = false;
let appId = localStorage.getItem('bm_appId') || 'bar-mitzvah-amitai';

// ─── הגדרות אירוע ───────────────────────────────────────
const EVENT_CONFIG = {
    eventDate: "2026-06-12T18:00:00",   // תאריך ושעת כניסת שבת
    eventName: "שבת בר המצווה של אמיתי",
    maxBudgetDefault: 33000              // תקציב מקסימום ברירת מחדל
};
