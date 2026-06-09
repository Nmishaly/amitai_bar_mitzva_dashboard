function esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

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

function attachSwipe(el, onSwipeRight) {
    if (!el) return;
    let startX = 0;
    el.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        el.style.transition = 'none';
    }, { passive: true });
    el.addEventListener('touchmove', e => {
        const dx = e.touches[0].clientX - startX;
        if (dx > 0) el.style.transform = `translateX(${Math.min(dx * 0.4, 28)}px)`;
    }, { passive: true });
    el.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        el.style.transition = 'transform 0.2s ease';
        el.style.transform = '';
        if (dx > 60) onSwipeRight();
    });
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
    // Exclude 'alon' category — it has its own tab, shouldn't skew main progress
    const mainTasks = tasks.filter(t => t.category !== 'alon');
    const totalTasks = mainTasks.length;
    const completedTasks = mainTasks.filter(t => t.status === 'done').length;
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
    safeSetText('statShopping', `${boughtShopping}/${totalShopping}`);

    const totalCalls = calls.length;
    const closedCalls = calls.filter(c => c.done).length;
    safeSetText('statCalls', `${closedCalls}/${totalCalls}`);

    // Days to event
    const daysEl = document.getElementById('statDaysLeft');
    const daysCard = document.getElementById('statDaysCard');
    if (daysEl) {
        const eventDate = new Date((typeof EVENT_CONFIG !== 'undefined') ? EVENT_CONFIG.eventDate : "2026-06-12T18:00:00");
        const daysLeft = Math.ceil((eventDate - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) {
            daysEl.textContent = '🎉 היום!';
            if (daysCard) daysCard.className = daysCard.className.replace('bg-indigo-50 border-indigo-100', 'bg-amber-50 border-amber-200');
        } else {
            daysEl.textContent = daysLeft;
            // Urgency coloring
            if (daysCard) {
                if (daysLeft <= 3) {
                    daysCard.className = 'flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-3 py-3';
                } else if (daysLeft <= 7) {
                    daysCard.className = 'flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-3';
                } else {
                    daysCard.className = 'flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-3';
                }
            }
        }
    }

    // Total guests from rsvps
    const totalGuests = rsvps.reduce((sum, g) => sum + g.adults + g.kids, 0);
    safeSetText('statGuests', totalGuests);

    // Event Day detection — show banner on June 12 and after
    const eventDayStart = new Date('2026-06-12T00:00:00');
    if (Date.now() >= eventDayStart.getTime()) {
        const banner = document.getElementById('eventDayBanner');
        if (banner) banner.classList.remove('hidden');
    }
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

    // Refresh TODAY_BASELINE dynamically each render
    TODAY_BASELINE.setTime(Date.now());
    TODAY_BASELINE.setHours(0, 0, 0, 0);

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
            // Render Normal View Mode — improved card design
            const formattedDate = task.deadline ? formatDateDisplay(task.deadline) : "ללא תאריך יעד";

            // Status-based styling
            const statusStyles = {
                'todo':     { border: 'border-r-slate-300',   bg: '',                    dot: '⚪' },
                'progress': { border: 'border-r-amber-400',   bg: 'bg-amber-50/40',      dot: '🟡' },
                'done':     { border: 'border-r-emerald-400', bg: 'bg-emerald-50/50',    dot: '✅' }
            };
            const style = statusStyles[task.status] || statusStyles['todo'];

            // Segmented control — active segment highlighted, others muted
            const seg = (val, label, activeClass) => {
                const isActive = task.status === val;
                return `<button onclick="updateTaskStatus('${task.id}', '${val}')"
                    class="px-2.5 py-1 text-[11px] font-bold transition-all rounded-md ${isActive ? activeClass : 'text-slate-400 hover:text-slate-600'}">
                    ${label}
                </button>`;
            };

            itemHtml = `
                <div class="flex border-r-4 ${style.border} ${style.bg} hover:brightness-95 transition-all duration-150">
                    <div class="flex-1 px-4 py-3 min-w-0">
                        <h4 class="font-bold text-sm leading-snug ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}">${esc(task.title)}</h4>
                        <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] px-2 py-0.5 rounded-full font-semibold">👤 ${esc(task.responsible || 'לא הוגדר')}</span>
                            <span class="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] px-2 py-0.5 rounded-full font-semibold">📅 ${esc(formattedDate)}</span>
                            ${task.notes ? `<span class="text-[11px] text-slate-400 truncate max-w-[200px]">📌 ${esc(task.notes)}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex flex-col items-end justify-between gap-2 px-3 py-3 shrink-0">
                        <!-- Segmented status control -->
                        <div class="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                            ${seg('todo',     '⚪ ממתין',  'bg-white text-slate-700 shadow-sm')}
                            ${seg('progress', '🟡 בתהליך', 'bg-amber-100 text-amber-800 shadow-sm')}
                            ${seg('done',     '✅ בוצע',   'bg-emerald-100 text-emerald-800 shadow-sm')}
                        </div>
                        <!-- Edit / Delete -->
                        <div class="flex items-center gap-1">
                            <button onclick="startEditTask('${task.id}')" class="p-1.5 text-slate-300 hover:text-indigo-600 transition rounded-md hover:bg-indigo-50" title="עריכת משימה">✏️</button>
                            <button onclick="deleteTask('${task.id}')" class="p-1.5 text-slate-300 hover:text-red-500 transition rounded-md hover:bg-red-50" title="מחיקת משימה">🗑️</button>
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
            subtitle: `${(e.totalAmount || 0).toLocaleString()} ₪`,
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
        const gMeals = g.meals || [];
        const mealsText = [];
        if (gMeals.includes('friday')) {
            mealsText.push('🍷 ערב שבת');
            countFriday += size;
            subAdultsFriday += g.adults;
            subKidsFriday += g.kids;
        }
        if (gMeals.includes('saturday')) {
            mealsText.push('⛪ בוקר');
            countSaturday += size;
            subAdultsSaturday += g.adults;
            subKidsSaturday += g.kids;
        }
        if (gMeals.includes('third')) {
            mealsText.push('🥧 שלישית');
            countThird += size;
            subAdultsThird += g.adults;
            subKidsThird += g.kids;
        }

        const DIETARY_ICONS = { vegetarian: '🥬', vegan: '🌱', 'gluten-free': '🚫', mehadrin: '✡️', allergy: '⚠️' };
        const dietBadge = g.dietary ? `<span class="ms-1.5 text-[9px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full whitespace-nowrap">${DIETARY_ICONS[g.dietary] || ''}</span>` : '';

        const rowHtml = `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-3 font-bold text-slate-800">${esc(g.name)}${dietBadge}</td>
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
        const DIETARY_ICONS_MOB = { vegetarian: '🥬 צמחוני', vegan: '🌱 טבעוני', 'gluten-free': '🚫 ללא גלוטן', mehadrin: '✡️ מהדרין', allergy: '⚠️ רגישות' };
        rsvps.forEach(g => {
            const size = g.adults + g.kids;
            const mealsText = [];
            const gMealsM = g.meals || [];
            if (gMealsM.includes('friday')) mealsText.push('🍷 ערב שבת');
            if (gMealsM.includes('saturday')) mealsText.push('⛪ בוקר');
            if (gMealsM.includes('third')) mealsText.push('🥧 שלישית');
            const dietLine = g.dietary ? `<div class="text-[10px] font-bold text-teal-700 mt-0.5">${DIETARY_ICONS_MOB[g.dietary] || g.dietary}</div>` : '';
            cardsBody.insertAdjacentHTML('beforeend', `
                <div class="p-4 flex justify-between items-start gap-2">
                    <div class="flex-1">
                        <div class="font-bold text-slate-800 text-sm">${esc(g.name)}</div>
                        <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                            <span>👨‍🦳 ${g.adults} מבוגרים</span>
                            <span>👶 ${g.kids} ילדים</span>
                            <span>${g.sleep === 'yes' ? '🏡 נשאר' : '🚗 לא נשאר'}</span>
                        </div>
                        <div class="text-xs text-indigo-600 font-semibold mt-1">${mealsText.join(' · ') || 'ללא ארוחות'}</div>
                        ${dietLine}
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

    // Auto-populate per-meal guest counts into the drink calculator
    safeSetValue('guestsFriday', countFriday);
    safeSetValue('guestsSaturday', countSaturday);
    safeSetValue('guestsThird', countThird);

    calculateDrinks();
}

function _renderShopItemRow(container, item) {
    const inBatchMode = typeof shopSelectMode !== 'undefined' && shopSelectMode;
    const isSelected = inBatchMode && typeof selectedShopItems !== 'undefined' && selectedShopItems.has(item.id);
    const freshBadge = item.isFresh
        ? `<button title="מוצר טרי — לחץ לשינוי" onclick="toggleShopItemFresh('${item.id}')" class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 transition">🌿 טרי</button>`
        : `<button title="מוצר יבש — לחץ לשינוי" onclick="toggleShopItemFresh('${item.id}')" class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200 transition">📦 יבש</button>`;

    if (inBatchMode) {
        const itemHtml = `
            <div class="p-4 flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}"
                 data-batch-id="${item.id}" onclick="toggleShopItemSelect('${item.id}')">
                <input type="checkbox" ${isSelected ? 'checked' : ''} class="w-5 h-5 rounded border-slate-300 text-indigo-600 pointer-events-none" readonly>
                <span class="text-sm font-medium ${item.bought ? 'line-through text-slate-400' : 'text-slate-800'} flex-1">${item.title}</span>
                ${item.bought ? '<span class="text-[10px] text-emerald-600 font-bold shrink-0">נרכש ✓</span>' : ''}
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    } else {
        const itemHtml = `
            <div class="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors gap-2" style="transition:transform 0.2s ease,background-color 0.15s;">
                <label class="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0">
                    <input type="checkbox" ${item.bought ? 'checked' : ''} onchange="toggleShopItem('${item.id}')" class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0">
                    <span class="text-sm font-medium ${item.bought ? 'line-through text-slate-400' : 'text-slate-800'} truncate">${item.title}</span>
                </label>
                <div class="flex items-center gap-1.5 shrink-0">
                    ${freshBadge}
                    <button onclick="deleteShopItem('${item.id}')" class="p-1.5 text-slate-300 hover:text-red-500 transition rounded-md hover:bg-red-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
        if (!item.bought) attachSwipe(container.lastElementChild, () => toggleShopItem(item.id));
    }
}

function renderShopping() {
    const container = document.getElementById('shoppingListContainer');
    if (!container) return;
    container.innerHTML = "";

    const viewMode = typeof shopViewMode !== 'undefined' ? shopViewMode : 'category';

    if (viewMode === 'freshness') {
        const freshItems = [...shopping].filter(item => item.isFresh).sort((a, b) => (a.bought ? 1 : 0) - (b.bought ? 1 : 0));
        const dryItems   = [...shopping].filter(item => !item.isFresh).sort((a, b) => (a.bought ? 1 : 0) - (b.bought ? 1 : 0));

        if (freshItems.length > 0) {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-green-50 px-4 py-2.5 font-bold text-xs text-green-900 border-y border-green-100 uppercase tracking-wider flex items-center gap-2">
                    🌿 מוצרים טריים — לקנות ביום חמישי לפני השבת
                </div>
            `);
            freshItems.forEach(item => _renderShopItemRow(container, item));
        }

        if (dryItems.length > 0) {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-amber-50 px-4 py-2.5 font-bold text-xs text-amber-900 border-y border-amber-100 uppercase tracking-wider flex items-center gap-2">
                    📦 מוצרים יבשים — אפשר לקנות מוקדם יותר
                </div>
            `);
            dryItems.forEach(item => _renderShopItemRow(container, item));
        }

        if (freshItems.length === 0 && dryItems.length === 0) {
            container.innerHTML = '<div class="p-6 text-center text-slate-400 text-sm">אין פריטים ברשימה</div>';
        }
    } else {
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

            container.insertAdjacentHTML('beforeend', `
                <div class="bg-slate-50/50 px-4 py-2 font-bold text-xs text-indigo-900 border-y border-slate-100 uppercase tracking-wider">
                    ${categories[catKey]}
                </div>
            `);

            const sortedItems = [...catItems].sort((a, b) => (a.bought ? 1 : 0) - (b.bought ? 1 : 0));
            sortedItems.forEach(item => _renderShopItemRow(container, item));
        });
    }

    calculateStats();
}

function renderRooms() {
    const container = document.getElementById('roomsContainer');
    if (!container) return;
    container.innerHTML = "";

    // Summary bar (always render, even when rooms is empty)
    const totalBeds     = rooms.reduce((sum, r) => sum + (parseInt(r.capacity) || 0), 0);
    const totalOccupied = rooms.reduce((sum, r) => sum + (r.guests ? r.guests.length : 0), 0);
    const totalFree     = totalBeds - totalOccupied;
    const summaryEl = document.getElementById('roomsSummary');
    if (summaryEl) {
        if (rooms.length === 0) {
            summaryEl.innerHTML = '';
        } else {
            const pct = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;
            summaryEl.innerHTML = `
                <div class="bg-white border border-purple-100 rounded-2xl px-5 py-4 mb-4 shadow-sm">
                    <div class="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <span class="text-sm font-extrabold text-purple-900">🏨 תפוסה כוללת בווילה</span>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-extrabold ${totalFree === 0 ? 'text-rose-600' : 'text-emerald-600'}">
                                ${totalFree === 0 ? '🔴 הווילה מלאה!' : `🟢 ${totalFree} מיטות פנויות`}
                            </span>
                            <button onclick="copyRoomsSummaryToClipboard()" class="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-lg transition">
                                📋 העתק לוואטסאפ
                            </button>
                        </div>
                    </div>
                    <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-purple-500'}"
                             style="width: ${pct}%"></div>
                    </div>
                    <div class="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
                        <span>${totalOccupied} תפוסות</span>
                        <span>${totalBeds} סה"כ מיטות</span>
                    </div>
                </div>
            `;
        }
    }

    // Unassigned banner — always computed regardless of villa rooms count
    const allAssigned = [
        ...rooms.flatMap(r => r.guests || []),
        ...(typeof externalLocations !== 'undefined' ? externalLocations.flatMap(l => l.guests || []) : [])
    ].map(n => n.trim().toLowerCase());
    const sleepingGuests = (typeof rsvps !== 'undefined' ? rsvps : []).filter(g => g.sleep === 'yes');
    const unassigned = sleepingGuests.filter(g => {
        const fullName = g.name.trim().toLowerCase();
        return !allAssigned.some(a => a.includes(fullName) || fullName.includes(a));
    });
    const banner = document.getElementById('unassignedBanner');
    const bannerText = document.getElementById('unassignedText');
    if (banner) {
        if (unassigned.length > 0) {
            banner.classList.remove('hidden');
            banner.classList.remove('bg-emerald-50', 'border-emerald-200');
            banner.classList.add('bg-rose-50', 'border-rose-200');
            if (bannerText) { bannerText.textContent = `${unassigned.length} אורח${unassigned.length > 1 ? 'ים' : ''} ממתינ${unassigned.length > 1 ? 'ים' : ''} לשיבוץ: ${unassigned.map(g => g.name).join(', ')}`; bannerText.className = 'text-sm font-bold text-rose-800'; }
        } else if (sleepingGuests.length > 0) {
            banner.classList.remove('hidden');
            banner.classList.remove('bg-rose-50', 'border-rose-200');
            banner.classList.add('bg-emerald-50', 'border-emerald-200');
            if (bannerText) { bannerText.textContent = '✅ כל האורחים הלנים שובצו!'; bannerText.className = 'text-sm font-bold text-emerald-800'; }
        } else {
            banner.classList.add('hidden');
        }
    }

    if (rooms.length === 0) {
        container.innerHTML = `
            <div class="col-span-full p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
                אין כרגע חדרים רשומים בוילה. הוסיפו חדר חדש למעלה!
            </div>
        `;
    }

    rooms.forEach(room => {
        const currentGuests = room.guests || [];
        const capacity      = parseInt(room.capacity) || 1;
        const occupiedCount = currentGuests.length;
        const freeCount     = Math.max(0, capacity - occupiedCount);
        const isFull        = occupiedCount >= capacity;

        // Bed grid: 🛏️ per occupied slot, ➕ per free slot
        const bedIcons = Array.from({ length: capacity }, (_, i) => {
            if (i < occupiedCount) {
                const guest = currentGuests[i];
                return `<div class="relative group flex flex-col items-center cursor-default">
                    <span class="text-xl" title="${guest}">🛏️</span>
                    <span class="text-[9px] text-purple-700 font-bold leading-none max-w-[44px] truncate text-center">${guest.split(' ')[0]}</span>
                    <button onclick="removeGuestFromRoom('${room.id}', ${i})"
                        class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold leading-none hidden group-hover:flex items-center justify-center">✕</button>
                </div>`;
            } else {
                return `<div class="flex flex-col items-center opacity-30">
                    <span class="text-xl">🛏️</span>
                    <span class="text-[9px] text-slate-400 font-bold leading-none">פנוי</span>
                </div>`;
            }
        }).join('');

        // Card border color by status
        const borderClass = isFull
            ? 'border-rose-200'
            : freeCount === capacity ? 'border-slate-200' : 'border-purple-200';

        const badgeBg = isFull
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200';

        const cardHtml = `
            <div class="bg-white rounded-2xl shadow-sm border ${borderClass} p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">

                <!-- Header -->
                <div class="flex items-start justify-between gap-2">
                    <div>
                        <h3 class="font-extrabold text-slate-800 text-sm leading-snug">${esc(room.name)}</h3>
                        <span class="inline-flex items-center gap-1 mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}">
                            ${isFull ? '🔴 מלא' : `🟢 ${freeCount} פנוי${freeCount !== 1 ? 'ות' : ''}`}
                            &nbsp;·&nbsp; ${occupiedCount}/${capacity} מיטות
                        </span>
                    </div>
                    <button onclick="deleteRoom('${room.id}')" class="text-slate-300 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50" title="מחק חדר">🗑️</button>
                </div>

                <!-- Bed grid -->
                <div class="flex flex-wrap gap-3 bg-slate-50 rounded-xl p-3 min-h-[64px] items-start">
                    ${bedIcons}
                </div>

                <!-- Add guest -->
                <div class="flex gap-2">
                    <input type="text"
                        id="guestInput_${room.id}"
                        placeholder="${isFull ? 'החדר מלא' : 'שם האורח לשיבוץ...'}"
                        ${isFull ? 'disabled' : ''}
                        onkeydown="if(event.key==='Enter') addGuestToRoom('${room.id}')"
                        class="flex-1 p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none ${isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'}">
                    <button onclick="addGuestToRoom('${room.id}')"
                        ${isFull ? 'disabled' : ''}
                        class="font-bold px-3 py-2 rounded-lg text-xs transition shadow-sm
                               ${isFull ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}">
                        שבץ
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    }); // end rooms.forEach

    // ─── מיקומים חיצוניים ───────────────────────────────────
    const extSection = document.getElementById('externalLocationsSection');
    const extContainer = document.getElementById('externalLocationsContainer');
    const extLocs = (typeof externalLocations !== 'undefined') ? externalLocations : [];

    if (extSection && extContainer) {
        extContainer.innerHTML = '';
        if (extLocs.length === 0) {
            extSection.classList.add('hidden');
        } else {
            extSection.classList.remove('hidden');
            extLocs.forEach(loc => {
                const guests = loc.guests || [];
                const guestChips = guests.map((g, i) => `
                    <div class="relative group flex flex-col items-center cursor-default">
                        <span class="text-xl">🏠</span>
                        <span class="text-[9px] text-teal-700 font-bold leading-none max-w-[44px] truncate text-center">${g.split(' ')[0]}</span>
                        <button onclick="removeGuestFromExtLocation('${loc.id}', ${i})"
                            class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold leading-none hidden group-hover:flex items-center justify-center">✕</button>
                    </div>`).join('');
                const emptySlots = guests.length === 0
                    ? `<span class="text-xs text-slate-400 italic">אין אורחים משובצים עדיין</span>`
                    : '';

                extContainer.insertAdjacentHTML('beforeend', `
                    <div class="bg-white rounded-2xl shadow-sm border border-teal-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <h3 class="font-extrabold text-teal-900 text-sm leading-snug">${esc(loc.name)}</h3>
                                <span class="text-[11px] font-bold text-teal-600 mt-0.5">🏘️ מיקום חיצוני · ${guests.length} אורחים</span>
                            </div>
                            <button onclick="deleteExternalLocation('${loc.id}')" class="text-slate-300 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50">🗑️</button>
                        </div>
                        <div class="flex flex-wrap gap-3 bg-teal-50/60 rounded-xl p-3 min-h-[56px] items-start">
                            ${guestChips}${emptySlots}
                        </div>
                        <div class="flex gap-2">
                            <input type="text" id="extGuestInput_${loc.id}" placeholder="הוסף אורח..."
                                onkeydown="if(event.key==='Enter') addGuestToExtLocation('${loc.id}')"
                                class="flex-1 p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white">
                            <button onclick="addGuestToExtLocation('${loc.id}')"
                                class="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition shadow-sm">
                                שבץ
                            </button>
                        </div>
                    </div>
                `);
            });
        }
    }

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
                            <h3 class="font-extrabold text-slate-800 text-sm">${esc(call.title)}</h3>
                            <p class="text-xs text-indigo-600 font-semibold mt-0.5">${esc(call.subtitle)}</p>
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
            totalExpenses += (exp.totalAmount || 0);

            // חישוב כמה שולם בפועל מתוך כל תתי-התשלומים — defensive for legacy entries
            const expPaid = (exp.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
            totalPaid += expPaid;
            
            const remaining = (exp.totalAmount || 0) - expPaid;

            const itemHtml = `
                <div class="p-5 border-b border-slate-100 space-y-3" data-exp-id="${exp.id}">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="text-sm font-bold text-slate-800">${esc(exp.name)}</h4>
                            <p class="text-xs text-indigo-600 font-semibold mt-0.5">סה"כ: ${(exp.totalAmount || 0).toLocaleString()} ₪</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="addPaymentToExpense('${exp.id}')" class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold">➕ הוסף תשלום</button>
                            <button onclick="deleteExpense('${exp.id}')" class="text-slate-300 hover:text-red-500 text-xs">מחק</button>
                        </div>
                    </div>
                    
                    <div class="bg-slate-50 p-3 rounded-xl space-y-1">
                        <span class="text-[10px] font-bold text-slate-500 uppercase">פירוט תשלומים:</span>
                        ${(exp.payments || []).map(p => `
                            <div class="flex justify-between text-xs text-slate-700">
                                <span>${p.date} (${p.method})</span>
                                <span class="font-bold">${(p.amount || 0).toLocaleString()} ₪</span>
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
    const progressPercent = Math.min(100, Math.round((totalExpenses / Math.max(1, currentMax)) * 100));
    
    safeSetText('budgetProgressPercent', `${progressPercent}% מנוצל`);
    
    const remaining = currentMax - totalExpenses;
    safeSetText('budgetRemainingAmount', remaining >= 0 ? `נותר: ${remaining.toLocaleString()} ₪` : `חריגה: ${Math.abs(remaining).toLocaleString()} ₪`);

    // עדכון ה-Progress Bar הוויזואלי
    const progressBar = document.getElementById('budgetProgressBar');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }

    // Budget donut chart
    const donutEl = document.getElementById('budgetDonut');
    if (donutEl) {
        const r = 52, cx = 70, cy = 70;
        const C = 2 * Math.PI * r;
        const safeMax = Math.max(1, currentMax);
        const expLen = Math.min(1, totalExpenses / safeMax) * C;
        const paidLen = Math.min(expLen, (totalPaid / safeMax) * C);
        donutEl.innerHTML = `
            <svg width="140" height="140" viewBox="0 0 140 140" style="transform:rotate(-90deg);display:block;">
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="14"/>
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f59e0b" stroke-width="14"
                    stroke-dasharray="${expLen.toFixed(2)} ${C.toFixed(2)}" stroke-linecap="round"/>
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#10b981" stroke-width="14"
                    stroke-dasharray="${paidLen.toFixed(2)} ${C.toFixed(2)}" stroke-linecap="round"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;">
                <span style="font-size:1.1rem;font-weight:800;color:#1e293b;line-height:1;">${Math.round(Math.min(100, (totalExpenses / safeMax) * 100))}%</span>
                <span style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-top:2px;letter-spacing:.05em;">מנוצל</span>
            </div>
        `;
        safeSetText('donutPaidLabel', totalPaid.toLocaleString() + ' ₪');
        safeSetText('donutCommittedLabel', Math.max(0, totalExpenses - totalPaid).toLocaleString() + ' ₪');
        safeSetText('donutRemainingLabel', Math.max(0, currentMax - totalExpenses).toLocaleString() + ' ₪');
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
        if (!btn) return;
        const isActive = id === tabId;
        const dot = btn.querySelector('.mob-tab-dot');
        if (isActive) {
            btn.className = 'mob-tab-btn flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-indigo-600 font-bold flex-1 relative';
            if (dot) dot.style.opacity = '1';
        } else {
            btn.className = 'mob-tab-btn flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-slate-400 flex-1 relative';
            if (dot) dot.style.opacity = '0';
        }
    });
    // כפתור "עוד" — פעיל אם הטאב הנבחר לא בניווט הראשי
    const moreBtn = document.getElementById('mob-tab-more');
    if (moreBtn) {
        const isMainTab = mobTabs.includes(tabId);
        const dot = moreBtn.querySelector('.mob-tab-dot');
        if (!isMainTab) {
            moreBtn.className = 'mob-tab-btn flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-indigo-600 font-bold flex-1 relative';
            if (dot) dot.style.opacity = '1';
        } else {
            moreBtn.className = 'mob-tab-btn flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-slate-400 flex-1 relative';
            if (dot) dot.style.opacity = '0';
        }
    }
}

let _toastTimer = null;

function closeToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.style.opacity = '';
        toast.style.transform = '';
    }, 200);
    if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }
}

// type: 'success' | 'warning' | 'error' | 'info' (default: auto-detect from message)
function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    // Auto-detect type from message content if not provided
    if (!type) {
        if (message.includes('❌') || message.includes('שגיאה') || message.includes('⚠️')) type = 'warning';
        else if (message.includes('נמחק') || message.includes('הוסר')) type = 'error';
        else type = 'success';
    }

    const icons = { success: '✅', warning: '⚠️', error: '🗑️', info: 'ℹ️' };
    const colors = {
        success: 'bg-slate-900 border-white/10',
        warning: 'bg-amber-900 border-amber-500/30',
        error:   'bg-rose-900 border-rose-500/30',
        info:    'bg-indigo-900 border-indigo-400/30'
    };

    const inner = toast.querySelector('div');
    if (inner) inner.className = `${colors[type] || colors.success} text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 border`;

    const iconEl = document.getElementById('toastIcon');
    const msgEl  = document.getElementById('toastMessage');
    if (iconEl) iconEl.textContent = icons[type] || '✅';
    if (msgEl)  msgEl.innerHTML = message;

    // Slide in
    toast.classList.remove('hidden');
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    requestAnimationFrame(() => {
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    if (_toastTimer) clearTimeout(_toastTimer);
    const duration = message.length > 50 ? 7000 : 4000;
    _toastTimer = setTimeout(closeToast, duration);
}

function showUndoToast(message, undoFn) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const inner = toast.querySelector('div');
    if (inner) inner.className = 'bg-slate-900 border-white/10 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 border';
    const iconEl = document.getElementById('toastIcon');
    const msgEl  = document.getElementById('toastMessage');
    if (iconEl) iconEl.textContent = '🗑️';
    if (msgEl)  msgEl.innerHTML = `${message} <button onclick="(${undoFn.toString()})(); closeToast();" class="underline font-bold text-amber-300 mr-2 hover:text-amber-100">↩ בטל</button>`;

    toast.classList.remove('hidden');
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    requestAnimationFrame(() => {
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(closeToast, 6000);
}

function updateCountdown() {
    const dateStr = (typeof EVENT_CONFIG !== 'undefined') ? EVENT_CONFIG.eventDate : "2026-06-12T18:00:00";
    const targetDate = new Date(dateStr);
    const now = new Date();
    const diff = targetDate - now;

    const widget = document.getElementById('countdownWidget');
    const cellsEl = document.getElementById('countdownCells');
    const labelEl = document.getElementById('cd-label');

    if (diff <= 0) {
        // האירוע כבר קרה — מצב חגיגה
        if (cellsEl) cellsEl.innerHTML = `<span class="text-3xl font-extrabold text-amber-300 animate-pulse">🎉 מזל טוב! 🎉</span>`;
        if (labelEl) labelEl.textContent = "שבת בר מצווה אמיתי — הרגע קורה!";
        if (widget) widget.classList.add('border-amber-400/60');
        return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // עדכון ספרות
    const pad = n => String(n).padStart(2, '0');
    const setCell = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = pad(val); };
    setCell('cd-days',    days);
    setCell('cd-hours',   hours);
    setCell('cd-minutes', minutes);

    // עדכון תווית + עיצוב לפי דחיפות
    if (widget) {
        widget.classList.remove('border-white/10', 'border-amber-400/60', 'border-red-400/80', 'ring-2', 'ring-red-400/40');
        if (days === 0) {
            // יום האחרון — אדום עם ring
            widget.classList.add('border-red-400/80', 'ring-2', 'ring-red-400/40');
            if (labelEl) labelEl.innerHTML = `<span class="text-red-300 font-bold animate-pulse">🔥 היום זה קורה!</span>`;
        } else if (days <= 3) {
            // 3 ימים אחרונים — כתום עז
            widget.classList.add('border-amber-400/60');
            if (labelEl) labelEl.innerHTML = `<span class="text-amber-300 font-semibold">⚡ ${days === 1 ? 'מחר זה יום גדול!' : `עוד ${days} ימים — כמעט שם!`}</span>`;
        } else if (days <= 7) {
            // שבוע אחרון — כתום עדין
            widget.classList.add('border-amber-400/60');
            if (labelEl) labelEl.textContent = `עוד שבוע — בואו נסגור את הפינות 💪`;
        } else {
            widget.classList.add('border-white/10');
            if (labelEl) labelEl.textContent = '';
        }
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
    const icon = document.getElementById('moreMenuIcon');
    if (!menu || !backdrop) return;

    const isHidden = menu.classList.contains('hidden');

    if (isHidden) {
        // פתיחה — slide up
        menu.classList.remove('hidden');
        backdrop.classList.remove('hidden');
        if (icon) icon.textContent = '✕';
        requestAnimationFrame(() => {
            menu.style.transform = 'translateY(0)';
            menu.style.opacity = '1';
        });
    } else {
        // סגירה — slide down
        if (icon) icon.textContent = '⊞';
        menu.style.transform = 'translateY(100%)';
        menu.style.opacity = '0';
        backdrop.classList.add('hidden');
        setTimeout(() => menu.classList.add('hidden'), 250);
    }
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
    // Sync to cloud so all devices see the same budget
    if (typeof isCloudConnected !== 'undefined' && isCloudConnected && typeof db !== 'undefined' && db) {
        dbUpdate('_settings', 'app', { maxBudget: newMax });
    }
}

// Undo delete support
let undoStack = [];

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
