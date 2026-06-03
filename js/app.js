let tasks = JSON.parse(localStorage.getItem('bm_tasks')) || defaultTasks;
let shopping = JSON.parse(localStorage.getItem('bm_shopping')) || defaultShopping;
let calls = JSON.parse(localStorage.getItem('bm_calls')) || defaultCalls;
let rooms = JSON.parse(localStorage.getItem('bm_rooms')) || defaultRooms;
let rsvps = JSON.parse(localStorage.getItem('bm_rsvps')) || [];
let budget = JSON.parse(localStorage.getItem('bm_budget')) || [];
let logistics = JSON.parse(localStorage.getItem('bm_logistics')) || [];
let menu = JSON.parse(localStorage.getItem('bm_menu')) || [];
let currentMenuFilter = 'הכל';
let editingMenuId = null;
let schedule = JSON.parse(localStorage.getItem('bm_schedule')) || [];
let editingScheduleId = null;
let currentTab = 'tasks';
let editingTaskId = null; // מזהה המשימה שנמצאת כרגע בעריכה
let currentResponsibleFilter = 'all'; // פילטר סינון גלובלי למשימות
let taskViewMode = localStorage.getItem('bm_taskViewMode') || 'dynamic'; // dynamic or sorted

// Base today baseline is dynamically set to the current date
const TODAY_BASELINE = new Date();
TODAY_BASELINE.setHours(0, 0, 0, 0); // ניקוי שעות כדי שהחישוב יהיה על ימים בלבד


function saveLocalState() {
    const states = {
        'bm_tasks': tasks,
        'bm_shopping': shopping,
        'bm_calls': calls,
        'bm_rooms': rooms,
        'bm_rsvps': rsvps,
        'bm_budget': budget,
        'bm_logistics': logistics,
        'bm_menu': menu,
        'bm_schedule': schedule
    };

    try {
        for (const [key, value] of Object.entries(states)) {
            const dataString = JSON.stringify(value);
            // 1. כתיבה לגיבוי זמני
            localStorage.setItem(key + '_temp', dataString);
            // 2. כתיבה לערך הראשי
            localStorage.setItem(key, dataString);
            // 3. הסרת הגיבוי (אופציונלי - משאיר אותו למקרה חירום)
        }
    } catch (e) {
        console.error("שגיאה בשמירה ל-LocalStorage:", e);
    }
}

function getActiveTasks(allTasks) {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return allTasks.filter(task => {
        if (task.status !== 'done') return true;
        const completionDate = task.updatedAt || task.createdAt || 0;
        return (now - completionDate) < THIRTY_DAYS_MS;
    });
}

function getRelativeCategory(deadlineStr) {
    if (!deadlineStr) return 'future';
    try {
        const deadlineDate = new Date(deadlineStr + "T00:00:00");
        const diffTime = deadlineDate.getTime() - TODAY_BASELINE.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'overdue';
        if (diffDays === 0 || diffDays === 1) return 'today';
        if (diffDays > 1 && diffDays <= 7) return 'thisweek';
        return 'future';
    } catch(e) {
        return 'future';
    }
}

function setTaskViewMode(mode) {
    taskViewMode = mode;
    localStorage.setItem('bm_taskViewMode', mode);
    
    // Update active buttons safely
    const btnDynamic = document.getElementById('btnViewDynamic');
    const btnSorted = document.getElementById('btnViewSorted');
    const layoutDynamic = document.getElementById('dynamicTasksLayout');
    const layoutSorted = document.getElementById('sortedTasksLayout');
    
    if (mode === 'dynamic') {
        if (btnDynamic) btnDynamic.className = "px-3 py-1 rounded-xl text-xs font-bold border bg-indigo-600 border-indigo-600 text-white shadow-sm transition";
        if (btnSorted) btnSorted.className = "px-3 py-1 rounded-xl text-xs font-bold border bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 transition";
        if (layoutDynamic) layoutDynamic.classList.remove('hidden');
        if (layoutSorted) layoutSorted.classList.add('hidden');
    } else {
        if (btnDynamic) btnDynamic.className = "px-3 py-1 rounded-xl text-xs font-bold border bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 transition";
        if (btnSorted) btnSorted.className = "px-3 py-1 rounded-xl text-xs font-bold border bg-indigo-600 border-indigo-600 text-white shadow-sm transition";
        if (layoutDynamic) layoutDynamic.classList.add('hidden');
        if (layoutSorted) layoutSorted.classList.remove('hidden');
    }
    renderTasks();
}

function setResponsibleFilter(value) {
    currentResponsibleFilter = value;
    
    const mainButtons = {
        'all': document.getElementById('filter-all'),
        'נצר': document.getElementById('filter-נצר'),
        'נעמה': document.getElementById('filter-נעמה'),
        'משותף': document.getElementById('filter-משותף')
    };
    
    Object.keys(mainButtons).forEach(key => {
        const btn = mainButtons[key];
        if (!btn) return;
        if (key === value) {
            btn.className = "px-3 py-1 rounded-xl text-xs font-bold border transition bg-indigo-600 border-indigo-600 text-white shadow-sm";
        } else {
            btn.className = "px-3 py-1 rounded-xl text-xs font-bold border transition bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200";
        }
    });

    const alonButtons = {
        'all': document.getElementById('filter-alon-all'),
        'נצר': document.getElementById('filter-alon-נצר'),
        'נעמה': document.getElementById('filter-alon-נעמה'),
        'משותף': document.getElementById('filter-alon-משותף')
    };
    
    Object.keys(alonButtons).forEach(key => {
        const btn = alonButtons[key];
        if (!btn) return;
        if (key === value) {
            btn.className = "px-3 py-1 rounded-xl text-xs font-bold border transition bg-purple-600 border-purple-600 text-white shadow-sm";
        } else {
            btn.className = "px-3 py-1 rounded-xl text-xs font-bold border transition bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200";
        }
    });

    renderTasks();
}

function sendWa(phoneNumber) {
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(currentWaText)}`;
    window.open(url, '_blank');
}

function toggleAllMeals(status) {
    const f = document.getElementById('rsvpMealFriday');
    const s = document.getElementById('rsvpMealSaturday');
    const t = document.getElementById('rsvpMealThird');
    if (f) f.checked = status;
    if (s) s.checked = status;
    if (t) t.checked = status;
}

async function addNewRsvp() {
    const nameEl = document.getElementById('rsvpName');
    const adultsEl = document.getElementById('rsvpAdults');
    const kidsEl = document.getElementById('rsvpKids');
    const sleepEl = document.getElementById('rsvpSleep');
    
    if (!nameEl) return;
    const name = nameEl.value.trim();
    const adults = adultsEl ? (parseInt(adultsEl.value) || 0) : 0;
    const kids = kidsEl ? (parseInt(kidsEl.value) || 0) : 0;
    const sleep = sleepEl ? sleepEl.value : 'no';

    if (!name) {
        showToast("אנא הזינו שם אורח או משפחה!");
        return;
    }

    const mealsSelected = [];
    const mFriday = document.getElementById('rsvpMealFriday');
    const mSaturday = document.getElementById('rsvpMealSaturday');
    const mThird = document.getElementById('rsvpMealThird');
    
    if (mFriday && mFriday.checked) mealsSelected.push('friday');
    if (mSaturday && mSaturday.checked) mealsSelected.push('saturday');
    if (mThird && mThird.checked) mealsSelected.push('third');

    const newGuest = {
        id: 'g_' + Date.now(),
        name: name,
        adults: adults,
        kids: kids,
        sleep: sleep,
        meals: mealsSelected
    };

    // Immediate local Optimistic Update
    rsvps.push(newGuest);
    saveLocalState();
    renderRsvps();

    if (isCloudConnected && db) {
        dbSet('rsvps', newGuest.id, newGuest);
    }

    nameEl.value = "";
    if (adultsEl) adultsEl.value = "2";
    if (kidsEl) kidsEl.value = "0";
    if (sleepEl) sleepEl.value = "no";
    toggleAllMeals(true);

    showToast("האורח נרשם בהצלחה!");
}

async function deleteRsvp(guestId) {
    // Immediate local update
    rsvps = rsvps.filter(g => g.id !== guestId);
    saveLocalState();
    renderRsvps();

    if (isCloudConnected && db) {
        dbDelete('rsvps', guestId);
    }
    showToast("הרישום הוסר");
}

function calculateDrinks() {
    // 1. קבלת מספר האורחים לכל ארוחה
    const fr = parseInt(document.getElementById('guestsFriday').value) || 0;
    const sa = parseInt(document.getElementById('guestsSaturday').value) || 0;
    const th = parseInt(document.getElementById('guestsThird').value) || 0;
    
    // 2. חישוב לפי צריכה למשתתף (0.5 ליטר לארוחה לאדם כממוצע)
    const totalLiters = (fr + sa + th) * 0.5;
    
    // 3. חישוב בקבוקים
    const sweetBottles = Math.ceil(totalLiters / 1.5);
    const waterBottles = Math.ceil(((fr + sa + th) * 0.3) / 1.5); // מים קצת פחות
    const waterPacks = Math.ceil(waterBottles / 6);
    const sweetPacks = Math.ceil(sweetBottles / 6);

    // 4. עדכון הממשק
    safeSetText('resWater', `${waterBottles} בקבוקים (${waterPacks} שישיות)`);
    safeSetText('resSweetDrinks', `${sweetBottles} בקבוקים (${sweetPacks} שישיות)`);
}

async function addCalculatedDrinksToShopping() {
    const waterEl = document.getElementById('resWater');
    const sodasEl = document.getElementById('resSweetDrinks');

    const waterVal = waterEl ? waterEl.innerText : "0 בקבוקים";
    const sodasVal = sodasEl ? sodasEl.innerText : "0 בקבוקים";
    
    const itemsToAdd = [
        { title: `מים מינרליים מחושב: ${waterVal}`, category: 'drinks' },
        { title: `שתייה קלה ומוגזת מחושב: ${sodasVal}`, category: 'drinks' }
    ];
    
    for (const item of itemsToAdd) {
        const newItem = {
            id: 's_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            title: item.title,
            category: item.category,
            bought: false
        };
        
        shopping.push(newItem);
    }

    saveLocalState();
    renderShopping();

    // Cloud sync in background
    if (isCloudConnected && db) {
        for (const item of itemsToAdd) {
            const newItem = {
                id: 's_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title: item.title,
                category: item.category,
                bought: false
            };
            dbSet('shopping', newItem.id, newItem);
        }
    }
    showToast("כמויות השתייה המחושבות נוספו ישירות לרשימת הקניות שלכם!");
}

