// Hoisted traditional functions to guarantee availability on boot
function getCollectionRef(collectionName) {
    return db.collection('artifacts').doc(appId).collection('public').doc('data').collection(collectionName);
}

function dbSet(collectionName, docId, data) {
    if (isCloudConnected && db) {
        getCollectionRef(collectionName).doc(docId).set(data)
            .then(() => {
                console.log(`Document ${docId} successfully written in ${collectionName}`);
            })
            .catch(error => {
                handleFirestoreError(error, `יצירת ${collectionName}`);
            });
    }
}

// 🌟 שדרוג אבטחה: שימוש במיזוג (merge) במקום עדכון פשוט כדי למנוע קריסה וניתוקים! 🌟
function dbUpdate(collectionName, docId, updateData) {
    if (isCloudConnected && db) {
        getCollectionRef(collectionName).doc(docId).set(updateData, { merge: true })
            .then(() => {
                console.log(`Document ${docId} successfully updated in ${collectionName}`);
            })
            .catch(error => {
                handleFirestoreError(error, `עדכון ${collectionName}`);
            });
    }
}

function dbDelete(collectionName, docId) {
    if (isCloudConnected && db) {
        getCollectionRef(collectionName).doc(docId).delete()
            .then(() => {
                console.log(`Document ${docId} successfully deleted from ${collectionName}`);
            })
            .catch(error => {
                handleFirestoreError(error, `מחיקת ${collectionName}`);
            });
    }
}

// Automatic detector for expired Firestore test mode rules
function handleFirestoreError(error, context) {
    console.error(`Firebase Firestore Error in ${context}:`, error);
    if (error && error.message && error.message.toLowerCase().includes("permission")) {
        showToast("⚠️ שגיאת אבטחה: פג תוקף חוקי הבדיקה של ה-Firebase שלכם. כנסו ל-Firestore Console -> Rules ועדכנו את התאריך!");
    } else {
        showToast(`❌ שגיאת ענן ב-${context}: ${error.message || error}`);
    }
}

async function seedCloud() {
    console.log("Cloud is empty. Seeding local defaults to cloud...");
    try {
        const batch = db.batch();
        tasks.forEach(task => {
            batch.set(getCollectionRef('tasks').doc(task.id), task);
        });
        shopping.forEach(item => {
            batch.set(getCollectionRef('shopping').doc(item.id), item);
        });
        calls.forEach(call => {
            batch.set(getCollectionRef('calls').doc(call.id), call);
        });
        rooms.forEach(room => {
            batch.set(getCollectionRef('rooms').doc(room.id), room);
        });
        await batch.commit();
        console.log("Cloud successfully seeded!");
    } catch (e) {
        console.error("Error seeding cloud:", e);
    }
}

function startFirebaseListeners() {
    if (!db) return;

    const user = firebase.auth().currentUser;
    if (!user) return; // Guard operation (Rule 3)

    const tasksRef = getCollectionRef('tasks');
    const shoppingRef = getCollectionRef('shopping');
    const callsRef = getCollectionRef('calls');
    const roomsRef = getCollectionRef('rooms');
    const rsvpsRef = getCollectionRef('rsvps');
    const budgetRef = getCollectionRef('budget');

    const logRef = getCollectionRef('logistics');
    logRef.onSnapshot(snapshot => {
        const cloudLogistics = [];
        if (!snapshot.empty) {
            snapshot.forEach(doc => cloudLogistics.push(doc.data()));
        }
        logistics = cloudLogistics;
        localStorage.setItem('bm_logistics', JSON.stringify(logistics));
        if (currentTab === 'logistics') renderLogistics();
    }, error => {
        handleFirestoreError(error, "לוגיסטיקה");
    });

    // Schedule snapshot
    const schRef = getCollectionRef('schedule');
    schRef.onSnapshot(snapshot => {
        const cloudSchedule = [];
        snapshot.forEach(doc => cloudSchedule.push(doc.data()));
        schedule = cloudSchedule;
        localStorage.setItem('bm_schedule', JSON.stringify(schedule));
        
        // זה יקרה אוטומטית בכל פעם שיש שינוי בענן, 
        // וזה יחליף את כל התצוגה בלי כפילויות
        if (document.getElementById('content-schedule')) renderSchedule(); 
    }, error => {
        handleFirestoreError(error, "לו\"ז");
    });
    
    // Menu snapshot
    const menuRef = getCollectionRef('menu');
    menuRef.onSnapshot(snapshot => {
        const cloudMenu = [];
        if (!snapshot.empty) {
            snapshot.forEach(doc => cloudMenu.push(doc.data()));
        }
        menu = cloudMenu;
        localStorage.setItem('bm_menu', JSON.stringify(menu));
        if (currentTab === 'menu') renderMenu();
    }, error => {
        handleFirestoreError(error, "תפריט");
    });

    // Tasks snapshot
    tasksRef.onSnapshot(async (snapshot) => {
        if (snapshot.empty && !isSeeding) {
            isSeeding = true;
            await seedCloud();
            isSeeding = false;
            return;
        }
        const cloudTasks = [];
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                cloudTasks.push(doc.data());
            });
        }
        tasks = cloudTasks;
        localStorage.setItem('bm_tasks', JSON.stringify(tasks));
        renderTasks();
        renderRecentTasks();
    }, error => {
        handleFirestoreError(error, "משימות");
    });

    // Shopping snapshot
    shoppingRef.onSnapshot(snapshot => {
        const cloudShopping = [];
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                cloudShopping.push(doc.data());
            });
        }
        shopping = cloudShopping;
        localStorage.setItem('bm_shopping', JSON.stringify(shopping));
        renderShopping();
    }, error => {
        handleFirestoreError(error, "קניות");
    });

    // Rooms snapshot
    roomsRef.onSnapshot(snapshot => {
        const cloudRooms = [];
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                cloudRooms.push(doc.data());
            });
        }
        rooms = cloudRooms;
        localStorage.setItem('bm_rooms', JSON.stringify(rooms));
        if (currentTab === 'rooms') renderRooms();
    }, error => {
        handleFirestoreError(error, "חדרים");
    });

    // Calls snapshot
    callsRef.onSnapshot(snapshot => {
        const cloudCalls = [];
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                cloudCalls.push(doc.data());
            });
        }
        calls = cloudCalls;
        localStorage.setItem('bm_calls', JSON.stringify(calls));
        renderCalls();
    }, error => {
        handleFirestoreError(error, "בירורים");
    });

    // RSVPs snapshot
    rsvpsRef.onSnapshot(snapshot => {
        const cloudRsvps = [];
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                cloudRsvps.push(doc.data());
            });
        }
        rsvps = cloudRsvps;
        localStorage.setItem('bm_rsvps', JSON.stringify(rsvps));
        renderRsvps();
    }, error => {
        handleFirestoreError(error, "אישורי הגעה");
    });

    // Budget snapshot
    budgetRef.onSnapshot(snapshot => {
        const cloudBudget = [];
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                cloudBudget.push(doc.data());
            });
        }
        budget = cloudBudget;
        localStorage.setItem('bm_budget', JSON.stringify(budget));
        renderBudget();
    }, error => {
        handleFirestoreError(error, "תקציב");
    });
}

async function connectToFirebase(config) {
    try {
        if (firebase.apps.length > 0) {
            await firebase.app().delete();
        }

        firebaseApp = firebase.initializeApp(config);
        auth = firebase.auth();
        db = firebase.firestore();

        // Rule 3: Auth BEFORE queries
        const userCredential = await auth.signInAnonymously();
        const user = userCredential.user;
        
        if (user) {
            isCloudConnected = true;
            
            const indicator = document.getElementById('syncStatusIndicator');
            if (indicator) indicator.className = "h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse";
            
            safeSetText('syncStatusText', "מחובר ומסונכרן לענן של גוגל בזמן אמת! 🌐");
            
            startFirebaseListeners();
            showToast("החיבור לענן גוגל בוצע בהצלחה!");
        }
    } catch (error) {
        console.error("Firebase init failed:", error);
        isCloudConnected = false;
        
        const indicator = document.getElementById('syncStatusIndicator');
        if (indicator) indicator.className = "h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse";
        
        safeSetText('syncStatusText', "שגיאת חיבור לענן: " + error.message);
        showToast("שגיאה בהתחברות לענן! נסו לבדוק את הגדרות הקונפיגורציה.");
    }
}

function parseFirebaseConfig(text) {
    text = text.trim();
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1);
    }
    
    try {
        const parsed = new Function(`return (${text})`)();
        if (parsed && typeof parsed === 'object' && parsed.apiKey) {
            return parsed;
        }
    } catch (e) {
        console.warn("Function parser fallback triggered.", e);
    }
    
    try {
        const config = {};
        const keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        keys.forEach(key => {
            const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`);
            const match = text.match(regex);
            if (match && match[1]) {
                config[key] = match[1];
            }
        });
        if (config.apiKey && config.projectId) {
            return config;
        }
    } catch (err) {
        console.error("All parsers failed", err);
    }
    
    return null;
}



