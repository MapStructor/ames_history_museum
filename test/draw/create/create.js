(function () {

  // ── Config ──────────────────────────────────────────────────────────────────
  var MAPBOX_TOKEN  = mapboxToken;
  var SUPABASE_URL  = 'https://padavlcmwidjnhxzkhyb.supabase.co';
  var SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZGF2bGNtd2lkam5oeHpraHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzMzODEsImV4cCI6MjA5MjM0OTM4MX0.me5DqJgtSHBHKnZowf2AFIWqof-oydvly40Aeo6wC9o';

  // Layer colours — cycle through these for new layers
  var LAYER_COLORS = ['#4a9eff','#ff6b4a','#4aff9e','#ff4adb','#ffe04a','#4af0ff','#ff9e4a'];

  // ── State ───────────────────────────────────────────────────────────────────
  var db          = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var map         = null;
  var draw        = null;
  var projectId   = null;
  var userId      = null;
  var layers      = [];   // [{ id, name, type, color, visible, featureIds:[] }]
  var features    = {};   // { drawId: { label, notes, layerId } }
  var activeLayerId = null;
  var selectedDrawId = null;

  // ── Init ────────────────────────────────────────────────────────────────────
  mapboxgl.accessToken = MAPBOX_TOKEN;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 3,
    center: [-96, 38],
    hash: true
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: { polygon: true, line_string: true, point: true, trash: true }
  });
  map.addControl(draw, 'top-left');

  // Anonymous sign-in — no friction
  db.auth.getSession().then(function (res) {
    if (res.data.session) {
      userId = res.data.session.user.id;
    } else {
      db.auth.signInAnonymously().then(function (res2) {
        if (res2.data.session) userId = res2.data.session.user.id;
      });
    }
    afterAuth();
  });

  function afterAuth() {
    var urlId = new URLSearchParams(location.search).get('id');
    if (urlId) {
      loadProject(urlId);
    } else {
      autoCreateProject();
    }
  }

  async function autoCreateProject() {
    var result = await db.from('map_projects_testing').insert({
      user_id: userId,
      name: 'Untitled Map',
      layers_data: [],
      features_data: []
    }).select().single();
    if (result.error) { showToast('Could not initialize project'); return; }
    projectId = result.data.id;
    var url = new URL(location.href);
    url.searchParams.set('id', projectId);
    history.replaceState(null, '', url);
  }

  // ── Draw events ─────────────────────────────────────────────────────────────
  map.on('draw.create', function (e) {
    var feature = e.features[0];
    var geomType = feature.geometry.type; // Polygon, LineString, Point

    // Find or create a layer for this geometry type
    var targetLayer = layers.find(function (l) { return l.type === geomType && l.id === activeLayerId; });
    if (!targetLayer) {
      targetLayer = layers.find(function (l) { return l.type === geomType; });
    }
    if (!targetLayer) {
      targetLayer = createLayer(geomType);
    }

    features[feature.id] = { label: '', notes: '', layerId: targetLayer.id };
    targetLayer.featureIds.push(feature.id);
    setActiveLayer(targetLayer.id);
    renderLayerList();
    openFeaturePanel(feature.id);
  });

  map.on('draw.update', function (e) {
    // Geometry changed — nothing extra needed, draw handles rendering
  });

  map.on('draw.delete', function (e) {
    e.features.forEach(function (f) {
      removeFeatureFromState(f.id);
    });
    closeFeaturePanel();
    renderLayerList();
  });

  map.on('draw.selectionchange', function (e) {
    if (e.features.length === 0) {
      closeFeaturePanel();
    } else {
      openFeaturePanel(e.features[0].id);
    }
  });

  // ── Layer management ────────────────────────────────────────────────────────
  function createLayer(type) {
    var color = LAYER_COLORS[layers.length % LAYER_COLORS.length];
    var names = { Polygon: 'Polygons', LineString: 'Lines', Point: 'Points' };
    var layer = {
      id: 'layer-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      name: names[type] || type,
      type: type,
      color: color,
      visible: true,
      featureIds: []
    };
    layers.push(layer);
    activeLayerId = layer.id;
    renderLayerList();
    return layer;
  }

  function setActiveLayer(id) {
    activeLayerId = id;
    renderLayerList();
  }

  function removeFeatureFromState(drawId) {
    var meta = features[drawId];
    if (!meta) return;
    var layer = layers.find(function (l) { return l.id === meta.layerId; });
    if (layer) {
      layer.featureIds = layer.featureIds.filter(function (fid) { return fid !== drawId; });
    }
    delete features[drawId];
  }

  // ── Sidebar rendering ────────────────────────────────────────────────────────
  function renderLayerList() {
    var el = document.getElementById('layer-list');
    el.innerHTML = '';
    layers.forEach(function (layer) {
      var div = document.createElement('div');
      div.className = 'layer-item' + (layer.id === activeLayerId ? ' active' : '');
      div.dataset.id = layer.id;

      var chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'layer-visibility';
      chk.checked = layer.visible;
      chk.title = 'Toggle visibility';
      chk.addEventListener('change', function (e) {
        e.stopPropagation();
        toggleLayerVisibility(layer.id, chk.checked);
      });

      var swatch = document.createElement('div');
      swatch.className = 'layer-swatch';
      swatch.style.background = layer.color;

      var name = document.createElement('span');
      name.className = 'layer-name';
      name.textContent = layer.name;

      var count = document.createElement('span');
      count.className = 'layer-count';
      count.textContent = layer.featureIds.length || '';

      div.appendChild(chk);
      div.appendChild(swatch);
      div.appendChild(name);
      div.appendChild(count);

      div.addEventListener('click', function () { setActiveLayer(layer.id); });

      el.appendChild(div);
    });
  }

  function toggleLayerVisibility(layerId, visible) {
    var layer = layers.find(function (l) { return l.id === layerId; });
    if (!layer) return;
    layer.visible = visible;
    layer.featureIds.forEach(function (fid) {
      var feature = draw.get(fid);
      if (!feature) return;
      if (visible) {
        draw.add(feature);
      } else {
        draw.delete(fid);
      }
    });
  }

  // ── Feature panel ────────────────────────────────────────────────────────────
  function openFeaturePanel(drawId) {
    selectedDrawId = drawId;
    var meta = features[drawId];
    if (!meta) return;
    var layer = layers.find(function (l) { return l.id === meta.layerId; });

    document.getElementById('feature-panel-layer-name').textContent = layer ? layer.name : '';
    document.getElementById('feature-label').value = meta.label || '';
    document.getElementById('feature-notes').value = meta.notes || '';
    document.getElementById('feature-panel').classList.remove('hidden');
  }

  function closeFeaturePanel() {
    selectedDrawId = null;
    document.getElementById('feature-panel').classList.add('hidden');
  }

  document.getElementById('feature-panel-close').addEventListener('click', function () {
    draw.changeMode('simple_select');
    closeFeaturePanel();
  });

  document.getElementById('feature-label').addEventListener('input', function () {
    if (!selectedDrawId || !features[selectedDrawId]) return;
    features[selectedDrawId].label = this.value;
  });

  document.getElementById('feature-notes').addEventListener('input', function () {
    if (!selectedDrawId || !features[selectedDrawId]) return;
    features[selectedDrawId].notes = this.value;
  });

  document.getElementById('delete-feature-btn').addEventListener('click', function () {
    if (!selectedDrawId) return;
    draw.delete(selectedDrawId);
    removeFeatureFromState(selectedDrawId);
    closeFeaturePanel();
    renderLayerList();
  });

  // ── Add Layer button ─────────────────────────────────────────────────────────
  document.getElementById('add-layer-btn').addEventListener('click', function () {
    var name = prompt('Layer name:');
    if (!name) return;
    var type = prompt('Type (Polygon / LineString / Point):');
    var validTypes = ['Polygon', 'LineString', 'Point'];
    if (!validTypes.includes(type)) {
      showToast('Type must be Polygon, LineString, or Point');
      return;
    }
    var layer = createLayer(type);
    layer.name = name;
    renderLayerList();
  });

  // ── Project name ─────────────────────────────────────────────────────────────
  document.getElementById('project-name').addEventListener('blur', function () {
    // name saved on next save
  });

  // ── Save ─────────────────────────────────────────────────────────────────────
  document.getElementById('save-btn').addEventListener('click', saveProject);

  async function saveProject() {
    var name = document.getElementById('project-name').textContent.trim() || 'Untitled Map';
    var allFeatures = draw.getAll().features;

    var payload = {
      user_id: userId,
      name: name,
      layers_data: layers,
      features_data: allFeatures.map(function (f) {
        var meta = features[f.id] || {};
        return { ...f, properties: { ...f.properties, label: meta.label, notes: meta.notes, layerId: meta.layerId } };
      })
    };

    var result;
    if (projectId) {
      result = await db.from('map_projects_testing').update(payload).eq('id', projectId).select().single();
    } else {
      result = await db.from('map_projects_testing').insert(payload).select().single();
    }

    if (result.error) {
      showToast('Save failed: ' + result.error.message);
      return;
    }

    projectId = result.data.id;
    var url = new URL(location.href);
    url.searchParams.set('id', projectId);
    history.replaceState(null, '', url);
    showToast('Saved — ' + location.href);
  }

  // ── Load ─────────────────────────────────────────────────────────────────────
  async function loadProject(id) {
    var result = await db.from('map_projects_testing').select('*').eq('id', id).single();
    if (result.error || !result.data) { showToast('Project not found'); return; }

    var data = result.data;
    projectId = data.id;
    document.getElementById('project-name').textContent = data.name || 'Untitled Map';

    layers = data.layers_data || [];
    var savedFeatures = data.features_data || [];

    features = {};
    savedFeatures.forEach(function (f) {
      features[f.id] = {
        label: f.properties.label || '',
        notes: f.properties.notes || '',
        layerId: f.properties.layerId || ''
      };
    });

    draw.set({ type: 'FeatureCollection', features: savedFeatures });
    if (layers.length) activeLayerId = layers[layers.length - 1].id;
    renderLayerList();
    showToast('Project loaded');
  }

  // ── Toast ────────────────────────────────────────────────────────────────────
  var _toastTimer = null;
  function showToast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { el.classList.add('hidden'); }, 3000);
  }

})();
