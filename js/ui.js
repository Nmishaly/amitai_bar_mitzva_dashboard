function formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parseInt(parts[2])}/${parseInt(parts[1])}`;
        }
        return dateStr;
    } catch (e) {
        return dateStr;
    }
}

function safeSetValue(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.value = val;
    }
}

function safeSetHTML(id, html) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = html;
    }
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = text;
    }
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return "לאחרונה";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "לפני רגע";
    if (seconds < 3600) return "לפני " + Math.floor(seconds / 60) + " דקות";
    if (seconds < 86400) return "לפני " + Math.floor(seconds / 3600) + " שעות";
    return "לפני " + Math.floor(seconds / 86400) + " ימים";
}

function calculateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const circle = document.getElementById('progressRing');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    safeSetText('progressPercent', `${percent}%`);

    const urgentLeft = tasks.filter(t => t.category !== 'alon' && getRelativeCategory(t.deadline) === 'overdue' && t.status !== 'done').length;
    safeSetText('statUrgent', urgentLeft);

    const remaining = totalTasks - completedTasks;
    safeSetText('statTasks', remaining);
    safeSetText('statCompleted', completedTasks);

    const totalShopping = shopping.length;
    const boughtShopping = shopping.filter(s => s.bought).length;
    safeSetText('statShopping', `${boughtShopping} / ${totalShopping}`);

    const totalCalls = calls.length;
    const closedCalls = calls.filter(c => c.done).length;
    safeSetText('statCalls', `${closedCalls} / ${totalCalls}`);
}

function renderTasks() {
    const containers = {
        'overdue': document.getElementById('tasks-overdue'),
        'today': document.getElementById('tasks-today'),
        'thisweek': document.getElementById('tasks-thisweek'),
        'future': document.getElementById('tasks-future'),
        'sorted': document.getElementById('tasks-sorted-container')
    };

    Object.keys(containers).forEach(key => {
        if (containers[key]) containers[key].innerHTML = "";
    });

    const countMap = { 'overdue': 0, 'today': 0, 'thisweek': 0, 'future': 0, 'sorted': 0 };

    // Only show tasks that are NOT related to "alon" (עלון הדור)
    let generalTasks = getActiveTasks(tasks).filter(t => t.category !== 'alon');

    // Apply responsible filter
    if (currentResponsibleFilter !== 'all') {
        generalTasks = generalTasks.filter(t => t.responsible === currentResponsibleFilter);
    }

    // Apply status filter
    const statusFilterEl = document.getElementById('taskStatusFilter');
    const statusFilter = statusFilterEl ? statusFilterEl.value : 'active';
    if (statusFilter === 'active') {
        generalTasks = generalTasks.filter(t => t.status !== 'done');
    } else if (statusFilter === 'completed') {
        generalTasks = generalTasks.filter(t => t.status === 'done');
    }

    // If sorted list mode is selected, sort them by date ascending
    if (taskViewMode === 'sorted') {
        generalTasks.sort((a, b) => {
            const da = a.deadline ? new Date(a.deadline + "T00:00:00") : new Date("2099-12-31");
            const dateB = b.deadline ? new Date(b.deadline + "T00:00:00") : new Date("2099-12-31");
            return da - dateB;
        });
    }

    generalTasks.forEach(task => {
        const relCategory = getRelativeCategory(task.deadline);
        countMap[relCategory]++;
        countMap['sorted']++;

        let itemHtml = "";

        if (editingTaskId === task.id) {
            // Render Edit Mode Inline for General Task (With Date Picker instead of select)
            itemHtml = `
                <div class="p-4 bg-slate-50 border-y border-indigo-100 space-y-3">
                    <div class="text-xs font-bold text-indigo-800 flex items-center gap-1">✏️ עריכת משימה</div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" id="editTitle_${task.id}" value="${task.title}" placeholder="שם המשימה" class="col-span-1 sm:col-span-2 p-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        <input type="date" id="editDeadline_${task.id}" value="${task.deadline || '2026-06-12'}" class="p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                        <select id="editResponsible_${task.id}" class="p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                            <option value="לא הוגדר" ${task.responsible === 'לא הוגדר' ? 'selected' : ''}>👤 לא הוגדר</option>
                            <option value="נצר" ${task.responsible === 'נצר' ? 'selected' : ''}>נצר 🧔</option>
                            <option value="נעמה" ${task.responsible === 'נעמה' ? 'selected' : ''}>נעמה 👩</option>
                            <option value="משותף" ${task.responsible === 'משותף' ? 'selected' : ''}>משותף 👥</option>
                        </select>
                        <input type="text" id="editNotes_${task.id}" value="${task.notes || ''}" placeholder="הערות ומידע נוסף..." class="col-span-1 sm:col-span-2 p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    </div>
                    <div class="flex justify-end gap-2 pt-1">
                        <button onclick="cancelEditTask()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-4 rounded-lg text-xs transition">ביטול</button>
                        <button onclick="saveEditTask('${task.id}', 'main')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition shadow-sm">שמור שינויים</button>
                    </div>
                </div>
            `;
        } else {
            // Render Normal View Mode
            const formattedDate = task.deadline ? formatDateDisplay(task.deadline) : "ללא תאריך יעד";
            itemHtml = `
                <div class="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition">
                    <div class="flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <h4 class="font-bold text-slate-800 text-sm ${task.status === 'done' ? 'line-through text-slate-400' : ''}">${task.title}</h4>
                            <span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] px-2 py-0.5 rounded-full font-semibold">👤 ${task.responsible || 'לא הוגדר'}</span>
                            <span class="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] px-2 py-0.5 rounded-full font-semibold">📅 ${formattedDate}</span>
                        </div>
                        ${task.notes ? `<p class="text-xs text-slate-400 mt-1 flex items-center gap-1">📌 ${task.notes}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-2 self-end sm:self-auto">
                        <button onclick="updateTaskStatus('${task.id}', 'todo')" class="px-2.5 py-1 rounded-full text-xs font-semibold border ${task.status === 'todo' ? 'bg-slate-200 border-slate-300 text-slate-800 font-bold' : 'bg-transparent border-slate-200 text-slate-400'}">ללא התחילה</button>
                        <button onclick="updateTaskStatus('${task.id}', 'progress')" class="px-2.5 py-1 rounded-full text-xs font-semibold border ${task.status === 'progress' ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold' : 'bg-transparent border-slate-200 text-slate-400'}">בתהליך</button>
                        <button onclick="updateTaskStatus('${task.id}', 'done')" class="px-2.5 py-1 rounded-full text-xs font-semibold border ${task.status === 'done' ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold' : 'bg-transparent border-slate-200 text-slate-400'}">בוצע</button>
                        
                        <div class="flex items-center gap-1 pr-1 border-r border-slate-100 font-bold">
                            <button onclick="startEditTask('${task.id}')" class="p-1.5 text-slate-300 hover:text-indigo-600 transition rounded-md hover:bg-indigo-50" title="עריכת משימה">
                                ✏️
                            </button>
                            <button onclick="deleteTask('${task.id}')" class="p-1.5 text-slate-300 hover:text-red-500 transition rounded-md hover:bg-red-50" title="מחיקת משימה">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        if (taskViewMode === 'dynamic') {
            if (containers[relCategory]) {
                containers[relCategory].insertAdjacentHTML('beforeend', itemHtml);
            }
        } else {
            if (containers['sorted']) {
                containers['sorted'].insertAdjacentHTML('beforeend', itemHtml);
            }
        }
    });

    // Update badges
    Object.keys(countMap).forEach(key => {
        const element = document.getElementById(`badge-${key}`);
        if (element) {
            element.innerText = `${countMap[key]} משימות`;
        }
    });

    // Hide empty category boxes
    ['overdue', 'today', 'thisweek', 'future'].forEach(cat => {
        const box = document.getElementById('box-' + cat);
        if (box) {
            box.classList.toggle('hidden', countMap[cat] === 0);
        }
    });

    calculateStats();
}

function renderRecentTasks() {
    const container = document.getElementById('recentTasksContainer');
    if (!container) return;
    container.innerHTML = "";

    // איסוף עדכונים מכל הסוגים
    const updates = [];

    // משימות — לפי updatedAt או createdAt
    tasks.forEach(t => {
        const ts = t.updatedAt || t.createdAt || 0;
        let action = "נוספה";
        let color = "bg-indigo-100 text-indigo-800";
        if (t.updatedAt && t.updatedAt !== t.createdAt) {
            action = t.status === 'done' ? "✅ הושלמה" : "עודכנה";
            color = t.status === 'done' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
        }
        updates.push({
            ts, type: 'task',
            title: t.title,
            subtitle: `👤 ${t.responsible || 'לא הוגדר'}`,
            badge: `📅 משימה`,
            action,
            color,
            statusClass: t.status === 'done' ? 'line-through text-slate-400' : ''
        });
    });

    // קניות שנקנו לאחרונה
    shopping.filter(s => s.bought).forEach(s => {
        updates.push({
            ts: s.boughtAt || 0, type: 'shopping',
            title: s.title,
            subtitle: '',
            badge: '🛒 קניות',
            action: '✅ נקנה',
            color: 'bg-emerald-100 text-emerald-800',
            statusClass: 'line-through text-slate-400'
        });
    });

    // בירורים שנסגרו
    calls.filter(c => c.done).forEach(c => {
        updates.push({
            ts: c.closedAt || 0, type: 'call',
            title: c.title,
            subtitle: c.subtitle || '',
            badge: '📞 בירור',
            action: '✅ טופל',
            color: 'bg-emerald-100 text-emerald-800',
            statusClass: ''
        });
    });

    // הוצאות שנוספו
    budget.forEach(e => {
        updates.push({
            ts: e.createdAt || 0, type: 'budget',
            title: e.name,
            subtitle: `${e.totalAmount.toLocaleString()} ₪`,
            badge: '💰 תקציב',
            action: 'נוספה',
            color: 'bg-rose-100 text-rose-800',
            statusClass: ''
        });
    });

    // מיון לפי זמן — החדש ביותר קודם
    const sorted = updates
        .filter(u => u.ts > 0)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 15);

    if (sorted.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400 text-sm">אין עדיין פעילות רשומה במערכת.</div>`;
        return;
    }

    sorted.forEach(u => {
        container.insertAdjacentHTML('beforeend', `
            <div class="p-4 flex justify-between items-start gap-3 hover:bg-slate-50 transition">
                <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <h4 class="font-bold text-slate-800 text-sm ${u.statusClass}">${u.title}</h4>
                        <span class="inline-flex items-center bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full font-semibold">${u.badge}</span>
                        <span class="inline-flex items-center ${u.color} text-[11px] px-2 py-0.5 rounded-full font-semibold">${u.action}</span>
                    </div>
                    ${u.subtitle ? `<p class="text-xs text-slate-400 mt-1">${u.subtitle}</p>` : ''}
                    <p class="text-xs text-slate-400 mt-0.5">⏱️ ${formatTimeAgo(u.ts)}</p>
                </div>
            </div>
        `);
    });
}

function renderRsvps() {
    const tbody = document.getElementById('rsvpTableBody');
    if (!tbody) return;
    tbody.innerHTML = "";

    let totalCount = 0;
    let totalAdults = 0;
    let totalKids = 0;

    let countFriday = 0;
    let subAdultsFriday = 0;
    let subKidsFriday = 0;

    let countSaturday = 0;
    let subAdultsSaturday = 0;
    let subKidsSaturday = 0;

    let countThird = 0;
    let subAdultsThird = 0;
    let subKidsThird = 0;

    rsvps.forEach(g => {
        const size = g.adults + g.kids;
        totalCount += size;
        totalAdults += g.adults;
        totalKids += g.kids;

        // Meal participation mapping
        const mealsText = [];
        if (g.meals.includes('friday')) {
            mealsText.push('🍷 ערב שבת');
            countFriday += size;
            subAdultsFriday += g.adults;
            subKidsFriday += g.kids;
        }
        if (g.meals.includes('saturday')) {
            mealsText.push('⛪ בוקר');
            countSaturday += size;
            subAdultsSaturday += g.adults;
            subKidsSaturday += g.kids;
        }
        if (g.meals.includes('third')) {
            mealsText.push('🥧 שלישית');
            countThird += size;
            subAdultsThird += g.adults;
            subKidsThird += g.kids;
        }

        const rowHtml = `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-3 font-bold text-slate-800">${g.name}</td>
                <td class="p-3 text-center font-semibold text-slate-700">${g.adults}</td>
                <td class="p-3 text-center font-semibold text-slate-700">${g.kids}</td>
                <td class="p-3 text-center font-semibold">${g.sleep === 'yes' ? '🏡 כן' : '❌ לא'}</td>
                <td class="p-3 text-center text-xs font-semibold text-indigo-700">${mealsText.join(', ') || 'ללא ארוחות'}</td>
                <td class="p-3 text-center">
                    <button onclick="deleteRsvp('${g.id}')" class="text-rose-600 hover:text-rose-900 font-bold text-xs">מחק</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', rowHtml);
    });

    // Mobile Cards
    const cardsBody = document.getElementById('rsvpCardsBody');
    if (cardsBody) {
        cardsBody.innerHTML = "";
        rsvps.forEach(g => {
            const size = g.adults + g.kids;
            const mealsText = [];
            if (g.meals.includes('friday')) mealsText.push('🍷 ערב שבת');
            if (g.meals.includes('saturday')) mealsText.push('⛪ בוקר');
            if (g.meals.includes('third')) mealsText.push('🥧 שלישית');
            cardsBody.insertAdjacentHTML('beforeend', `
                <div class="p-4 flex justify-between items-start gap-2">
                    <div class="flex-1">
                        <div class="font-bold text-slate-800 text-sm">${g.name}</div>
                        <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                            <span>👨‍🦳 ${g.adults} מבוגרים</span>
                            <span>👶 ${g.kids} ילדים</span>
                            <span>${g.sleep === 'yes' ? '🏡 נשאר' : '🚗 לא נשאר'}</span>
                        </div>
                        <div class="text-xs text-indigo-600 font-semibold mt-1">${mealsText.join(' · ') || 'ללא ארוחות'}</div>
                    </div>
                    <button onclick="deleteRsvp('${g.id}')" class="text-slate-300 hover:text-red-500 transition font-bold text-lg leading-none">✕</button>
                </div>
            `);
        });
    }

    // Update stats
    safeSetText('rsvpTotalCount', totalCount);
    safeSetText('rsvpSubtotals', `${totalAdults} מבוגרים | ${totalKids} ילדים`);

    safeSetText('rsvpCountFriday', countFriday);
    safeSetText('subFriday', `${subAdultsFriday} מבוגרים | ${subKidsFriday} ילדים`);

    safeSetText('rsvpCountSaturday', countSaturday);
    safeSetText('subSaturday', `${subAdultsSaturday} מבוגרים | ${subKidsSaturday} ילדים`);

    safeSetText('rsvpCountThird', countThird);
    safeSetText('subThird', `${subAdultsThird} מבוגרים | ${subKidsThird} ילדים`);

    // Update inputs for drink calculation automatically
    safeSetValue('calcAdults', totalAdults);
    safeSetValue('calcKids', totalKids);

    calculateDrinks();
}

function renderShopping() {
    const container = document.getElementById('shoppingListContainer');
    if (!container) return;
    container.innerHTML = "";

    const categories = {
        'disposable': '🍽️ כלים חד פעמיים',
        'drinks': '🥤 שתייה וקפה',
        'synagogue': '⛪ בית הכנסת',
        'dessert': '🍰 קינוחים ואוכל משלים',
        'villa': '🏡 אירוח בוילה'
    };

    Object.keys(categories).forEach(catKey => {
        const catItems = shopping.filter(item => item.category === catKey);
        if (catItems.length === 0) return;

        let categorySectionHtml = `
            <div class="bg-slate-50/50 px-4 py-2 font-bold text-xs text-indigo-900 border-y border-slate-100 uppercase tracking-wider">
                ${categories[catKey]}
            </div>
        `;
        container.insertAdjacentHTML('beforeend', categorySectionHtml);

        // Sort: unbought first, bought last
        const sortedItems = [...catItems].sort((a, b) => (a.bought ? 1 : 0) - (b.bought ? 1 : 0));
        sortedItems.forEach(item => {
            const itemHtml = `
                <div class="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                    <label class="flex items-center gap-3 cursor-pointer select-none flex-1">
                        <input type="checkbox" ${item.bought ? 'checked' : ''} onchange="toggleShopItem('${item.id}')" class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer">
                        <span class="text-sm font-medium ${item.bought ? 'line-through text-slate-400' : 'text-slate-800'}">${item.title}</span>
                    </label>
                    <button onclick="deleteShopItem('${item.id}')" class="p-1.5 text-slate-300 hover:text-red-500 transition rounded-md hover:bg-red-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHtml);
        });
    });

    calculateStats();
}

function renderRooms() {
    const container = document.getElementById('roomsContainer');
    if (!container) return;
    container.innerHTML = "";

    if (rooms.length === 0) {
        container.innerHTML = `
            <div class="col-span-full p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
                אין כרגע חדרים רשומים בוילה. הוסיפו חדר חדש למעלה!
            </div>
        `;
        return;
    }

    // Show overall occupancy summary
    const totalBeds = rooms.reduce((sum, r) => sum + (parseInt(r.capacity) || 0), 0);
    const totalOccupied = rooms.reduce((sum, r) => sum + (r.guests ? r.guests.length : 0), 0);
    const summaryEl = document.getElementById('roomsSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-center justify-between mb-4">
                <span class="text-sm font-bold text-purple-900">🏨 סיכום תפוסה כוללת בוילה</span>
                <span class="text-sm font-extrabold text-purple-700">${totalOccupied} מתוך ${totalBeds} מיטות תפוסות</span>
            </div>
        `;
    }

    rooms.forEach(room => {
        const currentGuests = room.guests || [];
        const occupiedCount = currentGuests.length;
        const capacity = parseInt(room.capacity) || 1;
        const progressPercent = Math.min(100, Math.round((occupiedCount / capacity) * 100));

        let guestsHtml = "";
        if (currentGuests.length === 0) {
            guestsHtml = `<p class="text-xs text-slate-400 italic">אין עדיין אורחים משובצים בחדר זה</p>`;
        } else {
            guestsHtml = currentGuests.map((guest, idx) => `
                <div class="flex justify-between items-center bg-purple-50 text-purple-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                    <span>👤 ${guest}</span>
                    <button onclick="removeGuestFromRoom('${room.id}', ${idx})" class="text-slate-400 hover:text-red-500 transition text-[10px] font-bold">✕</button>
                </div>
            `).join("");
        }

        const cardHtml = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="font-extrabold text-slate-800 text-sm">${room.name}</h3>
                            <span class="text-xs text-purple-600 font-bold">${occupiedCount} מתוך ${capacity} מיטות תפוסות</span>
                        </div>
                        <button onclick="deleteRoom('${room.id}')" class="text-slate-300 hover:text-red-500 transition text-xs font-semibold" title="מחק חדר">🗑️</button>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full bg-slate-100 h-2 rounded-full mb-4 overflow-hidden">
                        <div class="bg-purple-600 h-full transition-all duration-300" style="width: ${progressPercent}%"></div>
                    </div>

                    <!-- Guests List -->
                    <div class="space-y-1.5 mb-4 max-h-36 overflow-y-auto">
                        ${guestsHtml}
                    </div>
                </div>

                <!-- Add Guest Form -->
                <div class="border-t border-slate-100 pt-3 flex gap-2">
                    <input type="text" id="guestInput_${room.id}" placeholder="שם האורח לשבוץ..." class="flex-1 p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none">
                    <button onclick="addGuestToRoom('${room.id}')" class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition shadow-sm">
                        שבץ
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });

    calculateStats();
}

function renderCalls() {
    const container = document.getElementById('callsContainer');
    if (!container) return;
    container.innerHTML = "";

    calls.forEach(call => {
        const cardHtml = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition gap-4">
                <div>
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-extrabold text-slate-800 text-sm">${call.title}</h3>
                            <p class="text-xs text-indigo-600 font-semibold mt-0.5">${call.subtitle}</p>
                            ${call.phone ? `<a href="tel:${call.phone}" class="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600 hover:text-emerald-800">📞 ${call.phone}</a>` : ''}
                        </div>
                        <button onclick="toggleCallDone('${call.id}')" class="px-3 py-1 rounded-full text-xs font-bold border transition ${call.done ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-500'}">
                            ${call.done ? '✅ טופל' : '📞 פתוח'}
                        </button>
                    </div>
                    
                    <div class="mt-3">
                        <label class="text-[10px] text-slate-400 font-bold block mb-1">הערות וסיכום:</label>
                        <textarea onblur="updateCallNotes('${call.id}', this.value)" placeholder="הקלידו כאן מידע חשוב..." class="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50" rows="3">${call.notes || ''}</textarea>
                    </div>
                </div>
                <div class="flex justify-end border-t border-slate-50 pt-2">
                    <button onclick="deleteCall('${call.id}')" class="text-xs text-slate-300 hover:text-red-500 transition font-semibold flex items-center gap-1">
                        🗑️ מחק כרטיסייה
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });

    calculateStats();
}

function renderBudget() {
    const container = document.getElementById('budgetListContainer');
    if (!container) return;
    container.innerHTML = "";
    // Sync max budget input with saved value
    const maxInput = document.getElementById('maxBudgetInput');
    const maxDisplay = document.getElementById('budgetMaxDisplay');
    const savedMax = typeof maxBudget !== "undefined" ? maxBudget : 33000;
    if (maxInput) maxInput.value = savedMax;
    if (maxDisplay) maxDisplay.textContent = savedMax.toLocaleString() + ' ₪';

    let totalExpenses = 0;
    let totalPaid = 0;

    if (budget.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400 text-sm">אין עדיין הוצאות רשומות במערכת.</div>`;
    } else {
        budget.forEach(exp => {
            totalExpenses += exp.totalAmount;
            
            // חישוב כמה שולם בפועל מתוך כל תתי-התשלומים
            const expPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
            totalPaid += expPaid;
            
            const remaining = exp.totalAmount - expPaid;

            const itemHtml = `
                <div class="p-5 border-b border-slate-100 space-y-3" data-exp-id="${exp.id}">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="text-sm font-bold text-slate-800">${exp.name}</h4>
                            <p class="text-xs text-indigo-600 font-semibold mt-0.5">סה"כ: ${exp.totalAmount.toLocaleString()} ₪</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="addPaymentToExpense('${exp.id}')" class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold">➕ הוסף תשלום</button>
                            <button onclick="deleteExpense('${exp.id}')" class="text-slate-300 hover:text-red-500 text-xs">מחק</button>
                        </div>
                    </div>
                    
                    <div class="bg-slate-50 p-3 rounded-xl space-y-1">
                        <span class="text-[10px] font-bold text-slate-500 uppercase">פירוט תשלומים:</span>
                        ${exp.payments.map(p => `
                            <div class="flex justify-between text-xs text-slate-700">
                                <span>${p.date} (${p.method})</span>
                                <span class="font-bold">${p.amount.toLocaleString()} ₪</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="text-right">
                        <span class="text-xs font-bold ${remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}">
                            ${remaining > 0 ? `נותר לתשלום: ${remaining.toLocaleString()} ₪` : '✅ שולם במלואו'}
                        </span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHtml);
        });
    }

    // עדכון המדדים העליונים
    safeSetText('budgetTotalExpenses', `${totalExpenses.toLocaleString()} ₪`);
    safeSetText('budgetTotalPaid', `${totalPaid.toLocaleString()} ₪`);

    const currentMax = typeof maxBudget !== "undefined" ? maxBudget : 33000;
    // כאן התיקון: חישוב האחוזים לפי הסכום הכולל (totalExpenses)
    const progressPercent = Math.min(100, Math.round((totalExpenses / currentMax) * 100));
    
    safeSetText('budgetProgressPercent', `${progressPercent}% מנוצל`);
    
    const remaining = currentMax - totalExpenses;
    safeSetText('budgetRemainingAmount', remaining >= 0 ? `נותר: ${remaining.toLocaleString()} ₪` : `חריגה: ${Math.abs(remaining).toLocaleString()} ₪`);

    // עדכון ה-Progress Bar הוויזואלי
    const progressBar = document.getElementById('budgetProgressBar');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
}

function renderLogistics(filter = 'all') {
    const container = document.getElementById('logisticsContainer');
    container.innerHTML = "";
    const filtered = filter === 'all' ? logistics : logistics.filter(l => l.destination === filter);
    
    filtered.forEach(log => {
        container.insertAdjacentHTML('beforeend', `
            <div class="bg-white p-4 rounded-xl border ${log.packed ? 'border-emerald-500' : 'border-slate-200'} shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <h4 id="logname-${log.id}" class="font-bold text-sm cursor-pointer text-indigo-900" onclick="editLogName('${log.id}')">${log.name} ✏️</h4>
                    <button onclick="deleteLogisticsKit('${log.id}')" class="text-red-400 hover:text-red-600 text-xs font-bold">מחק</button>
                </div>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] text-slate-400 font-bold uppercase">${log.destination}</span>
                    <span class="text-[10px] font-bold text-emerald-600">${log.items.filter(i=>i.checked).length}/${log.items.length} ✅</span>
                    <label class="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <input type="checkbox" ${log.packed ? 'checked' : ''} onchange="toggleKitPacked('${log.id}')"> הועבר ליעד
                    </label>
                </div>
                <div class="space-y-1 my-2">
                    ${log.items.map((it, idx) => `
                        <div class="flex justify-between items-center text-xs">
                            <label class="flex items-center gap-1.5"><input type="checkbox" ${it.checked ? 'checked' : ''} onchange="toggleLogItem('${log.id}', ${idx})"> ${it.name}</label>
                            <button onclick="deleteLogItem('${log.id}', ${idx})" class="text-slate-300 hover:text-red-500 px-1">✕</button>
                        </div>
                    `).join('')}
                </div>
                <div class="flex gap-1 mt-3">
                    <input type="text" id="input_${log.id}" placeholder="פריט..." onkeydown="if(event.key==='Enter') addLogItemInline('${log.id}')" class="w-full text-xs border rounded px-2 py-1">
                    <button onclick="addLogItemInline('${log.id}')" class="bg-blue-600 text-white px-2 rounded text-xs">➕</button>
                </div>
            </div>
        `);
    });
}

function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = "";
    // Update active filter button
    ['הכל','טבעוני','ללא גלוטן','מנת ילדים'].forEach(f => {
        const btn = document.getElementById('menuFilter-' + f);
        if (btn) {
            btn.className = f === currentMenuFilter
                ? 'px-3 py-1 rounded-full bg-indigo-600 text-white font-bold border border-indigo-600 shadow-sm'
                : 'px-3 py-1 rounded-full bg-white border shadow-sm text-slate-700';
        }
    });
    // Show empty state
    const meals = ["ערב שבת", "בוקר שבת", "סעודה שלישית"];
    let hasItems = false;
    
    meals.forEach(m => {
        let items = menu.filter(i => i.meal === m);
        if (currentMenuFilter === 'טבעוני') items = items.filter(i => i.vegan);
        else if (currentMenuFilter === 'ללא גלוטן') items = items.filter(i => i.gluten);
        else if (currentMenuFilter === 'מנת ילדים') items = items.filter(i => i.cat === 'מנת ילדים');
        
        if (items.length > 0) {
            hasItems = true;
            container.insertAdjacentHTML('beforeend', `<h4 class="font-bold text-indigo-900 mt-4 mb-2">${m}</h4>`);
            items.forEach(i => {
                if (editingMenuId === i.id) {
                    // תצוגת עריכה
                    container.insertAdjacentHTML('beforeend', `
                        <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-200 space-y-2">
                            <input type="text" id="editMenuName" value="${i.name}" class="w-full p-1 border rounded text-xs">
                            <div class="grid grid-cols-2 gap-1">
                                <select id="editMenuCat" class="p-1 border rounded text-xs">
                                    <option value="מנה ראשונה" ${i.cat==='מנה ראשונה'?'selected':''}>מנה ראשונה</option>
                                    <option value="עיקרית" ${i.cat==='עיקרית'?'selected':''}>עיקרית</option>
                                    <option value="תוספת" ${i.cat==='תוספת'?'selected':''}>תוספת</option>
                                    <option value="קינוח" ${i.cat==='קינוח'?'selected':''}>קינוח</option>
                                    <option value="ילדים" ${i.cat==='ילדים'?'selected':''}>ילדים</option>
                                    <option value="אחר" ${i.cat==='אחר'?'selected':''}>אחר</option>
                                </select>
                                <button onclick="saveEditMenu('${i.id}')" class="bg-indigo-600 text-white rounded text-xs font-bold">שמור</button>
                            </div>
                        </div>
                    `);
                } else {
                    // תצוגה רגילה
                    container.insertAdjacentHTML('beforeend', `
                        <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:bg-slate-50" onclick="editMenuItem('${i.id}')">
                            <div class="text-xs">
                                <div class="font-bold">${i.name}</div>
                                <div class="text-[10px] text-slate-500">${i.cat} ${i.vegan ? '🥬' : ''} ${i.gluten ? '🚫' : ''}</div>
                            </div>
                            <button onclick="deleteMenuItem('${i.id}')" class="text-red-400 font-bold px-2">✕</button>
                        </div>
                    `);
                }
            });
        }
    });
    if (!hasItems) {
        container.innerHTML = `<div class="col-span-3 p-8 text-center text-slate-400 text-sm">אין מנות להצגה. הוסיפו מנות למעלה או שנו את הפילטר.</div>`;
    }
}

function renderSchedule() {
    const colColors = {
        'col-friday-night':  { border: 'border-indigo-400', bg: 'bg-indigo-50' },
        'col-friday-evening': { border: 'border-purple-400', bg: 'bg-purple-50' },
        'col-saturday-lunch': { border: 'border-amber-400',  bg: 'bg-amber-50'  },
        'col-third-meal':     { border: 'border-emerald-400', bg: 'bg-emerald-50' },
        'bank':               { border: 'border-slate-400',  bg: 'bg-white'     }
    };

    // 1. ניקוי
    const bankEl = document.getElementById('activity-bank');
    if (bankEl) bankEl.innerHTML = "";
    document.querySelectorAll('[id^="col-"]').forEach(col => {
        col.querySelectorAll('[id^="act_"]').forEach(i => i.remove());
    });

    // 2. ספירת פעילויות לכל עמודה
    const colCount = {};
    schedule.forEach(item => {
        const loc = (item.location && document.getElementById(item.location)) ? item.location : 'bank';
        colCount[loc] = (colCount[loc] || 0) + 1;
    });

    // 3. עדכון badges
    ['col-friday-night','col-friday-evening','col-saturday-lunch','col-third-meal'].forEach(colId => {
        const badge = document.getElementById('badge-' + colId);
        if (badge) {
            const count = colCount[colId] || 0;
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }
    });
    const bankBadge = document.getElementById('bank-badge');
    if (bankBadge) bankBadge.textContent = colCount['bank'] || 0;

    // 4. רינדור כרטיסיות
    const cols = ['col-friday-night','col-friday-evening','col-saturday-lunch','col-third-meal'];
    const colLabels = {
        'col-friday-night': 'כניסת שבת',
        'col-friday-evening': 'ערב שבת',
        'col-saturday-lunch': 'צהריים שבת',
        'col-third-meal': 'סעודה שלישית'
    };

    schedule.forEach(item => {
        const loc = (item.location && document.getElementById(item.location)) ? item.location : 'bank';
        const colors = colColors[loc] || colColors['bank'];

        // כפתורי שיבוץ למובייל
        const assignBtns = loc === 'bank' ? cols.map(cid => `
            <button onclick="assignActivity('${item.id}', '${cid}')" 
                class="text-[10px] bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 px-2 py-0.5 rounded-full transition font-semibold">
                → ${colLabels[cid]}
            </button>`).join('') : `
            <button onclick="assignActivity('${item.id}', 'bank')" 
                class="text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-700 px-2 py-0.5 rounded-full transition font-semibold">
                ↩ החזר לבנק
            </button>`;

        const itemHtml = `
            <div id="act_${item.id}" draggable="true" ondragstart="drag(event)"
                 class="bg-white p-3 rounded-xl shadow-sm cursor-move text-sm font-semibold border-r-4 ${colors.border} flex flex-col gap-1.5 overflow-hidden hover:shadow-md transition">
                <div class="font-bold leading-tight break-words text-slate-800">${item.title}</div>
                ${item.speaker ? `<div class="text-[10px] text-slate-500 flex items-center gap-1">👤 ${item.speaker}</div>` : ''}
                ${item.time ? `<div class="text-[10px] text-indigo-600 font-bold">🕐 ${item.time}</div>` : ''}
                <div class="flex flex-wrap gap-1 mt-1 sm:hidden">${assignBtns}</div>
                <div class="flex flex-wrap gap-1 mt-1 hidden sm:flex">${assignBtns}</div>
                <button onclick="deleteScheduleItem('${item.id}')" class="text-red-300 hover:text-red-500 text-[10px] self-start transition">🗑️ מחק</button>
            </div>
        `;

        const targetContainer = document.getElementById(loc === 'bank' ? 'activity-bank' : loc);
        if (targetContainer) {
            // הסר hint ריק אם קיים
            const hint = targetContainer.querySelector('.empty-hint, .col-empty-hint');
            if (hint) hint.remove();
            targetContainer.insertAdjacentHTML('beforeend', itemHtml);
        }
    });

    // 5. הצג hint בעמודות ריקות
    cols.forEach(colId => {
        const col = document.getElementById(colId);
        if (col && !col.querySelector('[id^="act_"]')) {
            const existing = col.querySelector('.col-empty-hint');
            if (!existing) {
                col.insertAdjacentHTML('beforeend', `<p class="col-empty-hint text-xs text-slate-300 text-center mt-6">גרור פעילות לכאן</p>`);
            }
        }
    });
    if (bankEl && !bankEl.querySelector('[id^="act_"]')) {
        bankEl.innerHTML = `<div class="col-span-full text-center text-slate-400 text-xs py-4 empty-hint">אין פעילויות בבנק — הוסיפו למעלה</div>`;
    }
}

function assignActivity(activityId, targetColId) {
    const item = schedule.find(s => s.id === activityId);
    if (!item) return;
    item.location = targetColId;
    saveLocalState();
    renderSchedule();
    if (isCloudConnected && db) {
        dbUpdate('schedule', activityId, { location: targetColId });
    }
    showToast("הפעילות שובצה! ✅");
}

function showScheduleSummary() {
    const modal = document.getElementById('scheduleSummaryModal');
    const content = document.getElementById('scheduleSummaryContent');
    if (!modal || !content) return;

    const cols = [
        { id: 'col-friday-night',   label: '🕯️ כניסת שבת' },
        { id: 'col-friday-evening', label: '🍷 ערב שבת' },
        { id: 'col-saturday-lunch', label: '☀️ צהריים שבת' },
        { id: 'col-third-meal',     label: '🥧 סעודה שלישית' },
        { id: 'bank',               label: '🏦 בנק (לא שובץ)' }
    ];

    content.innerHTML = cols.map(col => {
        const items = schedule.filter(s => {
            const loc = (s.location && document.getElementById(s.location)) ? s.location : 'bank';
            return loc === col.id;
        });
        if (items.length === 0) return '';
        return `
            <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <h4 class="font-extrabold text-slate-800 mb-2">${col.label}</h4>
                <div class="space-y-1">
                    ${items.map(i => `
                        <div class="flex items-center gap-2 text-xs text-slate-700">
                            ${i.time ? `<span class="font-bold text-indigo-600 w-10">${i.time}</span>` : '<span class="w-10"></span>'}
                            <span class="font-semibold">${i.title}</span>
                            ${i.speaker ? `<span class="text-slate-400">— ${i.speaker}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    modal.classList.remove('hidden');
}

function copyScheduleSummary() {
    const cols = [
        { id: 'col-friday-night',   label: '🕯️ כניסת שבת' },
        { id: 'col-friday-evening', label: '🍷 ערב שבת' },
        { id: 'col-saturday-lunch', label: '☀️ צהריים שבת' },
        { id: 'col-third-meal',     label: '🥧 סעודה שלישית' }
    ];
    let text = "📋 לו\"ז שבת בר המצווה — אמיתי\n\n";
    cols.forEach(col => {
        const items = schedule.filter(s => {
            const loc = (s.location && document.getElementById(s.location)) ? s.location : 'bank';
            return loc === col.id;
        });
        if (items.length === 0) return;
        text += `${col.label}\n`;
        items.forEach(i => {
            text += `  ${i.time ? i.time + ' ' : ''}${i.title}${i.speaker ? ' — ' + i.speaker : ''}\n`;
        });
        text += '\n';
    });
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast("הלו\"ז הועתק! 📋"));
    }
}

function switchTab(tabId) {
    currentTab = tabId;
    
    // הנה הרשימה המלאה של כל ה-IDs של הלשוניות שיש לך בדף
    const tabs = ['tasks', 'rsvp', 'shopping', 'rooms', 'budget', 'calls', 'recent', 'settings', 'logistics', 'menu', 'schedule'];
    
    tabs.forEach(id => {
        // הסתרת התוכן של כל הלשוניות
        const content = document.getElementById('content-' + id);
        if (content) content.classList.add('hidden');
        
        // הסרת העיצוב הפעיל מכל הכפתורים
        const btn = document.getElementById('tab-' + id);
        if (btn) {
            btn.className = "flex-1 min-w-[110px] py-3 px-2 text-center text-xs sm:text-sm font-semibold text-slate-500 transition hover:bg-slate-50 flex justify-center items-center gap-1.5 rounded-lg";
        }
    });

    // הצגת הלשונית שנבחרה
    const activeContent = document.getElementById('content-' + tabId);
    if (activeContent) activeContent.classList.remove('hidden');
    
    // סימון הכפתור שנלחץ כפעיל
    const activeBtn = document.getElementById('tab-' + tabId);
    if (activeBtn) {
        activeBtn.className = "tab-active flex-1 min-w-[110px] py-3 px-2 text-center text-xs sm:text-sm font-semibold transition hover:bg-slate-50 flex justify-center items-center gap-1.5 rounded-lg";
    }

    // קריאה לפונקציות הרינדור המתאימות
    if (tabId === 'tasks') renderTasks();
    else if (tabId === 'rsvp') renderRsvps();
    else if (tabId === 'shopping') renderShopping();
    else if (tabId === 'rooms') renderRooms();
    else if (tabId === 'menu') renderMenu();
    else if (tabId === 'budget') renderBudget();
    else if (tabId === 'calls') renderCalls();
    else if (tabId === 'schedule') renderSchedule();
    else if (tabId === 'recent') renderRecentTasks();
    else if (tabId === 'logistics') renderLogistics();

    // עדכון ניווט תחתון במובייל
    const mobTabs = ['tasks', 'rsvp', 'shopping', 'budget'];
    mobTabs.forEach(id => {
        const btn = document.getElementById('mob-tab-' + id);
        if (btn) {
            btn.className = id === tabId
                ? 'mob-tab-btn flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-indigo-600 font-bold flex-1'
                : 'mob-tab-btn flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-slate-400 flex-1';
        }
    });
    // כפתור "עוד" נשאר פעיל אם הטאב הנבחר לא בניווט הראשי
    const moreBtn = document.getElementById('mob-tab-more');
    if (moreBtn) {
        const isMainTab = mobTabs.includes(tabId);
        moreBtn.className = !isMainTab
            ? 'mob-tab-btn flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-indigo-600 font-bold flex-1'
            : 'mob-tab-btn flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-slate-400 flex-1';
    }
}

function closeToast() {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.add('hidden');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        const msg = document.getElementById('toastMessage');
        if (msg) msg.innerText = message;
        toast.classList.remove('hidden');
        const duration = message.length > 50 ? 7000 : 4000;
        setTimeout(closeToast, duration);
    }
}

function updateCountdown() {
    const dateStr = (typeof EVENT_CONFIG !== 'undefined') ? EVENT_CONFIG.eventDate : "2026-06-12T18:00:00";
    const targetDate = new Date(dateStr);
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        safeSetText('countdown', "זה קורה עכשיו! 🌟");
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days === 0) {
        safeSetText('countdown', `${hours} שעות ו-${minutes} דקות ⚡`);
    } else {
        safeSetText('countdown', `${days} ימים ו-${hours} שעות`);
    }
}

function closeWaModal() {
    const modal = document.getElementById('waModal');
    if (modal) modal.classList.add('hidden');
}

function generateWhatsAppNotification() {
    // חישוב התאריך של מחר בצורה דינמית
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // פורמט YYYY-MM-DD
    
    // משימות: או שחלפו (איחור), או שמיועדות למחר
    const urgentTasks = tasks.filter(t => {
        if (t.status === 'done') return false;
        if (!t.deadline) return false;
        // משימה היא דחופה אם התאריך שלה קטן או שווה למחר
        return t.deadline <= tomorrowStr;
    });

    if (urgentTasks.length === 0) {
        showToast("אין משימות דחופות או מתוכננות למחר! מעולה 🎉");
        return;
    }

    // בניית ההודעה
    let msg = `*תזכורת משימות - שבת בר מצווה אמיתי 🌟*\n`;
    msg += `מעודכן ל: ${tomorrowStr}\n\n`;
    
    urgentTasks.forEach((t, idx) => {
        const resp = t.responsible && t.responsible !== 'לא הוגדר' ? ` (אחראי: *${t.responsible}*)` : '';
        const dateLabel = t.deadline < tomorrowStr ? ` [באיחור!]` : '';
        msg += `${idx + 1}. *${t.title}*${resp}${dateLabel}\n`;
    });
    
    msg += `\nנעמה ונצר, בואו נסגור את הפינות האלו! בהצלחה ❤️`;
    
    currentWaText = msg;
    
    // עדכון ה-Textarea והצגת המודל
    const txtArea = document.getElementById('waMessageText');
    if (txtArea) txtArea.value = msg;
    
    const modal = document.getElementById('waModal');
    if (modal) modal.classList.remove('hidden');
}

function copyToClipboard() {
    const txt = document.getElementById('logSummaryText');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt.value).then(() => {
            showToast("הועתק ללוח! 📋");
        }).catch(() => {
            txt.select();
            document.execCommand('copy');
            showToast("הועתק ללוח! 📋");
        });
    } else {
        txt.select();
        document.execCommand('copy');
        showToast("הועתק ללוח! 📋");
    }
}

function closeLogSummary() {
    document.getElementById('logSummaryModal').classList.add('hidden');
}

function generateLogisticsSummary() {
    let msg = "📜 סיכום ציוד לשבת בר מצווה - אמיתי:\n\n";
    const destinations = [...new Set(logistics.map(l => l.destination))];
    
    destinations.forEach(dest => {
        msg += `📍 *${dest}:*\n`;
        const kits = logistics.filter(l => l.destination === dest);
        kits.forEach(k => {
            msg += `  📦 ${k.name} (${k.packed ? '✅' : '⏳'})\n`;
            k.items.forEach(it => { msg += `    ${it.checked ? '☑️' : '☐'} ${it.name}\n`; });
        });
        msg += "\n";
    });
    
    // הצגת המודל
    document.getElementById('logSummaryText').value = msg;
    document.getElementById('logSummaryModal').classList.remove('hidden');
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

async function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    let target = ev.target;
    
    // מציאת הריבוע (קונטיינר) אליו גררנו
    while (target && !target.id.startsWith('col-') && target.id !== 'bank') {
        target = target.parentElement;
    }
    
    if (target) {
        // עדכון הנתונים
        const activityId = data.replace('act_', '');
        const task = schedule.find(s => s.id === activityId);
        
        if (task) {
            // location: אם גררנו לבנק — שמור 'bank', אחרת שמור את id העמודה
            const newLocation = target.id === 'bank' ? 'bank' : target.id;
            task.location = newLocation;
            saveLocalState();
            
            // רינדור מחדש — מעדכן badges, hints וכפתורי שיבוץ
            renderSchedule();
            
            // עדכון ענן
            if (isCloudConnected && db) {
                dbUpdate('schedule', activityId, { location: newLocation });
            }
        }
        showToast("הפעילות שובצה! ✅");
    }
}




function toggleMoreMenu() {
    const menu = document.getElementById('moreMenu');
    const backdrop = document.getElementById('moreMenuBackdrop');
    if (!menu || !backdrop) return;
    const isHidden = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !isHidden);
    backdrop.classList.toggle('hidden', !isHidden);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.4s ease';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.classList.add('hidden'), 400);
    }
}

function filterRsvpList() {
    const query = (document.getElementById('rsvpSearch')?.value || '').toLowerCase().trim();
    // Filter table rows
    const rows = document.querySelectorAll('#rsvpTableBody tr');
    rows.forEach(row => {
        const name = row.cells[0]?.textContent?.toLowerCase() || '';
        row.style.display = (!query || name.includes(query)) ? '' : 'none';
    });
    // Filter mobile cards
    const cards = document.querySelectorAll('#rsvpCardsBody > div');
    cards.forEach(card => {
        const name = card.querySelector('.font-bold')?.textContent?.toLowerCase() || '';
        card.style.display = (!query || name.includes(query)) ? '' : 'none';
    });
}

let maxBudget = parseInt(localStorage.getItem('bm_maxBudget')) || 33000;

function updateMaxBudget(value) {
    const newMax = parseInt(value);
    if (!newMax || newMax < 1) return;
    maxBudget = newMax;
    localStorage.setItem('bm_maxBudget', maxBudget);
    const display = document.getElementById('budgetMaxDisplay');
    if (display) display.textContent = maxBudget.toLocaleString() + ' ₪';
    renderBudget();
}

// Undo delete support
let undoStack = [];

function showUndoToast(message, undoFn) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const msg = document.getElementById('toastMessage');
    if (msg) msg.innerHTML = `${message} <button onclick="(${undoFn.toString()})(); closeToast();" class="underline font-bold mr-2">↩ בטל</button>`;
    toast.classList.remove('hidden');
    setTimeout(closeToast, 6000);
}

// ─── ניטור חיבור לאינטרנט ───────────────────────────────
window.addEventListener('online', () => {
    const indicator = document.getElementById('syncStatusIndicator');
    if (isCloudConnected) return; // כבר מחובר לענן
    safeSetText('syncStatusText', "חיבור אינטרנט זוהה — מתחבר מחדש לענן...");
    if (indicator) indicator.className = "h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse";
    // נסה להתחבר מחדש לענן
    const savedConfig = localStorage.getItem('bm_firebaseConfig');
    if (savedConfig) {
        try { connectToFirebase(JSON.parse(savedConfig)); } catch(e) {}
    }
});

window.addEventListener('offline', () => {
    isCloudConnected = false;
    const indicator = document.getElementById('syncStatusIndicator');
    if (indicator) indicator.className = "h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse";
    safeSetText('syncStatusText', "⚠️ אין חיבור לאינטרנט — עובד במצב מקומי");
    showToast("⚠️ אין חיבור לאינטרנט. השינויים נשמרים במכשיר זה בלבד.");
});
