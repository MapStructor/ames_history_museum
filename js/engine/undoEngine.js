// undoEngine.js — in-session undo/redo for edit mode.
// pushUndo(undoFn, redoFn) — call before applying a change.
// Ctrl+Z / Ctrl+Y (or Ctrl+Shift+Z) trigger undo/redo.

var undoStack = [];
var redoStack = [];

function pushUndo(undoFn, redoFn) {
  undoStack.push({ undo: undoFn, redo: redoFn || null });
  redoStack = [];  // new action clears redo history
}

function clearUndoStack() {
  undoStack = [];
  redoStack = [];
}

async function performUndo() {
  if (!undoStack.length) return;
  var op = undoStack.pop();
  if (op.redo) redoStack.push(op);
  await op.undo();
}

async function performRedo() {
  if (!redoStack.length) return;
  var op = redoStack.pop();
  undoStack.push(op);
  await op.redo();
}

window.addEventListener('keydown', function(e) {
  if (!window.editMode) return;
  var tag = (document.activeElement || {}).tagName || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (!(e.ctrlKey || e.metaKey)) return;

  var isZ = e.key === 'z' || e.key === 'Z' || e.keyCode === 90;
  var isY = e.key === 'y' || e.key === 'Y' || e.keyCode === 89;

  if (isZ && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    if (undoStack.length) performUndo();
  } else if (isY || (isZ && e.shiftKey)) {
    e.preventDefault();
    e.stopPropagation();
    if (redoStack.length) performRedo();
  }
}, true);
