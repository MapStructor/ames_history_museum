(function () {

var files = [
  'roads.geojson',
  'highways.geojson',
  'buildings.geojson',
  'building_footprints.geojson',
  'parcels.geojson',
  'rivers.geojson',
  'lakes.geojson',
  'landmarks.geojson',
  'points_of_interest.geojson',
  'boundaries.geojson',
  'neighborhoods.geojson',
  'zoning.geojson',
  'elevation.geojson',
  'railroads.geojson',
  'bike_paths.geojson',
];

var dragId        = null;
var insertBefore  = null; // index to insert before, null = end of list

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  var list = document.getElementById('list');
  list.innerHTML = files.map(function (name, i) {
    return '<div class="file" data-i="' + i + '" draggable="true">' + esc(name) + '</div>';
  }).join('');
  attachListeners();
}

// ── Listeners ─────────────────────────────────────────────────────────────────
function attachListeners() {
  var list = document.getElementById('list');

  list.querySelectorAll('.file').forEach(function (el) {
    el.addEventListener('dragstart', function (e) {
      dragId = +el.dataset.i;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(function () { el.classList.add('dragging'); }, 0);
    });
    el.addEventListener('dragend', function () {
      dragId = null;
      el.classList.remove('dragging');
      clearIndicator();
    });
  });

  list.addEventListener('dragover', function (e) {
    e.preventDefault();
    if (dragId === null) return;

    var els    = Array.from(list.querySelectorAll('.file:not(.dragging)'));
    var cursor = e.clientY;
    var newVal = null; // index in 'files' to insert before, null = end

    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (cursor < r.top + r.height / 2) {
        newVal = +els[i].dataset.i;
        break;
      }
    }

    if (newVal === insertBefore) return;
    insertBefore = newVal;
    clearIndicator();

    if (insertBefore !== null) {
      list.querySelector('[data-i="' + insertBefore + '"]').classList.add('drop-before');
    } else {
      list.classList.add('drop-after-last');
    }
  });

  list.addEventListener('dragleave', function (e) {
    if (!list.contains(e.relatedTarget)) {
      clearIndicator();
      insertBefore = null;
    }
  });

  list.addEventListener('drop', function (e) {
    e.preventDefault();
    clearIndicator();
    if (dragId === null) return;

    var item = files.splice(dragId, 1)[0];
    var dest = insertBefore === null ? files.length : (insertBefore > dragId ? insertBefore - 1 : insertBefore);
    files.splice(dest, 0, item);

    insertBefore = null;
    render();
  });
}

function clearIndicator() {
  document.querySelectorAll('.drop-before').forEach(function (el) {
    el.classList.remove('drop-before');
  });
  var list = document.getElementById('list');
  if (list) list.classList.remove('drop-after-last');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

render();

})();
