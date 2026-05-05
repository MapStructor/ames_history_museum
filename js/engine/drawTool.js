// drawTool.js — MapboxDraw-based building creation for edit mode.
// initDrawTool() is called from activateEditMode() in editMode.js.
//
// Undo/redo design:
//   All undo/redo closures operate purely on in-memory state (promotedData + draw canvas).
//   Supabase persistence is fire-and-forget — visual correctness never depends on it.
//   Each feature gets a stable local key (UUID) at creation time. The Supabase feature_id
//   is tracked separately in _drawKeyToDbId and used only for DB sync.

var drawOverlayMap          = null;
var drawOverlayDraw         = null;
var editDrawPending         = null;   // MapboxDraw feature awaiting first save
var _camSyncing             = false;
var _geometryEditMode       = false;
var _editingLayer           = null;
var _editingDrawKey         = null;
var _editingOriginalFeature = null;
var _editingCurrentGeom     = null;   // tracks latest geometry for restore on close
var _suppressDrawDelete     = false;  // prevents deleteAll() re-triggering draw.delete
var _drawKeyToDbId          = {};     // localKey → Supabase feature_id (DB sync only)

// ─── key / DB-ID helpers ──────────────────────────────────────────────────────

function _newKey() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'dk-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Returns the Supabase feature_id for a local key.
// Falls back to parseInt for features loaded from DB whose localKey IS the feature_id string.
function _getDbId(localKey) {
  if (_drawKeyToDbId[localKey] !== undefined) return _drawKeyToDbId[localKey];
  var n = parseInt(localKey, 10);
  return isNaN(n) ? null : n;
}

// ─── source update helper ─────────────────────────────────────────────────────

function _updateSources(lid) {
  [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
    var src = pair[1].getSource(lid + '-promoted-' + pair[0]);
    if (src) src.setData(window.promotedData[lid]);
  });
}

// ─── geometry-edit helpers ────────────────────────────────────────────────────

function loadDrawnFeatureForEditing(layer, drawKey, geometry) {
  if (!drawOverlayDraw || !drawOverlayMap) return;
  _geometryEditMode   = true;
  _editingLayer       = layer;
  _editingDrawKey     = String(drawKey);
  _editingCurrentGeom = geometry;

  var lid = layer.id;
  _editingOriginalFeature = null;
  if (window.promotedData[lid]) {
    var kept = [];
    window.promotedData[lid].features.forEach(function(f) {
      if (String(f.properties._drawKey) === _editingDrawKey) {
        _editingOriginalFeature = f;
      } else {
        kept.push(f);
      }
    });
    window.promotedData[lid] = { type: 'FeatureCollection', features: kept };
    _updateSources(lid);
  }

  _suppressDrawDelete = true;
  drawOverlayDraw.deleteAll();
  _suppressDrawDelete = false;
  var ids    = drawOverlayDraw.add({ type: 'Feature', geometry: geometry, properties: {} });
  var drawId = ids[0];
  drawOverlayMap.getCanvas().style.pointerEvents = 'auto';
  raiseSlider();
  try {
    drawOverlayDraw.changeMode('direct_select', { featureId: drawId });
  } catch(e) {
    drawOverlayDraw.changeMode('simple_select', { featureIds: [drawId] });
  }
}

// Close geometry-edit state.
// saved=true  → feature was deleted or handled externally; do not restore to promoted layer.
// saved=false → restore to promoted layer using latest auto-saved geometry.
function clearDrawnFeatureEditing(saved) {
  if (!_geometryEditMode) return;
  _geometryEditMode = false;

  if (!saved && _editingOriginalFeature && _editingLayer) {
    var lid  = _editingLayer.id;
    var geom = _editingCurrentGeom || _editingOriginalFeature.geometry;
    var feat = Object.assign({}, _editingOriginalFeature, { geometry: geom });
    if (!window.promotedData[lid])
      window.promotedData[lid] = { type: 'FeatureCollection', features: [] };
    window.promotedData[lid].features.push(feat);
    _updateSources(lid);
  }

  _editingLayer           = null;
  _editingDrawKey         = null;
  _editingOriginalFeature = null;
  _editingCurrentGeom     = null;

  if (drawOverlayDraw) { _suppressDrawDelete = true; drawOverlayDraw.deleteAll(); _suppressDrawDelete = false; }
  if (drawOverlayMap)  drawOverlayMap.getCanvas().style.pointerEvents = 'none';
  lowerSlider();
}

function raiseSlider() {
  var el = document.querySelector('.mapboxgl-compare');
  if (el) el.style.zIndex = '150';
}

function lowerSlider() {
  var el = document.querySelector('.mapboxgl-compare');
  if (el) el.style.zIndex = '';
}

// ─── auto-save helpers ────────────────────────────────────────────────────────

// Called when a new polygon is completed.
// Adds to map immediately with a stable UUID key; Supabase insert is fire-and-forget.
function _autoSaveNewFeature(feature, layer) {
  var geom     = feature.geometry;
  var localKey = _newKey();
  var props    = { nid: null, label: null, DayStart: null, DayEnd: null };

  addDrawnFeature(layer, localKey, geom, props);

  var _state = window.infoPanelState && window.infoPanelState[layer.id];
  if (_state && typeof fetchAndRender === 'function') {
    _state.viewId   = localKey;
    _state.geometry = geom;
    _state.isOpen   = true;
    fetchAndRender(layer, Object.assign({}, props, { _drawKey: localKey }), geom);
    if (typeof floatPanelToTop     === 'function') floatPanelToTop(_state.divId);
    if (typeof openSidebarIfHidden === 'function') openSidebarIfHidden();
  }

  if (window.supabaseClient) {
    window.supabaseClient.from('features').insert({
      layer_id:  LIVE_LAYER_ID,
      source:    'drawn',
      geom_json: geom,
    }).select('feature_id, nid').then(function(result) {
      if (result.error) { console.error('[autosave new]', result.error); return; }
      var saved = result.data && result.data[0];
      if (saved) _drawKeyToDbId[localKey] = saved.feature_id;
    });
  }

  pushUndo(
    function() {
      // undo create — remove from map; close panel if open for this feature
      if (_geometryEditMode && _editingDrawKey === localKey) {
        clearDrawnFeatureEditing(true);
        if (typeof closePanelInfo === 'function') closePanelInfo(layer);
      }
      var lid = layer.id;
      if (window.promotedData[lid]) {
        window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
          return String(f.properties._drawKey) !== localKey;
        });
        _updateSources(lid);
      }
      var dbId = _getDbId(localKey);
      if (window.supabaseClient && dbId) {
        window.supabaseClient.from('features').delete().eq('feature_id', dbId)
          .then(function(r) {
            if (r.error) console.error('[undo new]', r.error);
            else if (_drawKeyToDbId[localKey] === dbId) delete _drawKeyToDbId[localKey];
          });
      }
    },
    function() {
      // redo create — add back to map with same local key
      addDrawnFeature(layer, localKey, geom, props);
      if (window.supabaseClient) {
        window.supabaseClient.from('features').insert({
          layer_id: LIVE_LAYER_ID, source: 'drawn', geom_json: geom,
        }).select('feature_id').then(function(result) {
          if (result.error) { console.error('[redo new]', result.error); return; }
          var saved = result.data && result.data[0];
          if (saved) _drawKeyToDbId[localKey] = saved.feature_id;
        });
      }
    }
  );
}

// Called on every draw.update while in geometry-edit mode.
// All state updates are synchronous; Supabase persistence is fire-and-forget.
function _autoSaveGeometryUpdate(newGeom) {
  var prevGeom = _editingCurrentGeom;
  var layer    = _editingLayer;
  var localKey = _editingDrawKey;

  _editingCurrentGeom = newGeom;
  if (_editingOriginalFeature)
    _editingOriginalFeature = Object.assign({}, _editingOriginalFeature, { geometry: newGeom });

  var dbId = _getDbId(localKey);
  if (window.supabaseClient && dbId) {
    window.supabaseClient.from('features')
      .update({ geom_json: newGeom }).eq('feature_id', dbId)
      .then(function(r) { if (r.error) console.error('[autosave geom]', r.error); });
  }

  function applyGeom(geom) {
    return function() {
      if (_geometryEditMode && _editingDrawKey === localKey) {
        // Feature is currently in the draw canvas — update it there
        _editingCurrentGeom = geom;
        if (_editingOriginalFeature)
          _editingOriginalFeature = Object.assign({}, _editingOriginalFeature, { geometry: geom });
        _suppressDrawDelete = true;
        drawOverlayDraw.deleteAll();
        _suppressDrawDelete = false;
        var ids = drawOverlayDraw.add({ type: 'Feature', geometry: geom, properties: {} });
        try { drawOverlayDraw.changeMode('direct_select', { featureId: ids[0] }); }
        catch(e) { drawOverlayDraw.changeMode('simple_select', { featureIds: [ids[0]] }); }
      } else {
        // Feature is in promotedData (closed or after undo-delete restored it)
        var lid = layer.id;
        if (window.promotedData[lid]) {
          window.promotedData[lid].features = window.promotedData[lid].features.map(function(f) {
            return String(f.properties._drawKey) === localKey
              ? Object.assign({}, f, { geometry: geom })
              : f;
          });
          _updateSources(lid);
        }
      }
      // DB sync using whatever ID is current at execution time
      var currentDbId = _getDbId(localKey);
      if (window.supabaseClient && currentDbId) {
        window.supabaseClient.from('features')
          .update({ geom_json: geom }).eq('feature_id', currentDbId)
          .then(function(r) { if (r.error) console.error('[undo/redo geom]', r.error); });
      }
    };
  }

  pushUndo(applyGeom(prevGeom), applyGeom(newGeom));
}

// ─── delete helper ───────────────────────────────────────────────────────────

function _deleteEditingFeature() {
  if (!_geometryEditMode || !_editingLayer || !_editingDrawKey) return;

  var layer        = _editingLayer;
  var localKey     = _editingDrawKey;
  var origFeat     = _editingOriginalFeature;
  var deletedGeom  = _editingCurrentGeom || (origFeat && origFeat.geometry);
  var deletedProps = origFeat ? origFeat.properties : {};

  // Clear edit state immediately — no awaiting
  clearDrawnFeatureEditing(true);
  if (typeof closePanelInfo === 'function') closePanelInfo(layer);

  // Fire-and-forget DB delete
  var dbId = _getDbId(localKey);
  if (window.supabaseClient && dbId) {
    window.supabaseClient.from('features').delete().eq('feature_id', dbId)
      .then(function(r) {
        if (r.error) console.error('[draw delete]', r.error);
        else if (_drawKeyToDbId[localKey] === dbId) delete _drawKeyToDbId[localKey];
      });
  }

  if (!deletedGeom) return;

  pushUndo(
    function() {
      // undo delete — restore to map with the same local key
      addDrawnFeature(layer, localKey, deletedGeom, Object.assign({}, deletedProps, { _drawKey: localKey }));
      // Fire-and-forget re-insert; update DB ID mapping when it resolves
      if (window.supabaseClient) {
        var insertData = { layer_id: LIVE_LAYER_ID, source: 'drawn', geom_json: deletedGeom };
        if (deletedProps.label)    insertData.label    = deletedProps.label;
        if (deletedProps.DayStart) insertData.DayStart = deletedProps.DayStart;
        if (deletedProps.DayEnd)   insertData.DayEnd   = deletedProps.DayEnd;
        window.supabaseClient.from('features').insert(insertData).select('feature_id')
          .then(function(result) {
            if (result.error) { console.error('[undo delete]', result.error); return; }
            var saved = result.data && result.data[0];
            if (saved) _drawKeyToDbId[localKey] = saved.feature_id;
          });
      }
    },
    function() {
      // redo delete — remove from map
      var lid = layer.id;
      if (window.promotedData[lid]) {
        window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
          return String(f.properties._drawKey) !== localKey;
        });
        _updateSources(lid);
      }
      var currentDbId = _getDbId(localKey);
      if (window.supabaseClient && currentDbId) {
        window.supabaseClient.from('features').delete().eq('feature_id', currentDbId)
          .then(function(r) {
            if (r.error) console.error('[redo delete]', r.error);
            else if (_drawKeyToDbId[localKey] === currentDbId) delete _drawKeyToDbId[localKey];
          });
      }
    }
  );
}

// ─── main init ────────────────────────────────────────────────────────────────

function initDrawTool() {
  var buildsLayer = null;
  flatLayers(layers).forEach(function(l) {
    if (l.id === 'curr-builds') buildsLayer = l;
  });
  if (!buildsLayer) return;

  var div = document.createElement('div');
  div.id = 'draw-overlay-map';
  document.body.appendChild(div);

  function positionOverlay() {
    var r = afterMap.getContainer().getBoundingClientRect();
    div.style.cssText = 'position:fixed;' +
      'top:'    + r.top                           + 'px;' +
      'bottom:' + (window.innerHeight - r.bottom) + 'px;' +
      'left:'   + r.left                          + 'px;' +
      'right:'  + (window.innerWidth  - r.right)  + 'px;' +
      'z-index:10;pointer-events:none;';
    if (drawOverlayMap) drawOverlayMap.resize();
  }
  positionOverlay();
  window.addEventListener('resize', positionOverlay);

  drawOverlayMap = new mapboxgl.Map({
    container: 'draw-overlay-map',
    style: { version: 8, sources: {}, layers: [] },
    center:  afterMap.getCenter(),
    zoom:    afterMap.getZoom(),
    bearing: afterMap.getBearing(),
    pitch:   afterMap.getPitch(),
    doubleClickZoom:  false,
    touchZoomRotate:  false,
    keyboard:         false,
    attributionControl: false,
  });

  // Bidirectional camera sync
  afterMap.on('move', function() {
    if (_camSyncing) return;
    _camSyncing = true;
    drawOverlayMap.jumpTo({ center: afterMap.getCenter(), zoom: afterMap.getZoom(),
      bearing: afterMap.getBearing(), pitch: afterMap.getPitch() });
    _camSyncing = false;
  });
  drawOverlayMap.on('move', function() {
    if (_camSyncing) return;
    _camSyncing = true;
    afterMap.jumpTo({ center: drawOverlayMap.getCenter(), zoom: drawOverlayMap.getZoom(),
      bearing: drawOverlayMap.getBearing(), pitch: drawOverlayMap.getPitch() });
    _camSyncing = false;
  });

  drawOverlayMap.on('style.load', function() {
    drawOverlayDraw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });
    var drawEl = drawOverlayDraw.onAdd(drawOverlayMap);

    var wrapper = document.createElement('div');
    wrapper.id = 'draw-toolbar-wrap';
    wrapper.appendChild(drawEl);
    document.body.appendChild(wrapper);

    // Intercept trash button in capture phase — in direct_select mode MapboxDraw's
    // built-in trash only removes vertices, never the whole feature, so we handle
    // deletion ourselves before MapboxDraw sees the click.
    wrapper.addEventListener('click', function(e) {
      if (!e.target.closest('.mapbox-gl-draw_trash')) return;
      if (!_geometryEditMode) return;
      e.stopPropagation();
      e.preventDefault();
      _deleteEditingFeature();
    }, true);

    drawOverlayMap.on('draw.modechange', function(e) {
      if (e.mode === 'draw_polygon') {
        drawOverlayMap.getCanvas().style.pointerEvents = 'auto';
        raiseSlider();
      } else if (e.mode === 'simple_select' && _geometryEditMode && !_suppressDrawDelete) {
        // Trash fires draw.modechange before draw.delete — if canvas is already empty,
        // deletion is in progress; skip. If features remain, user clicked off — close panel.
        if (drawOverlayDraw.getAll().features.length === 0) return;
        var layerToClose = _editingLayer;
        if (layerToClose && typeof closePanelInfo === 'function') {
          closePanelInfo(layerToClose);
        } else {
          clearDrawnFeatureEditing(false);
        }
      } else if (e.mode === 'simple_select' && !_geometryEditMode) {
        drawOverlayMap.getCanvas().style.pointerEvents = 'none';
        lowerSlider();
      }
    });

    // Polygon completed — save immediately and open the panel
    drawOverlayMap.on('draw.create', function(e) {
      var feature = e.features[0];
      drawOverlayMap.getCanvas().style.pointerEvents = 'none';
      lowerSlider();
      _suppressDrawDelete = true;
      drawOverlayDraw.deleteAll();
      _suppressDrawDelete = false;
      _autoSaveNewFeature(feature, buildsLayer);
    });

    // Feature moved/vertex edited before first save → update pending geometry.
    // Feature moved/vertex edited after first save (geometry edit mode) → auto-save immediately.
    drawOverlayMap.on('draw.update', function(e) {
      if (editDrawPending) {
        editDrawPending = e.features[0];
      } else if (_geometryEditMode && _editingLayer && _editingDrawKey) {
        _autoSaveGeometryUpdate(e.features[0].geometry);
      }
    });

    // Deselect with a pending new feature → auto-save it for the first time
    drawOverlayMap.on('draw.selectionchange', function(e) {
      if (e.features.length === 0 && editDrawPending && !_suppressDrawDelete) {
        var feature     = editDrawPending;
        editDrawPending = null;
        drawOverlayMap.getCanvas().style.pointerEvents = 'none';
        lowerSlider();
        _suppressDrawDelete = true;
        drawOverlayDraw.deleteAll();
        _suppressDrawDelete = false;
        _autoSaveNewFeature(feature, buildsLayer);
      }
    });

    // draw.delete fires if MapboxDraw deletes in simple_select mode (e.g. keyboard Delete key).
    // The trash button in direct_select mode is intercepted above; this is a fallback.
    drawOverlayMap.on('draw.delete', function() {
      if (_suppressDrawDelete) return;
      if (_geometryEditMode && _editingLayer && _editingDrawKey) {
        _deleteEditingFeature();
        return;
      }
      if (editDrawPending) {
        editDrawPending = null;
        drawOverlayMap.getCanvas().style.pointerEvents = 'none';
        lowerSlider();
      }
    });
  });
}
