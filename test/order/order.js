(function () {

var files = [
  'roads.geojson',
  'buildings.geojson',
  'parcels.geojson',
  'rivers.geojson',
  'landmarks.geojson',
  'boundaries.geojson',
];

function render() {
  var list = document.getElementById('list');
  list.innerHTML = files.map(function (name) {
    return '<div class="file">' + esc(name) + '</div>';
  }).join('');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

render();

})();
