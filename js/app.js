console.log("App is alive!");

const defaultTasks = [
    { id: "t1", title: "תיאום מול הגבאי: קבלת מפתח לביהכנ\"ס ליום שישי ובירור נטרול האזעקה", deadline: "2026-06-02", status: "todo", notes: "לצורך הצילומים לקליפ", category: "main", responsible: "נצר", createdAt: Date.now() - 3600000 * 24 },
    { id: "t2", title: "צילום של אמיתי בבית הכנסת ביום שישי בבוקר והעברת החומרים לאחותי לעריכה", deadline: "2026-06-05", status: "todo", notes: "אחותי צריכה את זה לעריכת הקליפ", category: "main", responsible: "נצר", createdAt: Date.now() - 3600000 * 23 },
    { id: "t3", title: "השלמת קניות בגדים, נעליים והתאמות לכל בני המשפחה", deadline: "2026-06-05", status: "todo", notes: "יעד סיום: שבוע לפני הבר מצווה", category: "main", responsible: "נעמה", createdAt: Date.now() - 3600000 * 20 },
    { id: "t4", title: "כתיבת ברכת ההורים לאמיתי", deadline: "2026-06-07", status: "todo", notes: "נצר + נעמה", category: "main", responsible: "משותף", createdAt: Date.now() - 3600000 * 18 },
    { id: "t5", title: "כתיבת השיר המיוחד לאירוע", deadline: "2026-06-08", status: "todo", notes: "", category: "main", responsible: "נעמה", createdAt: Date.now() - 3600000 * 15 },
    { id: "t6", title: "עריכה, עיצוב גרפי סופי ושליחה לדפוס של העלון המיוחד", deadline: "2026-06-06", status: "todo", notes: "", category: "main", responsible: "נעמה", createdAt: Date.now() - 3600000 * 12 },
    { id: "t7", title: "הכנה, עריכה והדפסה של חומרי חדר הבריחה (רמזים, כרטיסיות)", deadline: "2026-06-09", status: "todo", notes: "תוכן לאחת הארוחות", category: "main", responsible: "משותף", createdAt: Date.now() - 3600000 * 10 },
    { id: "t8", title: "חזרות ותרגול של אמיתי על דרשת בר המצווה שלו", deadline: "2026-06-11", status: "todo", notes: "לוודא שהוא מרגיש בנוח ובטוח", category: "main", responsible: "נצר", createdAt: Date.now() - 3600000 * 8 },
    { id: "t9", title: "מעקב הגעה ואיסוף של הזמירונים שהוזמנו", deadline: "2026-06-05", status: "todo", notes: "ישמשו גם כמזכרת לאורחים", category: "main", responsible: "נצר", createdAt: Date.now() - 3600000 * 6 },
    { id: "t10", title: "הכנת תוכנית חלוקת חדרים מוגדרת לאורחים בווילה", deadline: "2026-06-09", status: "todo", notes: "", category: "main", responsible: "נעמה", createdAt: Date.now() - 3600000 * 4 },
    { id: "t11", title: "חישוב כמויות מדויק של שתייה קלה וחריפה לפי מספר האורחים הסופי", deadline: "2026-06-08", status: "todo", notes: "לאולם, לווילה ולקידוש בביהכנ\"ס", category: "main", responsible: "נצר", createdAt: Date.now() - 3600000 * 2 },
    { id: "t12", title: "ביצוע רכישת קניות יבשות וכלים חד פעמיים (ראו לשונית קניות)", deadline: "2026-06-10", status: "todo", notes: "עדיף לבצע בתחילת השבוע כדי להוריד לחץ", category: "main", responsible: "משותף", createdAt: Date.now() - 3600000 * 1 },
    
    // עלון הדור Default tasks
    { id: "alon1", title: "איסוף ברכות, איחולים ותמונות מהמשפחה המורחבת עבור עלון הדור", deadline: "2026-06-05", status: "todo", notes: "לשלוח בקשה בקבוצת הווטסאפ המשפחתית", category: "alon", responsible: "נעמה", createdAt: Date.now() - 3600000 * 5 },
    { id: "alon2", title: "כתיבת טור אישי מרגש על ידי ההורים עבור עלון הדור", deadline: "2026-06-06", status: "todo", notes: "נצר ונעמה כותבים יחד", category: "alon", responsible: "משותף", createdAt: Date.now() - 3600000 * 3 },
    { id: "alon3", title: "בחירת קונספט עיצובי, עריכה ועימוד של הדפים בעלון", deadline: "2026-06-07", status: "todo", notes: "אפשר להשתמש בתוכנת Canva החינמית", category: "alon", responsible: "נעמה", createdAt: Date.now() - 3600000 * 2 },
    { id: "alon4", title: "הדפסת עלון הדור בבית דפוס בנתיבות ואיסוף העלונים", deadline: "2026-06-11", status: "todo", notes: "לתאם מול בית הדפוס מראש זמנים וכמויות", category: "alon", responsible: "נצר", createdAt: Date.now() - 3600000 * 1 }
];

const defaultShopping = [
    { id: "s1", title: "מפות שולחן, מפיות, צלחות (ראשונה, עיקרית, קינוח), קערות מרק/סלטים, סכו\"ם מלא, כוסות שתייה קלה/חמה", category: "disposable", bought: false },
    { id: "s2", title: "שתייה קלה מגוונת (קולה, דיאט, מיצים, מוגזים, מים)", category: "drinks", bought: false },
    { id: "s3", title: "מיץ ענבים / יין לקידוש", category: "drinks", bought: false },
    { id: "s4", title: "ערכת פינת קפה (קפה, תה, סוכר, סוכרזית, חלב/מלבין פרווה לאולם)", category: "drinks", bought: false },
    { id: "s5", title: "סוכריות לזריקה (סוג רך)", category: "synagogue", bought: false },
    { id: "s6", title: "סלסלות יפות להחזקת הסוכריות", category: "synagogue", bought: false },
    { id: "s7", title: "חטיפים בשקיות קטנות לילדים בקידוש", category: "synagogue", bought: false },
    { id: "s8", title: "אבטיחים ומלונים (לקנות קרוב לשבת)", category: "dessert", bought: false, isFresh: true },
    { id: "s9", title: "קרטיבים טבעיים", category: "dessert", bought: false, isFresh: true },
    { id: "s10", title: "קוגלים לקידוש בבית הכנסת", category: "dessert", bought: false, isFresh: true },
    { id: "s11", title: "כיבוד קל, עוגות יבשות ושתייה למתחם הלינה של האורחים בווילה", category: "villa", bought: false }
];

const defaultCalls = [
    { id: "c1", title: "🔌 בירור לוגיסטי מול הווילה", subtitle: "שעוני שבת, מזגנים, פלטה ומיחם", notes: "", done: false },
    { id: "c2", title: "☕ בירור טכני מול אולם \"דעני לחנניה\"", subtitle: "לוודא שיש מיחם מים חמים גדול לשבת בנוסף לפלטות והמקררים", notes: "", done: false },
    { id: "c3", title: "🎬 ציוד מדיה לקבלת פנים (שישי אחה\"צ)", subtitle: "לוודא זמינות מקרן, מסך ומערכת סאונד תקינה להקרנת הקליפ", notes: "", done: false },
    { id: "c4", title: "🤵 תיאום מול הרב-מלצרים", subtitle: "לוודא שהוא והצוות אחראים על קבלת האוכל, ארגונו וחימומו לאורך השבת", notes: "", done: false },
    { id: "c5", title: "🕌 תיאום מול גבאי בית הכנסת", subtitle: "סגירת חזנים, עליות לתורה לאורחים, ותזמון דבר התורה של אמיתי", notes: "", done: false },
    { id: "c6", title: "📸 סגירת פונקציית צילום לשישי אחה\"צ", subtitle: "להחליט האם שוכרים צלם לשעה של קבלת הפנים או שממנים בן משפחה", notes: "", done: false }
];

// Default Villa Rooms
const defaultRooms = [
    { id: "r1", name: "סוויטה ראשית בוילה (מיטה זוגית)", capacity: 2, guests: ["סבא אורי", "סבתא חנה"] },
    { id: "r2", name: "חדר אירוח כחול (מיטה זוגית + מזרן)", capacity: 3, guests: [] },
    { id: "r3", name: "חדר ילדים וילה (3 מיטות יחיד)", capacity: 3, guests: [] },
    { id: "r4", name: "גלריית מזרני רצפה בוילה", capacity: 6, guests: [] }
];




let tasks = JSON.parse(localStorage.getItem('bm_tasks')) || defaultTasks;
let shopping = JSON.parse(localStorage.getItem('bm_shopping')) || defaultShopping;
let calls = JSON.parse(localStorage.getItem('bm_calls')) || defaultCalls;
let rooms = JSON.parse(localStorage.getItem('bm_rooms')) || defaultRooms;
let externalLocations = JSON.parse(localStorage.getItem('bm_externalLocations')) || [];
let rsvps = JSON.parse(localStorage.getItem('bm_rsvps')) || [];
let budget = JSON.parse(localStorage.getItem('bm_budget')) || [];
let logistics = JSON.parse(localStorage.getItem('bm_logistics')) || [];
let menu = JSON.parse(localStorage.getItem('bm_menu')) || [];
let currentMenuFilter = 'הכל';
let editingMenuId = null;
let schedule = JSON.parse(localStorage.getItem('bm_schedule')) || [];
let editingScheduleId = null;
let currentLogisticsFilter = 'all';
let currentTab = 'tasks';
let currentWaText = '';
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
        'bm_schedule': schedule,
        'bm_externalLocations': externalLocations
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
    const dietaryEl = document.getElementById('rsvpDietary');
    const dietary = dietaryEl ? dietaryEl.value : '';

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
        meals: mealsSelected,
        dietary: dietary
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
    if (dietaryEl) dietaryEl.value = '';

    showToast("האורח נרשם בהצלחה!");
}

async function deleteRsvp(guestId) {
    if (!confirm("למחוק את רישום האורח לצמיתות?")) return;
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

    // Cloud sync — use same items that were added locally
    if (isCloudConnected && db) {
        shopping.slice(-itemsToAdd.length).forEach(item => {
            dbSet('shopping', item.id, item);
        });
    }
    showToast("כמויות השתייה המחושבות נוספו ישירות לרשימת הקניות שלכם!");
}

async function addNewTask() {
    const titleEl = document.getElementById('newTaskTitle');
    const deadlineEl = document.getElementById('newTaskDeadline');
    const respEl = document.getElementById('newTaskResponsible');
    
    if (!titleEl) return;
    const title = titleEl.value.trim();
    const deadline = deadlineEl ? deadlineEl.value : '2026-06-12';
    const responsible = respEl ? respEl.value : 'לא הוגדר';

    if (!title) {
        showToast("יש להזין שם למשימה!");
        return;
    }

    const newTask = {
        id: 't_' + Date.now(),
        title: title,
        deadline: deadline,
        status: 'todo',
        notes: '',
        category: 'main',
        responsible: responsible,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    // Immediate local update
    tasks.push(newTask);
    saveLocalState();
    renderTasks();
    renderRecentTasks();

    if (isCloudConnected && db) {
        dbSet('tasks', newTask.id, newTask);
    }

    // --- כאן השינוי: איפוס כל השדות ---
    titleEl.value = "";
    if (respEl) respEl.value = "לא הוגדר";
    if (deadlineEl) deadlineEl.value = "2026-06-12"; // מחזיר לברירת המחדל
    
    showToast("המשימה נוספה בהצלחה!");
}

async function updateTaskStatus(taskId, newStatus) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        tasks[index].status = newStatus;
        tasks[index].updatedAt = Date.now();
        saveLocalState();
        renderTasks();
        renderRecentTasks();
    }

    if (isCloudConnected && db) {
        dbUpdate('tasks', taskId, { status: newStatus, updatedAt: Date.now() });
    }
}

async function deleteTask(taskId) {
    if (!confirm("למחוק את המשימה לצמיתות?")) return;
    tasks = tasks.filter(t => t.id !== taskId);
    saveLocalState();
    renderTasks();
    renderRecentTasks();

    if (isCloudConnected && db) {
        dbDelete('tasks', taskId);
    }
    showToast("המשימה נמחקה");
}

function startEditTask(taskId) {
    editingTaskId = taskId;
    renderTasks();
}

function cancelEditTask() {
    editingTaskId = null;
    renderTasks();
}

async function saveEditTask(taskId, category) {
    const titleInput = document.getElementById(`editTitle_${taskId}`);
    const responsibleInput = document.getElementById(`editResponsible_${taskId}`);
    const notesInput = document.getElementById(`editNotes_${taskId}`);
    
    const title = titleInput ? titleInput.value.trim() : "";
    const responsible = responsibleInput ? responsibleInput.value : "לא הוגדר";
    const notes = notesInput ? notesInput.value.trim() : "";

    if (!title) {
        showToast("כותרת המשימה אינה יכולה להיות ריקה!");
        return;
    }

    let updateData = {
        title: title,
        responsible: responsible,
        notes: notes,
        updatedAt: Date.now()
    };

    if (category === 'main') {
        const deadlineInput = document.getElementById(`editDeadline_${taskId}`);
        if (deadlineInput) {
            updateData.deadline = deadlineInput.value;
        }
    } else {
        const existingTask = tasks.find(t => t.id === taskId);
        updateData.deadline = existingTask ? (existingTask.deadline || "2026-06-11") : "2026-06-11";
    }

    // 1. Optimistic Update (Immediate Feedback to prevent interface freezes)
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updateData };
        saveLocalState();
    }

    // 2. Instantly Close the Edit Form and Re-render Local UI
    editingTaskId = null;
    renderTasks();
    showToast("המשימה עודכנה בהצלחה!");

    // 3. Trigger Firestore update asynchronously in background (No await / No blocking!)
    if (isCloudConnected && db) {
        dbUpdate('tasks', taskId, updateData);
    }
}

async function addNewShopItem() {
    const titleEl = document.getElementById('newShopTitle');
    const catEl = document.getElementById('newShopCategory');
    if (!titleEl) return;

    const title = titleEl.value.trim();
    const category = catEl ? catEl.value : 'drinks';

    if (!title) {
        showToast("יש להזין שם למוצר!");
        return;
    }

    const isFreshEl = document.getElementById('newShopIsFresh');
    const newItem = {
        id: 's_' + Date.now(),
        title: title,
        category: category,
        bought: false,
        isFresh: isFreshEl ? isFreshEl.checked : false
    };

    shopping.push(newItem);
    saveLocalState();
    renderShopping();

    if (isCloudConnected && db) {
        dbSet('shopping', newItem.id, newItem);
    }

    titleEl.value = "";
    if (isFreshEl) isFreshEl.checked = false;
    showToast("המוצר נוסף לסל!");
}

async function toggleShopItemFresh(itemId) {
    const index = shopping.findIndex(s => s.id === itemId);
    if (index !== -1) {
        shopping[index].isFresh = !shopping[index].isFresh;
        saveLocalState();
        renderShopping();
        if (isCloudConnected && db) {
            dbUpdate('shopping', itemId, { isFresh: shopping[index].isFresh });
        }
    }
}

async function toggleShopItem(itemId) {
    const index = shopping.findIndex(s => s.id === itemId);
    if (index !== -1) {
        const newStatus = !shopping[index].bought;
        shopping[index].bought = newStatus;
        if (newStatus) shopping[index].boughtAt = Date.now();
        saveLocalState();
        renderShopping();

        if (isCloudConnected && db) {
            dbUpdate('shopping', itemId, { bought: newStatus });
        }
    }
}

async function deleteShopItem(itemId) {
    if (!confirm("למחוק את הפריט מרשימת הקניות?")) return;
    shopping = shopping.filter(s => s.id !== itemId);
    saveLocalState();
    renderShopping();

    if (isCloudConnected && db) {
        dbDelete('shopping', itemId);
    }
    showToast("המוצר נמחק");
}

let _shoppingExportText = '';
let _budgetExportCsv = '';

function exportShoppingList() {
    const categories = {
        'disposable': '🍽️ כלים חד פעמיים',
        'drinks': '🥤 שתייה וקפה',
        'synagogue': '⛪ בית הכנסת',
        'dessert': '🍰 קינוחים ואוכל משלים',
        'villa': '🏡 אירוח בוילה'
    };

    const remaining = shopping.filter(s => !s.bought);

    if (remaining.length === 0) {
        showToast('כל הפריטים כבר נרכשו! 🎉');
        return;
    }

    const modal = document.getElementById('shoppingExportModal');
    const content = document.getElementById('shoppingExportContent');
    if (!modal || !content) return;

    let html = '';
    _shoppingExportText = `🛒 רשימת קניות — נשאר לקנות\n`;
    _shoppingExportText += `═══════════════════════\n\n`;

    Object.keys(categories).forEach(catKey => {
        const catItems = remaining.filter(s => s.category === catKey);
        if (catItems.length === 0) return;

        html += `<div class="bg-slate-50 rounded-xl p-3">
            <div class="font-bold text-slate-700 mb-2 text-sm">${categories[catKey]}</div>
            <ul class="space-y-1.5">
                ${catItems.map(item => `<li class="flex items-start gap-2 text-sm text-slate-600"><span class="text-slate-400 shrink-0">•</span><span>${item.title}</span></li>`).join('')}
            </ul>
        </div>`;

        _shoppingExportText += `${categories[catKey]}\n`;
        catItems.forEach(item => {
            _shoppingExportText += `  • ${item.title}\n`;
        });
        _shoppingExportText += '\n';
    });

    _shoppingExportText += `───────────────────────\n`;
    _shoppingExportText += `סה"כ נשאר: ${remaining.length} פריטים`;

    html += `<div class="text-xs text-slate-400 text-center pt-1">סה"כ נשאר: ${remaining.length} פריטים לקנייה</div>`;

    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function copyShoppingExport() {
    if (!_shoppingExportText) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(_shoppingExportText).then(() => showToast('הרשימה הועתקה! 📋'));
    } else {
        showToast('לא ניתן להעתיק בדפדפן זה');
    }
}

function shareShoppingExport() {
    if (!_shoppingExportText) return;
    if (navigator.share) {
        navigator.share({
            title: 'רשימת קניות — בר המצווה של אמיתי',
            text: _shoppingExportText
        });
    } else {
        copyShoppingExport();
    }
}

function exportBudgetToGoogleSheets() {
    if (budget.length === 0) {
        showToast('אין הוצאות לייצוא עדיין');
        return;
    }

    const currentMax = typeof maxBudget !== 'undefined' ? maxBudget : 33000;
    let totalExpenses = 0;
    let totalPaid = 0;

    budget.forEach(exp => {
        totalExpenses += (exp.totalAmount || 0);
        totalPaid += (exp.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    });

    const today = new Date().toLocaleDateString('he-IL');

    const rows = [];
    rows.push(['סיכום תקציב — בר המצווה של אמיתי']);
    rows.push(['תאריך ייצוא:', today]);
    rows.push([]);
    rows.push(['מדד', 'ערך (₪)']);
    rows.push(['יעד תקציב', currentMax]);
    rows.push(['סה"כ הוצאות', totalExpenses]);
    rows.push(['שולם בפועל', totalPaid]);
    rows.push(['נותר לספקים', totalExpenses - totalPaid]);
    rows.push(['פנוי לתכנון', Math.max(0, currentMax - totalExpenses)]);
    rows.push([]);
    rows.push([]);
    rows.push(['פירוט הוצאות']);
    rows.push(['שם הוצאה', 'סה"כ מתוכנן (₪)', 'שולם (₪)', 'נותר לספק (₪)', 'תאריך תשלום', 'אמצעי תשלום', 'סכום תשלום (₪)']);

    budget.forEach(exp => {
        const expPaid = (exp.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = (exp.totalAmount || 0) - expPaid;
        const payments = exp.payments || [];

        if (payments.length === 0) {
            rows.push([exp.name || '', exp.totalAmount || 0, 0, remaining, '', '', '']);
        } else {
            payments.forEach((p, i) => {
                if (i === 0) {
                    rows.push([exp.name || '', exp.totalAmount || 0, expPaid, remaining, p.date || '', p.method || '', p.amount || 0]);
                } else {
                    rows.push(['', '', '', '', p.date || '', p.method || '', p.amount || 0]);
                }
            });
        }
    });

    const csvContent = rows.map(row =>
        row.map(cell => {
            const str = String(cell);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }).join(',')
    ).join('\n');

    _budgetExportCsv = '﻿' + csvContent;

    // Build HTML preview for the modal
    const modal = document.getElementById('budgetExportModal');
    const preview = document.getElementById('budgetExportPreview');
    if (!modal || !preview) return;

    let html = `
        <div class="bg-indigo-50 rounded-xl p-3 text-xs space-y-1">
            <div class="font-bold text-indigo-800 text-sm mb-2">📊 סיכום תקציב</div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                <span class="text-slate-500">יעד תקציב:</span><span class="font-bold text-slate-800">${currentMax.toLocaleString()} ₪</span>
                <span class="text-slate-500">סה"כ הוצאות:</span><span class="font-bold text-rose-700">${totalExpenses.toLocaleString()} ₪</span>
                <span class="text-slate-500">שולם בפועל:</span><span class="font-bold text-emerald-700">${totalPaid.toLocaleString()} ₪</span>
                <span class="text-slate-500">נותר לספקים:</span><span class="font-bold text-amber-700">${(totalExpenses - totalPaid).toLocaleString()} ₪</span>
                <span class="text-slate-500">פנוי לתכנון:</span><span class="font-bold text-slate-700">${Math.max(0, currentMax - totalExpenses).toLocaleString()} ₪</span>
            </div>
        </div>
        <div class="mt-3">
            <div class="font-bold text-slate-700 text-xs mb-2">פירוט הוצאות (${budget.length} פריטים)</div>
            <div class="overflow-x-auto rounded-xl border border-slate-100">
                <table class="w-full text-[11px]">
                    <thead class="bg-slate-100 text-slate-600 font-bold">
                        <tr>
                            <th class="p-2 text-right">שם הוצאה</th>
                            <th class="p-2 text-center">סה"כ</th>
                            <th class="p-2 text-center">שולם</th>
                            <th class="p-2 text-center">נותר</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">`;

    budget.forEach(exp => {
        const expPaid = (exp.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = (exp.totalAmount || 0) - expPaid;
        html += `<tr class="even:bg-slate-50">
            <td class="p-2 font-semibold text-slate-800">${esc(exp.name || '')}</td>
            <td class="p-2 text-center text-slate-700">${(exp.totalAmount || 0).toLocaleString()}</td>
            <td class="p-2 text-center text-emerald-700 font-bold">${expPaid.toLocaleString()}</td>
            <td class="p-2 text-center ${remaining > 0 ? 'text-amber-600' : 'text-emerald-600'} font-bold">${remaining.toLocaleString()}</td>
        </tr>`;
    });

    html += `</tbody></table></div></div>`;
    preview.innerHTML = html;
    modal.classList.remove('hidden');
}

function downloadBudgetCsv() {
    if (!_budgetExportCsv) return;
    const blob = new Blob([_budgetExportCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `תקציב_בר_מצוות_אמיתי_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('קובץ CSV הורד! ניתן לפתוח ב-Google Sheets 📥');
}

function copyBudgetExport() {
    if (!_budgetExportCsv) return;
    const text = _budgetExportCsv.replace(/^﻿/, '');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('הנתונים הועתקו! הדבק ב-Google Sheets 📋'));
    } else {
        showToast('לא ניתן להעתיק בדפדפן זה');
    }
}

async function addGuestToRoom(roomId) {
    const inputElement = document.getElementById(`guestInput_${roomId}`);
    if (!inputElement) return;
    const guestName = inputElement.value.trim();

    if (!guestName) {
        showToast("יש להזין שם אורח!");
        return;
    }

    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
        const currentGuests = rooms[roomIndex].guests || [];
        const capacity = parseInt(rooms[roomIndex].capacity) || 1;

        if (currentGuests.length >= capacity) {
            showToast("אזהרה: החדר כבר בתפוסה מלאה! משבצים בכל זאת.");
        }

        const updatedGuests = [...currentGuests, guestName];
        
        rooms[roomIndex].guests = updatedGuests;
        saveLocalState();
        renderRooms();

        if (isCloudConnected && db) {
            dbUpdate('rooms', roomId, { guests: updatedGuests });
        }

        inputElement.value = "";
        showToast(`${guestName} שובץ בהצלחה בחדר!`);
    }
}

async function removeGuestFromRoom(roomId, guestIndex) {
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
        const updatedGuests = [...rooms[roomIndex].guests];
        const removedGuest = updatedGuests.splice(guestIndex, 1)[0];

        rooms[roomIndex].guests = updatedGuests;
        saveLocalState();
        renderRooms();

        if (isCloudConnected && db) {
            dbUpdate('rooms', roomId, { guests: updatedGuests });
        }
        showToast(`שובוץ האורח ${removedGuest} בוטל.`);
    }
}

async function addNewRoom() {
    const nameEl = document.getElementById('newRoomName');
    const capEl = document.getElementById('newRoomCapacity');
    if (!nameEl) return;

    const name = nameEl.value.trim();
    const capacityVal = capEl ? (parseInt(capEl.value) || 1) : 1;

    if (!name) {
        showToast("יש להזין שם לחדר!");
        return;
    }

    const newRoom = {
        id: 'r_' + Date.now(),
        name: name,
        capacity: capacityVal,
        guests: []
    };

    rooms.push(newRoom);
    saveLocalState();
    renderRooms();

    if (isCloudConnected && db) {
        dbSet('rooms', newRoom.id, newRoom);
    }

    nameEl.value = "";
    if (capEl) capEl.value = "";
    showToast("חדר חדש נוסף בהצלחה לרשימת הוילה!");
}

// Delete Room (Fixed and Robustified)
async function deleteRoom(roomId) {
    if (!confirm("למחוק את החדר לצמיתות?")) return;
    rooms = rooms.filter(r => r.id !== roomId);
    saveLocalState();
    renderRooms();

    if (isCloudConnected && db) {
        dbDelete('rooms', roomId);
    }
    showToast("החדר הוסר מרשימת הוילה");
}

async function toggleCallDone(callId) {
    const index = calls.findIndex(c => c.id === callId);
    if (index !== -1) {
        const newStatus = !calls[index].done;
        calls[index].done = newStatus;
        if (newStatus) calls[index].closedAt = Date.now();
        saveLocalState();
        renderCalls();

        if (isCloudConnected && db) {
            dbUpdate('calls', callId, { done: newStatus });
        }
    }
}

// Update Call notes
async function updateCallNotes(callId, notesText) {
    const index = calls.findIndex(c => c.id === callId);
    if (index !== -1) {
        calls[index].notes = notesText;
        saveLocalState();
        renderCalls();

        if (isCloudConnected && db) {
            dbUpdate('calls', callId, { notes: notesText });
        }
    }
}


async function addNewCall() {
    const titleEl = document.getElementById('newCallTitle');
    const subtitleEl = document.getElementById('newCallSubtitle');
    const phoneEl = document.getElementById('newCallPhone');
    if (!titleEl) return;
    const title = titleEl.value.trim();
    if (!title) { showToast("נא להזין שם לבירור!"); return; }

    const newCall = {
        id: 'c_' + Date.now(),
        title: title,
        subtitle: subtitleEl ? subtitleEl.value.trim() : '',
        phone: phoneEl ? phoneEl.value.trim() : '',
        notes: '',
        done: false
    };

    calls.push(newCall);
    saveLocalState();
    renderCalls();
    if (isCloudConnected && db) dbSet('calls', newCall.id, newCall);

    titleEl.value = '';
    if (subtitleEl) subtitleEl.value = '';
    if (phoneEl) phoneEl.value = '';
    showToast("הבירור נוסף בהצלחה!");
}

// Delete Call card
async function deleteCall(callId) {
    if (!confirm("למחוק את הבירור לצמיתות?")) return;
    calls = calls.filter(c => c.id !== callId);
    saveLocalState();
    renderCalls();

    if (isCloudConnected && db) {
        dbDelete('calls', callId);
    }
    showToast("הכרטיסייה נמחקה");
}

async function addNewExpense() {
    const name = document.getElementById('newExpName').value.trim();
    const pricePerUnit = parseFloat(document.getElementById('newExpPricePerUnit').value) || 0;
    const qty = parseFloat(document.getElementById('newExpQty').value) || 1;
    const paid = parseFloat(document.getElementById('newExpPaid').value) || 0;
    const method = document.getElementById('newExpMethod').value.trim() || "לא צוין";
    const date = document.getElementById('newExpDate').value || new Date().toISOString().split('T')[0];

    if (!name || pricePerUnit <= 0) {
        showToast("אנא מלא שם הוצאה ומחיר ליחידה!");
        return;
    }

    const totalAmount = pricePerUnit * qty;

    const newExpense = {
        id: 'exp_' + Date.now(),
        name: name,
        totalAmount: totalAmount,
        createdAt: Date.now(),
        // רשימת תתי-תשלומים כפי שביקשת
        payments: [{ 
            amount: paid, 
            method: method, 
            date: date 
        }]
    };

    budget.push(newExpense);
    saveLocalState();
    renderBudget();

    if (isCloudConnected && db) {
        dbSet('budget', newExpense.id, newExpense);
    }

    // איפוס שדות
    document.getElementById('newExpName').value = "";
    document.getElementById('newExpPricePerUnit').value = "";
    document.getElementById('newExpQty').value = "";
    document.getElementById('newExpPaid').value = "";
    document.getElementById('newExpMethod').value = "";
    document.getElementById('newExpDate').value = "";
    
    showToast("ההוצאה נוספה בהצלחה!");
}

function addPaymentToExpense(expId) {
    // Show inline payment form below the expense
    const existing = document.getElementById('paymentForm-' + expId);
    if (existing) { existing.remove(); return; }
    const container = document.querySelector(`[data-exp-id="${expId}"]`);
    if (!container) return;
    const today = new Date().toISOString().split('T')[0];
    const formHtml = `
        <div id="paymentForm-${expId}" class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mt-2 space-y-2">
            <div class="text-xs font-bold text-indigo-800 mb-1">➕ הוספת תשלום</div>
            <div class="grid grid-cols-3 gap-2">
                <input type="number" id="payAmt-${expId}" placeholder="סכום ₪" class="p-1.5 border rounded-lg text-xs text-center focus:ring-1 focus:ring-indigo-400 focus:outline-none">
                <select id="payMethod-${expId}" class="p-1.5 border rounded-lg text-xs bg-white focus:outline-none">
                    <option>מזומן</option>
                    <option>העברה</option>
                    <option>אשראי</option>
                </select>
                <input type="date" id="payDate-${expId}" value="${today}" class="p-1.5 border rounded-lg text-xs focus:outline-none">
            </div>
            <div class="flex gap-2 justify-end">
                <button onclick="document.getElementById('paymentForm-${expId}').remove()" class="text-xs text-slate-500 hover:text-slate-700 font-bold px-3 py-1 rounded-lg bg-slate-100">ביטול</button>
                <button onclick="savePayment('${expId}')" class="text-xs text-white font-bold px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700">שמור תשלום</button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', formHtml);
}

async function savePayment(expId) {
    const amount = parseFloat(document.getElementById('payAmt-' + expId)?.value);
    const method = document.getElementById('payMethod-' + expId)?.value || 'לא צוין';
    const date = document.getElementById('payDate-' + expId)?.value || new Date().toISOString().split('T')[0];
    if (!amount || isNaN(amount)) { showToast("נא להזין סכום תקין!"); return; }
    const exp = budget.find(e => e.id === expId);
    if (exp) {
        exp.payments.push({ amount, method, date });
        saveLocalState();
        renderBudget();
        if (isCloudConnected && db) dbUpdate('budget', expId, { payments: exp.payments });
        showToast("תשלום נוסף בהצלחה! ✅");
    }
}

async function toggleExpensePaid(expId) {
    const index = budget.findIndex(e => e.id === expId);
    if (index !== -1) {
        const newStatus = !budget[index].paid;
        budget[index].paid = newStatus;
        saveLocalState();
        renderBudget();

        if (isCloudConnected && db) {
            dbUpdate('budget', expId, { paid: newStatus });
        }
    }
}

async function deleteExpense(expId) {
    if (!confirm("למחוק את ההוצאה לצמיתות?")) return;
    budget = budget.filter(e => e.id !== expId);
    saveLocalState();
    renderBudget();

    if (isCloudConnected && db) {
        dbDelete('budget', expId);
    }
    showToast("ההוצאה נמחקה");
}

async function addNewLogisticsKit() {
    const nameEl = document.getElementById('newLogName');
    const destEl = document.getElementById('newLogDest');
    
    const name = nameEl.value.trim();
    const dest = destEl.value;
    
    if(!name) {
        showToast("אנא הזן שם לערכה!");
        return;
    }
    
    const newKit = { id: 'l_'+Date.now(), name, destination: dest, items: [], packed: false };
    
    logistics.push(newKit);
    saveLocalState();
    renderLogistics('all');

    // 1. איפוס שדה השם
    nameEl.value = "";
    
    // 2. החזרת הפוקוס לשדה השם כדי שתוכל להקליד את הערכה הבאה מיד
    nameEl.focus();

    // הוספה לענן
    if (isCloudConnected && db) {
        dbSet('logistics', newKit.id, newKit);
    }
}

async function addLogItem(logId) {
    const name = prompt("שם הפריט:");
    if(name) {
        const log = logistics.find(l => l.id === logId);
        log.items.push({ name, checked: false });
        saveLocalState();
        renderLogistics();
        
        // עדכון בענן
        if (isCloudConnected && db) {
            dbUpdate('logistics', logId, { items: log.items });
        }
    }
}

function toggleLogItem(logId, itemIdx) {
    const log = logistics.find(l => l.id === logId);
    log.items[itemIdx].checked = !log.items[itemIdx].checked;
    saveLocalState();
    if (isCloudConnected && db) dbUpdate('logistics', logId, { items: log.items });
}

async function deleteLogisticsKit(logId) {
    if (confirm("האם למחוק את כל הערכה הזו?")) {
        logistics = logistics.filter(l => l.id !== logId);
        saveLocalState();
        renderLogistics();
        
        if (isCloudConnected && db) {
            dbDelete('logistics', logId);
        }
    }
}

function editLogName(logId) {
    const log = logistics.find(l => l.id === logId);
    const nameEl = document.getElementById('logname-' + logId);
    if (!nameEl) return;
    const currentName = log.name;
    nameEl.innerHTML = `
        <input type="text" id="logNameInput-${logId}" value="${currentName}" 
            class="border border-indigo-300 rounded px-2 py-0.5 text-sm font-bold w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
            onkeydown="if(event.key==='Enter') saveLogName('${logId}'); if(event.key==='Escape') renderLogistics(currentLogisticsFilter);">
        <button onclick="saveLogName('${logId}')" class="text-[10px] text-indigo-600 font-bold mt-1">שמור</button>
    `;
    setTimeout(() => {
        const input = document.getElementById('logNameInput-' + logId);
        if (input) { input.focus(); input.select(); }
    }, 50);
}

function saveLogName(logId) {
    const input = document.getElementById('logNameInput-' + logId);
    if (!input) return;
    const newName = input.value.trim();
    if (!newName) return;
    const log = logistics.find(l => l.id === logId);
    if (log) {
        log.name = newName;
        saveLocalState();
        if (isCloudConnected && db) dbUpdate('logistics', logId, { name: newName });
        renderLogistics(currentLogisticsFilter);
    }
}

async function deleteLogItem(logId, itemIdx) {
    const log = logistics.find(l => l.id === logId);
    log.items.splice(itemIdx, 1);
    saveLocalState();
    renderLogistics();

    if (isCloudConnected && db) dbUpdate('logistics', logId, { items: log.items });
}

async function addLogItemInline(logId) {
    const input = document.getElementById(`input_${logId}`);
    const name = input.value.trim();
    
    if(name) {
        const log = logistics.find(l => l.id === logId);
        log.items.push({ name, checked: false });
        
        // 1. ניקוי השדה
        input.value = ""; 
        
        // 2. שמירה ורינדור
        saveLocalState();
        renderLogistics();
        
        // 3. החזרת הפוקוס לשדה הקלט הספציפי של הכרטיסייה הזו
        // אנחנו צריכים לתת זמן קצר לרינדור להסתיים לפני שמחזירים את הפוקוס
        setTimeout(() => {
            const nextInput = document.getElementById(`input_${logId}`);
            if (nextInput) {
                nextInput.focus();
            }
        }, 50); // השהייה קלה כדי לוודא שהאלמנט קיים ב-DOM
        
        // סנכרון לענן
        if (isCloudConnected && db) {
            dbUpdate('logistics', logId, { items: log.items });
        }
    }
}

async function toggleKitPacked(logId) {
    const log = logistics.find(l => l.id === logId);
    log.packed = !log.packed;
    saveLocalState();
    renderLogistics();
    if (isCloudConnected && db) dbUpdate('logistics', logId, { packed: log.packed });
}

async function addNewMenuItem() {
    const nameEl = document.getElementById('newMenuName');
    const mealEl = document.getElementById('newMenuMeal');
    const catEl = document.getElementById('newMenuCat');
    const vegEl = document.getElementById('tagVegan');
    const glutEl = document.getElementById('tagGluten');

    if (!nameEl.value.trim()) {
        showToast("נא להזין שם למנה!");
        return;
    }

    const item = {
        id: 'm_' + Date.now(),
        name: nameEl.value.trim(),
        meal: mealEl.value,
        cat: catEl.value,
        vegan: vegEl.checked,
        gluten: glutEl.checked
    };
    
    // 1. הוספה למערך המקומי
    menu.push(item);
    
    // 2. שמירה מקומית
    saveLocalState();
    
    // 3. עדכון ענן (Firebase)
    if (isCloudConnected && db) {
        dbSet('menu', item.id, item);
    }
    
    // 4. רענון המסך
    renderMenu();

    // ניקוי שדות
    nameEl.value = "";
    vegEl.checked = false;
    glutEl.checked = false;
    mealEl.selectedIndex = 0;
    catEl.selectedIndex = 0;
    
    showToast("המנה נוספה לתפריט בהצלחה!");
}

async function deleteMenuItem(id) {
    // 1. מחיקה מהמערך המקומי
    menu = menu.filter(m => m.id !== id);
    
    // 2. שמירה מקומית (LocalStorage)
    saveLocalState();
    
    // 3. עדכון ענן (Firebase) - הפקודה הזו הייתה חסרה!
    if (isCloudConnected && db) {
        dbDelete('menu', id);
    }
    
    // 4. רינדור מחדש של המסך
    renderMenu();
    
    showToast("המנה נמחקה מהתפריט");
}

function filterMenu(filter) {
    currentMenuFilter = filter;
    renderMenu();
}

function filterLogistics(filter) {
    currentLogisticsFilter = filter;
    renderLogistics(filter);
    // Update active button styles
    ['all','וילה','אולם','בית כנסת'].forEach(f => {
        const btn = document.getElementById('logFilter-' + f);
        if (btn) {
            btn.className = f === filter
                ? 'bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold'
                : 'bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs';
        }
    });
}

function editMenuItem(id) {
    editingMenuId = id;
    renderMenu();
}

function saveEditMenu(id) {
    const item = menu.find(m => m.id === id);
    
    // 1. עדכון הערכים במערך המקומי
    item.name = document.getElementById('editMenuName').value;
    item.cat = document.getElementById('editMenuCat').value;
    
    // 2. שמירה מקומית (LocalStorage)
    saveLocalState();
    
    // 3. עדכון ענן (Firebase) - זה היה חסר!
    if (isCloudConnected && db) {
        dbUpdate('menu', id, item);
    }
    
    // 4. יציאה ממצב עריכה ורינדור מחדש
    editingMenuId = null;
    renderMenu();
    
    showToast("המנה עודכנה בהצלחה!");
}

async function addNewScheduleItem() {
    const titleEl = document.getElementById('schTitle');
    const speakerEl = document.getElementById('schSpeaker');

    // בדיקה מעודכנת לפי השדות החדשים ב-HTML
    if (!titleEl.value.trim()) {
        showToast("נא להזין שם פעילות!"); return;
    }

    const item = {
        id: 'sch_' + Date.now(),
        title: titleEl.value.trim(),
        speaker: speakerEl.value ? speakerEl.value.trim() : "",
        day: "",      // שדה ריק כי הגרירה תקבע את היום
        time: "",     // שדה ריק כי הגרירה תקבע את השעה
        overlap: false
    };
    
    // 1. הוספה למערך המקומי
    schedule.push(item);
    
    // 2. שמירה מקומית (LocalStorage)
    saveLocalState();
    
    // 3. רינדור למסך (הפונקציה הזו תצייר את הפעילות בבנק)
    renderSchedule();

    // 4. הוספה לענן (Firebase)
    if (isCloudConnected && db) {
        dbSet('schedule', item.id, item);
    }
    
    // ניקוי שדות
    titleEl.value = "";
    speakerEl.value = "";
    
    showToast("הפעילות נוספה לבנק בהצלחה!");
}


async function deleteScheduleItem(id) {
    // 1. מחיקה מהמערך המקומי
    schedule = schedule.filter(s => s.id !== id);
    
    // 2. שמירה ל-LocalStorage (כדי שיישמר למכשיר הזה)
    saveLocalState();
    
    // 3. רינדור מחדש של המסך
    renderSchedule();
    
    // 4. מחיקה מהענן (זה מה שחסר לך!)
    if (isCloudConnected && db) {
        dbDelete('schedule', id);
    }
    
    showToast("הפעילות נמחקה בהצלחה");
}

function editScheduleItem(id) {
    editingScheduleId = id;
    renderSchedule();
}

function saveEditSchedule(id) {
    const item = schedule.find(s => s.id === id);
    item.title = document.getElementById('editSchTitle').value;
    item.day = document.getElementById('editSchDay').value;
    item.time = document.getElementById('editSchTime').value;
    item.speaker = document.getElementById('editSchSpeaker').value;
    
    editingScheduleId = null;
    saveLocalState();
    renderSchedule();
    
    // סנכרון לענן
    if (isCloudConnected && db) dbUpdate('schedule', id, item);
}

function populateTimeOptions() {
    const select = document.getElementById('schTime');
    if (!select) return;

    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            const time = `${h}:${m}`;
            
            const option = document.createElement('option');
            option.value = time;
            option.text = time; // זה מה שהמשתמש יראה
            select.appendChild(option);
        }
    }
}

function saveAndConnectFirebase() {
    const configInput = document.getElementById('firebaseConfigInput');
    const appIdInput = document.getElementById('appIdInput');
    if (!configInput || !appIdInput) return;

    const configText = configInput.value.trim();
    const inputAppId = appIdInput.value.trim();

    if (!configText) {
        showToast("יש להזין קונפיגורציית Firebase תקינה!");
        return;
    }

    if (!inputAppId) {
        showToast("יש להזין מזהה פרויקט תקין!");
        return;
    }

    const parsedConfig = parseFirebaseConfig(configText);

    if (parsedConfig) {
        appId = inputAppId;
        localStorage.setItem('bm_appId', appId);
        localStorage.setItem('bm_firebaseConfig', JSON.stringify(parsedConfig));
        
        connectToFirebase(parsedConfig);
    } else {
        showToast("שגיאה בפענוח ההגדרות. ודאו שהעתקתם את קוד הקונפיגורציה הנכון שקיבלתם מגוגל.");
    }
}

window.onload = function() {
    console.log("Window loaded - starting render...");
    try {
        // Initialize renders defensively
        try { renderTasks(); console.log("Tasks rendered!");} catch(e) { console.error("Error rendering tasks on boot:", e); }
        try { renderShopping(); } catch(e) { console.error("Error rendering shopping on boot:", e); }
        try { renderCalls(); } catch(e) { console.error("Error rendering calls on boot:", e); }
        try { renderRsvps(); } catch(e) { console.error("Error rendering RSVPs on boot:", e); }
        try { renderBudget(); } catch(e) { console.error("Error rendering budget on boot:", e); }
        try { setTaskViewMode(taskViewMode); } catch(e) { console.error("Error setting task view mode on boot:", e); }

        // Start countdown interval safely
        try {
            updateCountdown();
            setInterval(updateCountdown, 10000); // Check every 10 seconds
        } catch(e) {
            console.error("Error starting countdown timer:", e);
        }

        // Check if there is a hardcoded config injected directly in the code
        try {
            if (HARDCODED_FIREBASE_CONFIG) {
                const configInput = document.getElementById('firebaseConfigInput');
                const appIdInput = document.getElementById('appIdInput');
                if (configInput) configInput.value = JSON.stringify(HARDCODED_FIREBASE_CONFIG, null, 2);
                if (appIdInput) appIdInput.value = appId;
                connectToFirebase(HARDCODED_FIREBASE_CONFIG);
            } else {
                const savedConfigText = localStorage.getItem('bm_firebaseConfig');
                if (savedConfigText) {
                    const configInput = document.getElementById('firebaseConfigInput');
                    const appIdInput = document.getElementById('appIdInput');
                    if (configInput) configInput.value = savedConfigText;
                    if (appIdInput) appIdInput.value = appId;
                    
                    const savedConfig = JSON.parse(savedConfigText);
                    connectToFirebase(savedConfig);
                }
            }
        } catch(e) {
            console.error("Error initializing Firebase during boot:", e);
        }
    } catch(e) {
        console.error("Critical outer error in window.onload lifecycle:", e);
    }

    populateTimeOptions();
    
    // Fallback: hide loading overlay after 2.5 seconds even if Firebase didn't connect
    setTimeout(hideLoadingOverlay, 2500);
};


// ─── מיקומים חיצוניים (שכנים וכו') ──────────────────────────
async function addExternalLocation() {
    const nameEl = document.getElementById('newExtLocationName');
    const guestsEl = document.getElementById('newExtLocationGuests');
    if (!nameEl) return;
    const name = nameEl.value.trim();
    const guestsRaw = guestsEl ? guestsEl.value.trim() : '';
    if (!name) { showToast('יש להזין שם מיקום!'); return; }

    const guests = guestsRaw ? guestsRaw.split(',').map(g => g.trim()).filter(Boolean) : [];
    const loc = { id: 'ext_' + Date.now(), name, guests };
    externalLocations.push(loc);
    saveLocalState();
    renderRooms();
    if (isCloudConnected && db) dbSet('externalLocations', loc.id, loc);
    nameEl.value = '';
    if (guestsEl) guestsEl.value = '';
    showToast('מיקום חיצוני נוסף!');
}

async function deleteExternalLocation(locId) {
    if (!confirm('למחוק מיקום זה?')) return;
    externalLocations = externalLocations.filter(l => l.id !== locId);
    saveLocalState();
    renderRooms();
    if (isCloudConnected && db) dbDelete('externalLocations', locId);
    showToast('המיקום הוסר');
}

async function addGuestToExtLocation(locId) {
    const inputEl = document.getElementById('extGuestInput_' + locId);
    if (!inputEl) return;
    const name = inputEl.value.trim();
    if (!name) { showToast('יש להזין שם אורח!'); return; }
    const loc = externalLocations.find(l => l.id === locId);
    if (!loc) return;
    loc.guests = [...(loc.guests || []), name];
    saveLocalState();
    renderRooms();
    if (isCloudConnected && db) dbUpdate('externalLocations', locId, { guests: loc.guests });
    inputEl.value = '';
    showToast(`${name} שובץ!`);
}

async function removeGuestFromExtLocation(locId, idx) {
    const loc = externalLocations.find(l => l.id === locId);
    if (!loc) return;
    const removed = loc.guests.splice(idx, 1)[0];
    saveLocalState();
    renderRooms();
    if (isCloudConnected && db) dbUpdate('externalLocations', locId, { guests: loc.guests });
    showToast(`${removed} הוסר`);
}

// ─── FAB — Floating Action Button ───────────────────────────
function fabAction() {
    const targets = {
        'tasks': 'newTaskTitle',
        'shopping': 'newShopTitle',
        'rsvp': 'rsvpName',
        'rooms': 'newRoomName',
        'budget': 'newExpName',
        'calls': 'newCallTitle',
        'logistics': 'newLogName',
        'menu': 'newMenuName',
        'schedule': 'schTitle'
    };
    const targetId = targets[currentTab];
    if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => el.focus(), 350);
        }
    }
}

// ─── Shopping view mode ───────────────────────────────────────
let shopViewMode = 'category'; // 'category' | 'freshness'

function setShopViewMode(mode) {
    shopViewMode = mode;
    const btnCat = document.getElementById('btnShopViewCategory');
    const btnFresh = document.getElementById('btnShopViewFreshness');
    if (btnCat) {
        btnCat.classList.toggle('bg-indigo-600', mode === 'category');
        btnCat.classList.toggle('text-white', mode === 'category');
        btnCat.classList.toggle('text-indigo-600', mode !== 'category');
        btnCat.classList.toggle('bg-white', mode !== 'category');
    }
    if (btnFresh) {
        btnFresh.classList.toggle('bg-indigo-600', mode === 'freshness');
        btnFresh.classList.toggle('text-white', mode === 'freshness');
        btnFresh.classList.toggle('text-indigo-600', mode !== 'freshness');
        btnFresh.classList.toggle('bg-white', mode !== 'freshness');
    }
    renderShopping();
}

// ─── Batch shopping selection ────────────────────────────────
let shopSelectMode = false;
const selectedShopItems = new Set();

function toggleShopSelectMode() {
    shopSelectMode = !shopSelectMode;
    selectedShopItems.clear();
    const btn = document.getElementById('btnShopSelectMode');
    if (btn) btn.textContent = shopSelectMode ? '✕ ביטול' : '☑ בחר מרובה';
    const bar = document.getElementById('batchBuyBar');
    if (bar) bar.classList.toggle('hidden', !shopSelectMode);
    renderShopping();
}

function toggleShopItemSelect(itemId) {
    if (selectedShopItems.has(itemId)) selectedShopItems.delete(itemId);
    else selectedShopItems.add(itemId);
    const countEl = document.getElementById('batchBuyCount');
    if (countEl) countEl.textContent = `${selectedShopItems.size} נבחרו`;
    // Instantly highlight the tapped row without full re-render
    const el = document.querySelector(`[data-batch-id="${itemId}"]`);
    if (el) {
        if (selectedShopItems.has(itemId)) el.classList.add('bg-indigo-50');
        else el.classList.remove('bg-indigo-50');
        const cb = el.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = selectedShopItems.has(itemId);
    }
}

async function batchBuySelected() {
    if (selectedShopItems.size === 0) { showToast('לא נבחרו פריטים!'); return; }
    const ids = [...selectedShopItems];
    const now = Date.now();
    ids.forEach(id => {
        const idx = shopping.findIndex(s => s.id === id);
        if (idx !== -1) { shopping[idx].bought = true; shopping[idx].boughtAt = now; }
    });
    selectedShopItems.clear();
    shopSelectMode = false;
    saveLocalState();
    renderShopping();
    if (isCloudConnected && db) {
        const fbBatch = db.batch();
        ids.forEach(id => {
            fbBatch.set(getCollectionRef('shopping').doc(id), { bought: true, boughtAt: now }, { merge: true });
        });
        await fbBatch.commit().catch(e => console.error('Batch commit error:', e));
    }
    showToast(`${ids.length} פריטים סומנו כנרכשו! ✅`);
}

function copyRoomsSummaryToClipboard() {
    let text = '🏡 חלוקת לינה — שבת בר מצווה אמיתי\n\n';
    text += '🏠 וילה:\n';
    rooms.forEach(r => {
        const guests = (r.guests || []);
        text += `  ${r.name} (${guests.length}/${r.capacity}):\n`;
        guests.forEach(g => text += `    • ${g}\n`);
        if (guests.length === 0) text += `    — ריק\n`;
    });
    if (externalLocations.length > 0) {
        text += '\n🏘️ מיקומים חיצוניים:\n';
        externalLocations.forEach(l => {
            text += `  ${l.name}:\n`;
            (l.guests || []).forEach(g => text += `    • ${g}\n`);
            if ((l.guests || []).length === 0) text += `    — ריק\n`;
        });
    }
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('חלוקת הלינה הועתקה! 📋'));
    } else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        showToast('חלוקת הלינה הועתקה! 📋');
    }
}
