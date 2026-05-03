// drawTool.js — MapboxDraw-based building creation for edit mode.
// initDrawTool() is called from activateEditMode() in editMode.js.
//
// Auto-save behaviour:
//   New feature  — saved to Supabase when the user clicks off (deselects).
//   Geometry edit — saved to Supabase on every draw.update (vertex / move),
//                   so Ctrl+Z works immediately without clicking off.

var drawOverlayMap          = null;
var drawOverlayDraw         = null;
var editDrawPending         = null;   // MapboxDraw feature awaiting first save
var _camSyncing             = false;
var _geometryEditMode       = false;
var _editingLayer           = null;
var _editingDrawKey         = null;
var _editingOriginalFeature = null;
var _editingCurrentGeom     = null;   // tracks latest auto-saved geometry for restore
var _suppressDrawDelete     = false;  // prevents deleteAll() re-triggering draw.delete

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
    [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
      var src = pair[1].getSource(lid + '-promoted-' + pair[0]);
      if (src) src.setData(window.promotedData[lid]);
    });
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
// saved=true  → do not restore to promoted layer (feature was deleted or we handle it externally).
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
    [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
      var src = pair[1].getSource(lid + '-promoted-' + pair[0]);
      if (src) src.setData(window.promotedData[lid]);
    });
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

// Called when a new polygon is deselected for the first time.
async function _autoSaveNewFeature(feature, layer) {
  var geom = feature.geometry;

  var result = await window.supabaseClient.from('features').insert({
    layer_id:  LIVE_LAYER_ID,
    source:    'drawn',
    geom_json: geom,
  }).select('feature_id, nid');

  if (result.error) { console.error('[autosave new]', result.error); return; }

  var saved      = result.data && result.data[0];
  var featureKey = saved ? String(saved.feature_id) : ('tmp-' + Date.now());
  var featureId  = parseInt(featureKey, 10);
  var props      = { nid: saved && saved.nid, label: null, DayStart: null, DayEnd: null };

  addDrawnFeature(layer, featureKey, geom, props);

  pushUndo(
    async function() {
      // undo: remove from map + delete from Supabase
      var lid = layer.id;
      if (window.promotedData[lid]) {
        window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
          return String(f.properties._drawKey) !== featureKey;
        });
        [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
          var src = pair[1].getSource(lid + '-promoted-' + pair[0]);
          if (src) src.setData(window.promotedData[lid]);
        });
      }
      if (window.supabaseClient && !isNaN(featureId)) {
        var r = await window.supabaseClient.from('features').delete().eq('feature_id', featureId);
        if (r.error) console.error('[undo new feature]', r.error);
      }
    },
    async function() {
      // redo: re-insert and add to map
      var r2 = await window.supabaseClient.from('features').insert({
        layer_id: LIVE_LAYER_ID, source: 'drawn', geom_json: geom,
      }).select('feature_id, nid');
      if (r2.error) { console.error('[redo new feature]', r2.error); return; }
      var s2  = r2.data && r2.data[0];
      var k2  = s2 ? String(s2.feature_id) : ('tmp-' + Date.now());
      addDrawnFeature(layer, k2, geom, { nid: s2 && s2.nid, label: null, DayStart: null, DayEnd: null });
    }
  );
}

// Called on every draw.update while in geometry-edit mode.
// Saves immediately so Ctrl+Z works without clicking off.
async function _autoSaveGeometryUpdate(newGeom) {
  var prevGeom  = _editingCurrentGeom;
  var drawKey   = _editingDrawKey;
  var layer     = _editingLayer;
  var featureId = parseInt(drawKey, 10);

  if (!window.supabaseClient || isNaN(featureId)) return;

  var r = await window.supabaseClient.from('features')
    .update({ geom_json: newGeom })
    .eq('feature_id', featureId);
  if (r.error) { console.error('[autosave geom]', r.error); return; }

  // Advance the "current" pointer so the next undo-prev is this state
  _editingCurrentGeom = newGeom;
  if (_editingOriginalFeature)
    _editingOriginalFeature = Object.assign({}, _editingOriginalFeature, { geometry: newGeom });

  var capturedPrev = prevGeom;
  var capturedNext = newGeom;

  function applyGeom(geom) {
    // Update Supabase + draw canvas (if still editing) or promoted layer (if closed)
    return async function() {
      var r2 = await window.supabaseClient.from('features')
        .update({ geom_json: geom }).eq('feature_id', featureId);
      if (r2.error) { console.error('[undo/redo geom]', r2.error); return; }

      if (_geometryEditMode && _editingDrawKey === drawKey) {
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
        // Feature panel is closed — update in promoted layer
        var lid = layer.id;
        if (window.promotedData[lid]) {
          window.promotedData[lid].features = window.promotedData[lid].features.map(function(f) {
            return String(f.properties._drawKey) === drawKey
              ? Object.assign({}, f, { geometry: geom })
              : f;
          });
          [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
            var src = pair[1].getSource(lid + '-promoted-' + pair[0]);
            if (src) src.setData(window.promotedData[lid]);
          });
        }
      }
    };
  }

  pushUndo(applyGeom(capturedPrev), applyGeom(capturedNext));
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
  div.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10;pointer-events:none;';
  document.body.appendChild(div);

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

    // draw_polygon active → open canvas; escape before completing → close
    drawOverlayMap.on('draw.modechange', function(e) {
      if (e.mode === 'draw_polygon') {
        drawOverlayMap.getCanvas().style.pointerEvents = 'auto';
        raiseSlider();
      } else if (e.mode === 'simple_select' && !editDrawPending && !_geometryEditMode) {
        drawOverlayMap.getCanvas().style.pointerEvents = 'none';
        lowerSlider();
      }
    });

    // Polygon completed — keep canvas open so user can move it before clicking off
    drawOverlayMap.on('draw.create', function(e) {
      editDrawPending = e.features[0];
      drawOverlayMap.getCanvas().style.pointerEvents = 'auto';
      raiseSlider();
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

    // Trash button
    drawOverlayMap.on('draw.delete', async function() {
      if (_suppressDrawDelete) return;

      if (_geometryEditMode && _editingLayer && _editingDrawKey) {
        var layer     = _editingLayer;
        var drawKey   = _editingDrawKey;
        var numericId = parseInt(drawKey, 10);
        var origFeat  = _editingOriginalFeature;

        if (window.supabaseClient && !isNaN(numericId)) {
          var deletedGeom  = _editingCurrentGeom || (origFeat && origFeat.geometry);
          var deletedProps = origFeat ? origFeat.properties : {};
          var redoId       = { current: null };  // mutable ref so redo can re-delete

          pushUndo(
            async function() {
              if (!deletedGeom) return;
              var res = await window.supabaseClient.from('features').insert({
                layer_id: LIVE_LAYER_ID,
                label:    deletedProps.label    || null,
                DayStart: deletedProps.DayStart || null,
                DayEnd:   deletedProps.DayEnd   || null,
                source:   'drawn',
                geom_json: deletedGeom,
              }).select('feature_id, nid');
              if (res.error) { console.error('[undo delete]', res.error); return; }
              var s   = res.data && res.data[0];
              var key = s ? String(s.feature_id) : ('tmp-' + Date.now());
              redoId.current = s ? s.feature_id : null;
              addDrawnFeature(layer, key, deletedGeom,
                Object.assign({}, deletedProps, { _drawKey: key }));
            },
            async function() {
              if (!redoId.current) return;
              var lid = layer.id;
              var key = String(redoId.current);
              await window.supabaseClient.from('features').delete().eq('feature_id', redoId.current);
              if (window.promotedData[lid]) {
                window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
                  return String(f.properties._drawKey) !== key;
                });
                [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
                  var src = pair[1].getSource(lid + '-promoted-' + pair[0]);
                  if (src) src.setData(window.promotedData[lid]);
                });
              }
            }
          );

          var r = await window.supabaseClient.from('features').delete().eq('feature_id', numericId);
          if (r.error) { console.error('[draw delete]', r.error); return; }
        }
        clearDrawnFeatureEditing(true);
        if (typeof closePanelInfo === 'function') closePanelInfo(layer);
        return;
      }

      // Trash pressed on an in-progress (unsaved) new feature — just discard
      if (editDrawPending) {
        editDrawPending = null;
        drawOverlayMap.getCanvas().style.pointerEvents = 'none';
        lowerSlider();
      }
    });
  });
}
