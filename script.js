
function updateClock() {
    const now = new Date();
    
    // Format Time strings
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock-time').textContent = `${hours}:${minutes}:${seconds}`;
    
    // Format Date strings
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', options);
}
setInterval(updateClock, 1000);
updateClock(); // Initialize execution immediately on boot


const calcOutput = document.getElementById('calc-output');
const calcHistory = document.getElementById('calc-history');
let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetDisplay = false;

function clearCalc() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    calcOutput.textContent = '0';
    calcHistory.textContent = '';
}

function appendNumber(number) {
    if (currentInput === '0' || shouldResetDisplay) {
        currentInput = number;
        shouldResetDisplay = false;
    } else {
        currentInput += number;
    }
    calcOutput.textContent = currentInput;
}

function appendDecimal(dot) {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    if (!currentInput.includes(dot)) {
        currentInput += dot;
    }
    calcOutput.textContent = currentInput;
}

function appendOperator(op) {
    if (operator !== null) calculateResult();
    previousInput = currentInput;
    operator = op;
    calcHistory.textContent = `${previousInput} ${getOpSymbol(op)}`;
    shouldResetDisplay = true;
}

function getOpSymbol(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
}

function calculateResult() {
    if (operator === null || shouldResetDisplay) return;
    
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return;

    switch (operator) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': 
            if (current === 0) {
                alert("Cannot divide by zero!");
                clearCalc();
                return;
            }
            result = prev / current; 
            break;
        default: return;
    }

   
    result = Math.round(result * 1000000) / 1000000;

    calcHistory.textContent = `${previousInput} ${getOpSymbol(operator)} ${currentInput} =`;
    currentInput = String(result);
    operator = null;
    calcOutput.textContent = currentInput;
}


const noteForm = document.getElementById('note-form');
const noteTitleInput = document.getElementById('note-title');
const noteBodyInput = document.getElementById('note-body');
const notesContainer = document.getElementById('notes-container');
const noteCountBadge = document.getElementById('note-count');

let notes = JSON.parse(localStorage.getItem('dashboard_notes')) || [];

function saveNotes() {
    localStorage.setItem('dashboard_notes', JSON.stringify(notes));
    renderNotes();
}

function renderNotes() {
    notesContainer.innerHTML = '';
    noteCountBadge.textContent = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="text-center py-8 text-slate-600 text-sm border border-dashed border-slate-800 rounded-2xl">
                <i class="fa-regular fa-folder-open text-2xl mb-2 block"></i>
                No notes yet. Clear your mind!
            </div>`;
        return;
    }

    notes.forEach((note, index) => {
        const noteEl = document.createElement('div');
        noteEl.className = 'bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl flex justify-between items-start gap-4 hover:border-slate-700/50 transition duration-150';
        noteEl.innerHTML = `
            <div class="flex-grow">
                <h3 class="text-sm font-semibold text-slate-200 mb-0.5">${escapeHTML(note.title)}</h3>
                <p class="text-xs text-slate-400 leading-relaxed break-all">${escapeHTML(note.body)}</p>
            </div>
            <button onclick="deleteNote(${index})" class="text-slate-500 hover:text-rose-400 p-1 transition" title="Delete Note">
                <i class="fa-regular fa-trash-can text-sm"></i>
            </button>
        `;
        notesContainer.appendChild(noteEl);
    });
}

// Add Note Form Handlers
noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = noteTitleInput.value.trim();
    const body = noteBodyInput.value.trim();

    if (title && body) {
        notes.unshift({ title, body }); // Insert at array index 0 for newest view order
        saveNotes();
        noteForm.reset();
        noteTitleInput.focus();
    }
});

function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
}

// Security sanitization method protecting against structural DOM injection attacks (XSS)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Initialize note rendering configuration on page bootup
renderNotes();



document.addEventListener('keydown', (event) => {
    // If the user is currently typing inside the Notes form, don't trigger the calculator
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }

    const key = event.key;

    // Map numbers 0-9
    if (/[0-9]/.test(key)) {
        event.preventDefault();
        appendNumber(key);
    }
    
    // Map decimals
    if (key === '.') {
        event.preventDefault();
        appendDecimal(key);
    }

    // Map operators
    if (key === '+' || key === '-' || key === '*' || key === '/') {
        event.preventDefault();
        appendOperator(key);
    }

    // Map Enter or Equals sign to calculate result
    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateResult();
    }

    // Map Backspace or Delete to Clear (C)
    if (key === 'Backspace' || key === 'Escape') {
        event.preventDefault();
        clearCalc();
    }
});