(function () {

var items = [
  { id: 1, type: 'harddrive', name: 'Macintosh HD', open: true, children: [
    { id: 2, type: 'folder', name: 'Roads', open: true, children: [
      { id: 3, type: 'file', name: 'roads.geojson' },
      { id: 4, type: 'file', name: 'highways.geojson' },
      { id: 5, type: 'file', name: 'railroads.geojson' },
    ]},
    { id: 6, type: 'file', name: 'buildings.geojson' },
    { id: 7, type: 'file', name: 'building_footprints.geojson' },
  ]},
  { id: 8, type: 'harddrive', name: 'External Drive', open: true, children: [
    { id: 9, type: 'folder', name: 'Water', open: true, children: [
      { id: 10, type: 'file', name: 'rivers.geojson' },
      { id: 11, type: 'file', name: 'lakes.geojson' },
    ]},
    { id: 12, type: 'file', name: 'parcels.geojson' },
  ]},
  { id: 13, type: 'file', name: 'landmarks.geojson' },
  { id: 14, type: 'file', name: 'points_of_interest.geojson' },
  { id: 15, type: 'file', name: 'boundaries.geojson' },
];

var dragId        = null;
var insertBeforeId = null;

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  document.getElementById('list').innerHTML = buildHTML(items, 0);
  attachItemListeners();
}

function buildHTML(arr, depth) {
  var html   = '';
  var indent = 12 + depth * 16;
  arr.forEach(function (item) {
    var isContainer = item.type === 'harddrive' || item.type === 'folder';
    html += '<div class="row ' + item.type + '" data-id="' + item.id + '"'
          + ' style="padding-left:' + indent + 'px" draggable="true">';
    if (isContainer) html += '<span class="toggle">' + (item.open ? '▾' : '▸') + '</span> ';
    html += esc(item.name) + '</div>';
    if (isContainer && item.open && item.children && item.children.length) {
      html += buildHTML(item.children, depth + 1);
    }
  });
  return html;
}

// ── Per-item listeners (re-attached each render) ───────────────────────────────
function attachItemListeners() {
  document.querySelectorAll('.row').forEach(function (el) {
    var id = +el.dataset.id;

    el.addEventListener('dragstart', function (e) {
      dragId = id;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(function () { el.classList.add('dragging'); }, 0);
    });

    el.addEventListener('dragend', function () {
      dragId = null;
      el.classList.remove('dragging');
      clearIndicator();
    });

    var toggle = el.querySelector('.toggle');
    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var found = findItem(id);
        if (found) found.item.open = !found.item.open;
        render();
      });
    }
  });
}

// ── Container listeners (set up once) ────────────────────────────────────────
function init() {
  var list = document.getElementById('list');

  list.addEventListener('dragover', function (e) {
    e.preventDefault();
    if (dragId === null) return;

    var els    = Array.from(list.querySelectorAll('.row:not(.dragging)'));
    var cursor = e.clientY;
    var newId  = null;

    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (cursor < r.top + r.height / 2) { newId = +els[i].dataset.id; break; }
    }

    if (newId === insertBeforeId) return;
    insertBeforeId = newId;
    clearIndicator();

    if (insertBeforeId !== null) {
      var target = list.querySelector('[data-id="' + insertBeforeId + '"]');
      if (target) target.classList.add('drop-before');
    } else {
      list.classList.add('drop-after-last');
    }
  });

  list.addEventListener('dragleave', function (e) {
    if (!list.contains(e.relatedTarget)) { clearIndicator(); insertBeforeId = null; }
  });

  list.addEventListener('drop', function (e) {
    e.preventDefault();
    clearIndicator();
    if (dragId === null) return;
    moveItemBefore(dragId, insertBeforeId);
    insertBeforeId = null;
  });

  render();
}

function clearIndicator() {
  document.querySelectorAll('.drop-before').forEach(function (el) { el.classList.remove('drop-before'); });
  var list = document.getElementById('list');
  if (list) list.classList.remove('drop-after-last');
}

// ── Tree ops ──────────────────────────────────────────────────────────────────
function findItem(id, arr, parentType) {
  arr        = arr        || items;
  parentType = parentType || null;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return { item: arr[i], arr: arr, idx: i, parentType: parentType };
    if (arr[i].children) {
      var r = findItem(id, arr[i].children, arr[i].type);
      if (r) return r;
    }
  }
  return null;
}

function moveItemBefore(fromId, toId) {
  var from = findItem(fromId);
  if (!from) return;

  // No-op: already in this position
  if (toId === null) {
    if (from.arr === items && from.idx === items.length - 1) return;
  } else {
    var check = findItem(toId);
    if (check && check.arr === from.arr && check.idx === from.idx + 1) return;
  }

  from.arr.splice(from.idx, 1);

  if (toId === null) {
    items.push(from.item);
    render();
    return;
  }

  var to = findItem(toId);
  if (!to) { from.arr.splice(from.idx, 0, from.item); return; }

  if (from.item.type === 'harddrive' && to.parentType !== null) {
    from.arr.splice(from.idx, 0, from.item); return;
  }
  if (from.item.type === 'folder' && to.parentType === 'folder') {
    from.arr.splice(from.idx, 0, from.item); return;
  }

  to.arr.splice(to.idx, 0, from.item);
  render();
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();

})();
