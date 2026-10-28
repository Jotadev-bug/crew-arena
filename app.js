(function () {
  'use strict';

  const STORAGE_KEY = 'ascii-todo-tasks-v1';

  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const emptyMsg = document.getElementById('empty-msg');
  const counter = document.getElementById('counter');
  const clearDoneBtn = document.getElementById('clear-done');

  /** @type {{id: string, text: string, done: boolean}[]} */
  let tasks = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(isValidTask) : [];
    } catch (error) {
      console.warn('No se pudieron leer las tareas guardadas:', error);
      return [];
    }
  }

  function isValidTask(task) {
    return task && typeof task.id === 'string'
      && typeof task.text === 'string'
      && typeof task.done === 'boolean';
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.warn('No se pudieron guardar las tareas:', error);
    }
  }

  function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function render() {
    list.replaceChildren();

    tasks.forEach(function (task) {
      const item = document.createElement('li');
      item.className = 'task-item' + (task.done ? ' done' : '');
      item.dataset.id = task.id;

      const mark = document.createElement('span');
      mark.className = 'mark';
      mark.textContent = task.done ? '[x]' : '[ ]';

      const text = document.createElement('span');
      text.className = 'text';
      text.textContent = task.text;
      text.title = 'Clic para marcar / desmarcar';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.dataset.action = 'remove';
      removeBtn.textContent = '[X]';
      removeBtn.setAttribute('aria-label', 'Eliminar tarea');

      item.append(mark, text, removeBtn);
      list.appendChild(item);
    });

    emptyMsg.hidden = tasks.length > 0;

    const pending = tasks.filter(function (t) { return !t.done; }).length;
    counter.textContent = pending + ' pendientes / ' + tasks.length + ' total';
    clearDoneBtn.disabled = tasks.every(function (t) { return !t.done; });
  }

  function addTask(text) {
    const clean = text.trim();
    if (!clean) return;
    tasks.push({ id: createId(), text: clean, done: false });
    save();
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map(function (t) {
      return t.id === id ? { id: t.id, text: t.text, done: !t.done } : t;
    });
    save();
    render();
  }

  function removeTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    save();
    render();
  }

  function clearDone() {
    tasks = tasks.filter(function (t) { return !t.done; });
    save();
    render();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    addTask(input.value);
    input.value = '';
    input.focus();
  });

  list.addEventListener('click', function (event) {
    const itemEl = event.target.closest('.task-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;

    if (event.target.dataset.action === 'remove') {
      removeTask(id);
    } else if (event.target.classList.contains('text') || event.target.classList.contains('mark')) {
      toggleTask(id);
    }
  });

  clearDoneBtn.addEventListener('click', clearDone);

  render();
})();
