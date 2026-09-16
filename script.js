/**
 * Study Task Planner — script.js
 *
 * Architecture:
 *   - `tasks`        : in-memory array — single source of truth.
 *   - `activeFilter` : currently selected filter ('all' | 'active' | 'completed').
 *   - Every mutation calls `persistTasks()` then `renderTasks()`.
 *   - `renderTasks()` is a pure re-render: clears the list and rebuilds it from state.
 */

'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'studyTasks';

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {{ id: string, title: string, dueDate: string, status: 'active'|'completed' }[]} */
let tasks = loadTasks();

/** @type {'all'|'active'|'completed'} */
let activeFilter = 'all';

// ─── DOM References ───────────────────────────────────────────────────────────

const taskForm     = document.getElementById('task-form');
const titleInput   = document.getElementById('task-title');
const dueDdInput   = document.getElementById('task-due-dd');
const dueMmInput   = document.getElementById('task-due-mm');
const dueYyyyInput = document.getElementById('task-due-yyyy');
const titleError   = document.getElementById('title-error');
const dueError     = document.getElementById('due-error');
const taskList     = document.getElementById('task-list');
const emptyState   = document.getElementById('empty-state');
const emptyMessage = document.getElementById('empty-message');
const filterTabs   = document.querySelectorAll('.filter-tab');

// ─── localStorage helpers ─────────────────────────────────────────────────────

/**
 * Load tasks from localStorage.
 * Falls back to an empty array if data is missing or corrupted.
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Validate that the stored value is an array of well-formed objects.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        typeof t.title === 'string' &&
        typeof t.dueDate === 'string' &&
        (t.status === 'active' || t.status === 'completed')
    );
  } catch {
    return [];
  }
}

/**
 * Persist the current `tasks` array to localStorage.
 */
function persistTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Quota exceeded or storage unavailable — silently degrade.
  }
}

// ─── ID Generation ────────────────────────────────────────────────────────────

// ─── Date Assembly Helper ─────────────────────────────────────────────────────

/**
 * Assemble and validate a YYYY-MM-DD string from separate DD, MM, YYYY fields.
 * Returns null if any part is missing or the date is not a real calendar date.
 * @param {string} dd
 * @param {string} mm
 * @param {string} yyyy
 * @returns {string|null}
 */
function buildISODate(dd, mm, yyyy) {
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  if (!dd || !mm || !yyyy) return null;
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2000 || y > 2100) return null;
  // Verify it is a real calendar date (e.g. rejects 31/02/2025)
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() + 1 !== m || date.getUTCDate() !== d) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(d)}`;
}

/**
 * Generate a unique string ID.
 * Uses crypto.randomUUID() when available, with a fallback for older browsers.
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random number
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

/**
 * Format a YYYY-MM-DD date string into a human-readable form, e.g. "15 Jul 2025".
 * Appends "(Overdue)" in red when the assignment is active and past due.
 *
 * @param {string} dateStr   - ISO date string YYYY-MM-DD.
 * @param {'active'|'completed'} status
 * @returns {{ display: string, overdue: boolean }}
 */
function formatDueDate(dateStr, status) {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Use UTC to avoid timezone shifts turning the date into the previous day.
  const date = new Date(Date.UTC(year, month - 1, day));
  const [y, m, d] = dateStr.split('-');
  const display = `${d}/${m}/${y}`;
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const overdue = status === 'active' && date < todayUTC;
  return { display, overdue };
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate the creation form.
 * Shows inline error messages and applies a red border class.
 * @returns {boolean} true if valid.
 */
function validateForm() {
  let valid = true;

  const titleValue = titleInput.value.trim();
  if (!titleValue) {
    showFieldError(titleInput, titleError, 'Assignment title is required.');
    valid = false;
  } else {
    clearFieldError(titleInput, titleError);
  }

  const isoDate = buildISODate(dueDdInput.value, dueMmInput.value, dueYyyyInput.value);
  if (!isoDate) {
    // Highlight all three date fields
    [dueDdInput, dueMmInput, dueYyyyInput].forEach((el) => el.classList.add('field-error'));
    dueError.textContent = 'Please enter a valid date in DD / MM / YYYY format.';
    dueError.classList.remove('hidden');
    valid = false;
  } else {
    [dueDdInput, dueMmInput, dueYyyyInput].forEach((el) => el.classList.remove('field-error'));
    dueError.textContent = '';
    dueError.classList.add('hidden');
  }

  return valid;
}

function showFieldError(input, errorEl, message) {
  input.classList.add('field-error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function clearFieldError(input, errorEl) {
  input.classList.remove('field-error');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
}

/** Clear all form errors (used when the user starts typing). */
function clearAllFormErrors() {
  clearFieldError(titleInput, titleError);
  [dueDdInput, dueMmInput, dueYyyyInput].forEach((el) => el.classList.remove('field-error'));
  dueError.textContent = '';
  dueError.classList.add('hidden');
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

/**
 * Add a new task to state, persist, and re-render.
 * @param {string} title
 * @param {string} dueDate
 */
function addTask(title, dueDate) {
  const task = {
    id: generateId(),
    title: title.trim(),
    dueDate,
    status: 'active',
  };
  tasks.unshift(task); // newest first
  persistTasks();
  renderTasks();
}

/**
 * Delete a task by ID.
 * @param {string} id
 */
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  persistTasks();
  renderTasks();
}

/**
 * Toggle a task's status between 'active' and 'completed'.
 * @param {string} id
 */
function toggleStatus(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.status = task.status === 'active' ? 'completed' : 'active';
  persistTasks();
  renderTasks();
}

/**
 * Save edits from the inline edit form.
 * @param {string} id
 * @param {string} newTitle
 * @param {string} newDueDate
 * @returns {{ ok: boolean, error?: string }} validation result
 */
function saveEdit(id, newTitle, newDueDate) {
  const trimmed = newTitle.trim();
  if (!trimmed) {
    return { ok: false, error: 'Title cannot be empty.' };
  }
  if (!newDueDate) {
    return { ok: false, error: 'Due date is required.' };
  }
  const task = tasks.find((t) => t.id === id);
  if (!task) return { ok: false, error: 'Task not found.' };
  task.title = trimmed;
  task.dueDate = newDueDate;
  persistTasks();
  renderTasks();
  return { ok: true };
}

// ─── Rendering ────────────────────────────────────────────────────────────────

/**
 * Full re-render of the task list based on current state and active filter.
 */
function renderTasks() {
  // Apply filter
  const filtered = tasks.filter((t) => {
    if (activeFilter === 'active')    return t.status === 'active';
    if (activeFilter === 'completed') return t.status === 'completed';
    return true;
  });

  // Clear current list
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    emptyMessage.textContent = getEmptyMessage();
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach((task) => {
    taskList.appendChild(createTaskCard(task));
  });
}

/**
 * Return an appropriate empty-state message for the active filter.
 * @returns {string}
 */
function getEmptyMessage() {
  if (activeFilter === 'active')    return 'No active assignments. Great work!';
  if (activeFilter === 'completed') return 'No completed assignments yet.';
  return 'No assignments yet. Add one above to get started.';
}

/**
 * Build a task card <li> element.
 * User-supplied text is set via .textContent (never innerHTML) to prevent XSS.
 *
 * @param {{ id: string, title: string, dueDate: string, status: 'active'|'completed' }} task
 * @returns {HTMLLIElement}
 */
function createTaskCard(task) {
  const li = document.createElement('li');
  li.className = `task-card${task.status === 'completed' ? ' completed-card' : ''}`;
  li.dataset.id = task.id;

  // ── Read view ────────────────────────────────────────────
  const readView = document.createElement('div');
  readView.className = 'read-view';

  // Top row: title + badge
  const topRow = document.createElement('div');
  topRow.className = 'flex items-start justify-between gap-3';

  const titleEl = document.createElement('p');
  titleEl.className = `text-sm font-semibold text-slate-800 leading-snug flex-1${task.status === 'completed' ? ' title-completed' : ''}`;
  titleEl.textContent = task.title;

  const badge = document.createElement('span');
  badge.className = `badge flex-shrink-0 ${task.status === 'active' ? 'badge-active' : 'badge-completed'}`;
  badge.textContent = task.status === 'active' ? 'Active' : 'Completed';

  topRow.appendChild(titleEl);
  topRow.appendChild(badge);

  // Due date row
  const { display, overdue } = formatDueDate(task.dueDate, task.status);
  const dueDateEl = document.createElement('p');
  dueDateEl.className = `text-xs mt-1 ${overdue ? 'text-red-500 font-semibold' : 'text-slate-400'}`;
  dueDateEl.textContent = overdue ? `Due: ${display} — Overdue` : `Due: ${display}`;

  // Action row
  const actionRow = document.createElement('div');
  actionRow.className = 'flex flex-wrap gap-2 mt-3';

  if (task.status === 'active') {
    actionRow.appendChild(createButton('✓ Complete', 'btn-icon btn-complete', () => toggleStatus(task.id), 'Mark as completed'));
  } else {
    actionRow.appendChild(createButton('↩ Restore',  'btn-icon btn-restore',  () => toggleStatus(task.id), 'Restore to active'));
  }

  actionRow.appendChild(createButton('✎ Edit',   'btn-icon btn-edit',   () => switchToEditView(li, task), 'Edit assignment'));
  actionRow.appendChild(createButton('✕ Delete', 'btn-icon btn-delete', () => confirmDelete(task.id, task.title), 'Delete assignment'));

  readView.appendChild(topRow);
  readView.appendChild(dueDateEl);
  readView.appendChild(actionRow);

  // ── Edit view (hidden by default) ────────────────────────
  const editView = createEditView(task);
  editView.classList.add('hidden');

  li.appendChild(readView);
  li.appendChild(editView);

  return li;
}

/**
 * Create an action button element.
 * @param {string} label      - Visible text.
 * @param {string} className
 * @param {Function} onClick
 * @param {string} ariaLabel
 * @returns {HTMLButtonElement}
 */
function createButton(label, className, onClick, ariaLabel) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;
  btn.textContent = label;
  btn.setAttribute('aria-label', ariaLabel);
  btn.addEventListener('click', onClick);
  return btn;
}

/**
 * Create a small number input for a date part (DD, MM, or YYYY) used in edit views.
 * @param {string} id
 * @param {string} min
 * @param {string} max
 * @param {string} placeholder
 * @param {string} value      - Pre-filled value (may be zero-padded from stored YYYY-MM-DD).
 * @param {string} ariaLabel
 * @returns {HTMLInputElement}
 */
function createEditDatePart(id, min, max, placeholder, value, ariaLabel) {
  const input = document.createElement('input');
  input.type = 'number';
  input.id = id;
  input.min = min;
  input.max = max;
  input.placeholder = placeholder;
  input.value = value ? String(parseInt(value, 10)) : '';
  input.setAttribute('aria-label', ariaLabel);
  // Width varies by field
  const isYear = placeholder === 'YYYY';
  input.className = `edit-input text-center${isYear ? ' w-20' : ' w-14'}`;
  return input;
}

/**
 * Build the inline edit view for a task card.
 * @param {{ id: string, title: string, dueDate: string }} task
 * @returns {HTMLDivElement}
 */
function createEditView(task) {
  const div = document.createElement('div');
  div.className = 'edit-view space-y-3';

  // Title input
  const titleLabel = document.createElement('label');
  titleLabel.className = 'block text-xs font-medium text-slate-500 mb-1';
  titleLabel.textContent = 'Assignment Title';
  const editTitleId = `edit-title-${task.id}`;
  titleLabel.setAttribute('for', editTitleId);

  const titleField = document.createElement('input');
  titleField.type = 'text';
  titleField.id = editTitleId;
  titleField.className = 'edit-input';
  titleField.value = task.title;
  titleField.setAttribute('aria-label', 'Edit assignment title');

  // Title error
  const editTitleError = document.createElement('p');
  editTitleError.className = 'hidden mt-1 text-xs text-red-600';
  editTitleError.setAttribute('role', 'alert');

  const titleGroup = document.createElement('div');
  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleField);
  titleGroup.appendChild(editTitleError);

  // Due date inputs (DD / MM / YYYY)
  const [storedY, storedM, storedD] = task.dueDate.split('-');

  const dateLabel = document.createElement('label');
  dateLabel.className = 'block text-xs font-medium text-slate-500 mb-1';
  dateLabel.textContent = 'Due Date (DD / MM / YYYY)';

  const editDdField   = createEditDatePart(`edit-dd-${task.id}`,   '1',    '31',   'DD', storedD, 'Edit day');
  const editMmField   = createEditDatePart(`edit-mm-${task.id}`,   '1',    '12',   'MM', storedM, 'Edit month');
  const editYyyyField = createEditDatePart(`edit-yyyy-${task.id}`, '2000', '2100', 'YYYY', storedY, 'Edit year');

  const dateParts = document.createElement('div');
  dateParts.className = 'flex items-center gap-1';

  const slash1 = document.createElement('span');
  slash1.className = 'text-slate-400 font-medium';
  slash1.textContent = '/';
  const slash2 = slash1.cloneNode(true);

  dateParts.appendChild(editDdField);
  dateParts.appendChild(slash1);
  dateParts.appendChild(editMmField);
  dateParts.appendChild(slash2);
  dateParts.appendChild(editYyyyField);

  // Date error
  const editDateError = document.createElement('p');
  editDateError.className = 'hidden mt-1 text-xs text-red-600';
  editDateError.setAttribute('role', 'alert');

  const dateGroup = document.createElement('div');
  dateGroup.appendChild(dateLabel);
  dateGroup.appendChild(dateParts);
  dateGroup.appendChild(editDateError);

  // Buttons
  const btnRow = document.createElement('div');
  btnRow.className = 'flex gap-2';

  const saveBtn = createButton('Save', 'btn-icon btn-save', () => {
    const isoDate = buildISODate(editDdField.value, editMmField.value, editYyyyField.value);
    const result = saveEdit(task.id, titleField.value, isoDate || '');
    if (!result.ok) {
      if (!titleField.value.trim()) {
        titleField.classList.add('field-error');
        editTitleError.textContent = 'Title cannot be empty.';
        editTitleError.classList.remove('hidden');
      }
      if (!isoDate) {
        [editDdField, editMmField, editYyyyField].forEach((el) => el.classList.add('field-error'));
        editDateError.textContent = 'Please enter a valid date in DD / MM / YYYY format.';
        editDateError.classList.remove('hidden');
      }
    }
  }, 'Save changes');

  const cancelBtn = createButton('Cancel', 'btn-icon btn-cancel', () => {
    // Re-render to discard any in-progress edit
    renderTasks();
  }, 'Cancel editing');

  btnRow.appendChild(saveBtn);
  btnRow.appendChild(cancelBtn);

  div.appendChild(titleGroup);
  div.appendChild(dateGroup);
  div.appendChild(btnRow);

  return div;
}

/**
 * Switch a task card from read view to edit view.
 * @param {HTMLLIElement} li
 */
function switchToEditView(li) {
  const readView = li.querySelector('.read-view');
  const editView = li.querySelector('.edit-view');
  readView.classList.add('hidden');
  editView.classList.remove('hidden');
  // Focus the title input for accessibility
  const titleInput = editView.querySelector('input[type="text"]');
  if (titleInput) titleInput.focus();
}

// ─── Delete Confirmation ──────────────────────────────────────────────────────

/**
 * Ask for confirmation before deleting.
 * Uses the native confirm dialog to keep the implementation simple.
 * @param {string} id
 * @param {string} title
 */
function confirmDelete(id, title) {
  if (window.confirm(`Delete "${title}"?\n\nThis action cannot be undone.`)) {
    deleteTask(id);
  }
}

// ─── Filter Tab Logic ─────────────────────────────────────────────────────────

/**
 * Activate a filter tab, update ARIA attributes, and re-render.
 * @param {'all'|'active'|'completed'} filter
 */
function setFilter(filter) {
  activeFilter = filter;
  filterTabs.forEach((tab) => {
    const isActive = tab.dataset.filter === filter;
    tab.classList.toggle('tab-active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  renderTasks();
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

// Form submission — add new task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  const isoDate = buildISODate(dueDdInput.value, dueMmInput.value, dueYyyyInput.value);
  addTask(titleInput.value, isoDate);
  // Reset form
  taskForm.reset();
  clearAllFormErrors();
  // Switch to 'all' filter so the new task is visible
  setFilter('all');
});

// Clear errors as user edits fields
titleInput.addEventListener('input', () => clearFieldError(titleInput, titleError));
[dueDdInput, dueMmInput, dueYyyyInput].forEach((el) => {
  el.addEventListener('input', () => {
    [dueDdInput, dueMmInput, dueYyyyInput].forEach((f) => f.classList.remove('field-error'));
    dueError.textContent = '';
    dueError.classList.add('hidden');
  });
});

// Filter tab clicks
filterTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    setFilter(tab.dataset.filter);
  });
});

// ─── Initialise ───────────────────────────────────────────────────────────────

renderTasks();
