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
var _suppressModeClose      = false;  // prevents draw.modechange simple_select from closing panel during programmatic mode changes
var _drawKeyToDbId          = {};     // localKey → ames_buildings_2026.id
var _pendingState           = {};     // localKey → 'draft'|'inactive' — desired status when INSERT resolves
var _clipboard              = null;   // copied geometry for paste
var _splitMode              = false;  // true while draw_line_string mode is active for split
var _mergeMode              = false;  // true while waiting for user to pick second feature
var _mergeOverlay           = null;   // DOM overlay element for merge pick
var _editShortcutsAdded     = false;  // guard: add keyboard shortcuts only once

// ─── persistent log (survives page refresh via localStorage) ─────────────────

function _log(msg) {
  var entry = new Date().toISOString().slice(11, 23) + '  ' + msg;
  console.log('[draw]', msg);
  try {
    var stored = JSON.parse(localStorage.getItem('_drawLog') || '[]');
    stored.push(entry);
    if (stored.length > 300) stored = stored.slice(-300);
    localStorage.setItem('_drawLog', JSON.stringify(stored));
  } catch(e) {}
}

// Call _showLog() in the console to see the full log across refreshes.
window._showLog  = function() { (JSON.parse(localStorage.getItem('_drawLog') || '[]')).forEach(function(l){ console.log(l); }); };
window._clearLog = function() { localStorage.removeItem('_drawLog'); console.log('log cleared'); };

_log('--- page load ---');

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

// One-time INSERT into ames_buildings_2026 with status='draft'.
// Undo/redo uses _dbHide/_dbShow (status toggles) instead of re-inserting.
// On resolve: applies any hide/show intent that fired while INSERT was in-flight.
function _dbInsert(key, data) {
  if (!window.supabaseClient) return;
  _log('INSERT start key=' + key.slice(0,8));

  window.supabaseClient.from('ames_buildings_2026')
    .insert({
      geom:     toMultiPolygon(data.geom_json),
      nid:      data.nid      || null,
      label:    data.label    || null,
      DayStart: data.DayStart || null,
      DayEnd:   data.DayEnd   || null,
      notes:    data.notes    || null,
      status:   'draft',
    })
    .select('id')
    .then(function(r) {
      if (r.error) { _log('INSERT error key=' + key.slice(0,8) + ' ' + r.error.message); return; }
      var saved = r.data && r.data[0];
      if (!saved) { _log('INSERT no row returned key=' + key.slice(0,8)); return; }

      _drawKeyToDbId[key] = saved.id;

      var pending = _pendingState[key];
      delete _pendingState[key];

      _log('INSERT resolved key=' + key.slice(0,8) + ' id=' + saved.id + ' pending=' + (pending || 'none'));

      if (pending === 'inactive') {
        window.supabaseClient.from('ames_buildings_2026')
          .update({ status: 'inactive' }).eq('id', saved.id)
          .then(function(r2) { if (r2.error) _log('UPDATE inactive error ' + r2.error.message); });
      }
    });
}

// Soft-hide a drawn feature (status → 'inactive'). Used by undo instead of physical DELETE.
function _dbHide(key) {
  var dbId = _getDbId(key);
  _log('dbHide key=' + key.slice(0,8) + ' id=' + (dbId || 'pending'));
  if (window.supabaseClient && dbId) {
    window.supabaseClient.from('ames_buildings_2026')
      .update({ status: 'inactive' }).eq('id', dbId)
      .then(function(r) { if (r.error) _log('dbHide error ' + r.error.message); });
  } else {
    _pendingState[key] = 'inactive';
  }
}

// Restore a soft-hidden feature (status → 'draft'). Used by redo.
function _dbShow(key) {
  var dbId = _getDbId(key);
  _log('dbShow key=' + key.slice(0,8) + ' id=' + (dbId || 'pending'));
  if (window.supabaseClient && dbId) {
    window.supabaseClient.from('ames_buildings_2026')
      .update({ status: 'draft' }).eq('id', dbId)
      .then(function(r) { if (r.error) _log('dbShow error ' + r.error.message); });
  } else {
    _pendingState[key] = 'draft';
  }
}

// ─── source update helper ─────────────────────────────────────────────────────

function _updateSources(lid) {
  [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
    var src = pair[1].getSource(lid + '-promoted-' + pair[0]);
    if (src) src.setData(window.promotedData[lid]);
  });
}

// ─── geometry-edit helpers ────────────────────────────────────────────────────

// Wrapper for drawOverlayDraw.changeMode that suppresses the draw.modechange → panel-close
// branch while the mode change is in-flight. Mapbox GL JS fires the event synchronously
// inside changeMode(), so the flag is read while still true.
function _setMode(mode, opts) {
  _suppressModeClose = true;
  try { drawOverlayDraw.changeMode(mode, opts || {}); }
  finally { _suppressModeClose = false; }
}

function loadDrawnFeatureForEditing(layer, drawKey, geometry) {
  if (!drawOverlayDraw || !drawOverlayMap) return;
  var editGeom = toPolygon(geometry);
  _geometryEditMode   = true;
  _editingLayer       = layer;
  _editingDrawKey     = String(drawKey);
  _editingCurrentGeom = editGeom;

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
  try { drawOverlayDraw.deleteAll(); } finally { _suppressDrawDelete = false; }
  var ids    = drawOverlayDraw.add({ type: 'Feature', geometry: editGeom, properties: {} });
  var drawId = ids[0];
  drawOverlayMap.getCanvas().style.pointerEvents = 'auto';
  raiseSlider();
  try { _setMode('direct_select', { featureId: drawId }); }
  catch(e) { _setMode('simple_select', { featureIds: [drawId] }); }

  _updateEditActions();
}

// Close geometry-edit state.
// saved=true  → feature was deleted or handled externally; do not restore to promoted layer.
// saved=false → restore to promoted layer using latest auto-saved geometry.
function clearDrawnFeatureEditing(saved) {
  if (!_geometryEditMode) return;
  _geometryEditMode = false;

  // Cancel any active sub-modes without their own cleanup loops
  if (_splitMode) { _splitMode = false; }
  if (_mergeMode) { _mergeMode = false; if (_mergeOverlay) { _mergeOverlay.remove(); _mergeOverlay = null; } }

  if (!saved && _editingOriginalFeature && _editingLayer) {
    var lid  = _editingLayer.id;
    var geom = _editingCurrentGeom || _editingOriginalFeature.geometry;
    var feat = Object.assign({}, _editingOriginalFeature, { geometry: geom });
    if (!window.promotedData[lid])
      window.promotedData[lid] = { type: 'FeatureCollection', features: [] };
    window.promotedData[lid].features.push(feat);
    _updateSources(lid);
  }

  if (!saved && window._editingBuildingId != null && _editingLayer) {
    var _lid = _editingLayer.id;
    if (window.promotedBuiltIds && window.promotedBuiltIds[_lid]) {
      var _bidStr = String(window._editingBuildingId);
      window.promotedBuiltIds[_lid] = window.promotedBuiltIds[_lid].filter(function(s) { return s !== _bidStr; });
    }
    if (typeof refreshTilesetFilter === 'function') refreshTilesetFilter(_editingLayer);
  }
  window._editingBuildingId = null;

  _editingLayer           = null;
  _editingDrawKey         = null;
  _editingOriginalFeature = null;
  _editingCurrentGeom     = null;

  if (drawOverlayDraw) { _suppressDrawDelete = true; try { drawOverlayDraw.deleteAll(); } finally { _suppressDrawDelete = false; } }
  if (drawOverlayMap)  drawOverlayMap.getCanvas().style.pointerEvents = 'none';
  lowerSlider();
  _updateEditActions();
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

  _log('NEW FEATURE key=' + localKey.slice(0,8));
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

  _dbInsert(localKey, { geom_json: geom });

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
      _dbHide(localKey);
    },
    function() {
      // redo create — add back to map with same local key; show the existing DB row
      addDrawnFeature(layer, localKey, geom, props);
      _dbShow(localKey);
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
    window.supabaseClient.from('ames_buildings_2026')
      .update({ geom: toMultiPolygon(newGeom) }).eq('id', dbId)
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
        try { drawOverlayDraw.deleteAll(); } finally { _suppressDrawDelete = false; }
        var ids = drawOverlayDraw.add({ type: 'Feature', geometry: geom, properties: {} });
        try { _setMode('direct_select', { featureId: ids[0] }); }
        catch(e) { _setMode('simple_select', { featureIds: [ids[0]] }); }
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
        window.supabaseClient.from('ames_buildings_2026')
          .update({ geom: toMultiPolygon(geom) }).eq('id', currentDbId)
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

  _dbHide(localKey);

  if (!deletedGeom) return;

  pushUndo(
    function() {
      // undo delete — restore to map; show the existing DB row
      addDrawnFeature(layer, localKey, deletedGeom, Object.assign({}, deletedProps, { _drawKey: localKey }));
      _dbShow(localKey);
    },
    function() {
      // redo delete — remove from map; soft-hide the DB row
      var lid = layer.id;
      if (window.promotedData[lid]) {
        window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
          return String(f.properties._drawKey) !== localKey;
        });
        _updateSources(lid);
      }
      _dbHide(localKey);
    }
  );
}

// ─── split polygon geometry ───────────────────────────────────────────────────

// Splits a polygon along an arbitrary drawn polyline, preserving the full path.
// Finds the two points where the line crosses the polygon boundary, slices the
// ring at those points into two arcs, and uses the drawn cut path as the shared
// edge. Only handles exactly 2 boundary crossings (one clean cut through).
function _splitPolygonWithLine(polygon, lineFeature) {
  var ring     = polygon.geometry.coordinates[0];
  var ringLine = turf.lineString(ring);
  var xings    = turf.lineIntersect(lineFeature, ringLine);
  if (xings.features.length !== 2) return [];

  var ix0 = xings.features[0].geometry.coordinates;
  var ix1 = xings.features[1].geometry.coordinates;

  // Which intersection does the drawn line hit first?
  var loc0      = turf.nearestPointOnLine(lineFeature, turf.point(ix0)).properties.location;
  var loc1      = turf.nearestPointOnLine(lineFeature, turf.point(ix1)).properties.location;
  var lineEntry = loc0 <= loc1 ? ix0 : ix1;
  var lineExit  = loc0 <= loc1 ? ix1 : ix0;

  // Slice the drawn line to keep only the portion inside the polygon
  var cutSlice  = turf.lineSlice(turf.point(lineEntry), turf.point(lineExit), lineFeature);
  var cutCoords = cutSlice.geometry.coordinates.slice();
  cutCoords[0]                    = lineEntry;  // snap to exact ring intersection
  cutCoords[cutCoords.length - 1] = lineExit;

  // Open ring (drop closing duplicate vertex)
  var openRing = (ring[0][0] === ring[ring.length-1][0] && ring[0][1] === ring[ring.length-1][1])
    ? ring.slice(0, ring.length - 1) : ring.slice();
  var n = openRing.length;

  // Find which segment of the ring each intersection lies on
  function findSegPos(pt) {
    var best = { segIdx: 0, t: 0, dist: Infinity };
    for (var i = 0; i < n; i++) {
      var a = openRing[i], b = openRing[(i + 1) % n];
      var dx = b[0]-a[0], dy = b[1]-a[1];
      var len2 = dx*dx + dy*dy;
      var t    = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((pt[0]-a[0])*dx + (pt[1]-a[1])*dy) / len2));
      var d    = Math.pow(pt[0]-(a[0]+t*dx), 2) + Math.pow(pt[1]-(a[1]+t*dy), 2);
      if (d < best.dist) best = { segIdx: i, t: t, dist: d };
    }
    return best;
  }

  var posEntry = findSegPos(lineEntry);
  var posExit  = findSegPos(lineExit);

  // Order intersections by ring winding position
  var entryFirst = posEntry.segIdx < posExit.segIdx ||
    (posEntry.segIdx === posExit.segIdx && posEntry.t <= posExit.t);
  var posFirst  = entryFirst ? posEntry : posExit;
  var posSecond = entryFirst ? posExit  : posEntry;
  var ptFirst   = entryFirst ? lineEntry : lineExit;
  var ptSecond  = entryFirst ? lineExit  : lineEntry;

  // Cut coords running ptFirst → ptSecond
  var cutFwd = (ptFirst === lineEntry) ? cutCoords : cutCoords.slice().reverse();

  // Build arc: startPt → numVerts ring vertices (forward) → endPt
  function buildArc(startPt, startSeg, numVerts, endPt) {
    var arc = [startPt];
    for (var k = 0; k < numVerts; k++) arc.push(openRing[(startSeg + 1 + k) % n]);
    arc.push(endPt);
    return arc;
  }

  var fwd  = (posSecond.segIdx - posFirst.segIdx + n) % n;
  var arc1 = buildArc(ptFirst,  posFirst.segIdx,  fwd,     ptSecond);
  var arc2 = buildArc(ptSecond, posSecond.segIdx, n - fwd, ptFirst);

  // Ring 1: arc1 (ptFirst→ptSecond via ring) + reversed cut (ptSecond→ptFirst)
  var ring1 = arc1.concat(cutFwd.slice().reverse().slice(1));
  // Ring 2: arc2 (ptSecond→ptFirst via ring) + forward cut (ptFirst→ptSecond)
  var ring2 = arc2.concat(cutFwd.slice(1));

  var results = [];
  [ring1, ring2].forEach(function(r) {
    if (r.length < 4) return;
    if (r[0][0] !== r[r.length-1][0] || r[0][1] !== r[r.length-1][1]) r = r.concat([r[0].slice()]);
    try { results.push(turf.polygon([r])); }
    catch(e) { console.warn('[split] degenerate ring skipped'); }
  });
  return results;
}

// ─── copy / paste ─────────────────────────────────────────────────────────────

function _doCopy() {
  if (!_geometryEditMode || !_editingCurrentGeom) return;
  _clipboard = JSON.parse(JSON.stringify(_editingCurrentGeom));
  _updateEditActions();
}

function _doPaste() {
  if (!_clipboard) return;
  var layer = _editingLayer;
  if (!layer && typeof flatLayers === 'function' && window.layers) {
    flatLayers(window.layers).forEach(function(l) {
      if (l.id === 'curr-builds') layer = l;
    });
  }
  if (!layer) return;
  var geom = JSON.parse(JSON.stringify(_clipboard));
  _autoSaveNewFeature({ geometry: geom }, layer);
}

// ─── split ────────────────────────────────────────────────────────────────────

function _enterSplitMode() {
  if (!_geometryEditMode || !drawOverlayDraw) return;
  _splitMode = true;
  _updateEditActions();
  drawOverlayMap.getCanvas().style.pointerEvents = 'auto';
  raiseSlider();
  drawOverlayDraw.changeMode('draw_line_string');
}

function _cancelSplitMode() {
  if (!_splitMode) return;
  _splitMode = false;
  _updateEditActions();
  // Re-select the polygon still in the draw canvas
  if (drawOverlayDraw) {
    var remaining = drawOverlayDraw.getAll().features;
    if (remaining.length > 0) {
      try { _setMode('direct_select', { featureId: remaining[0].id }); }
      catch(e) { _setMode('simple_select', { featureIds: [remaining[0].id] }); }
    } else {
      drawOverlayMap.getCanvas().style.pointerEvents = 'none';
      lowerSlider();
    }
  }
}

function _doSplit(lineFeature, layer) {
  // Set _splitMode = false FIRST — draw.modechange fires after draw.create and reads it
  _splitMode = false;

  var origKey   = _editingDrawKey;
  var origGeom  = _editingCurrentGeom;
  var origFeat  = _editingOriginalFeature;
  var origProps = origFeat ? Object.assign({}, origFeat.properties) : {};

  var halves = _splitPolygonWithLine({ geometry: origGeom }, lineFeature);

  // Remove the line from draw canvas (polygon remains)
  _suppressDrawDelete = true;
  try { drawOverlayDraw.delete([lineFeature.id]); } finally { _suppressDrawDelete = false; }

  if (halves.length < 2) {
    // Line didn't cross polygon — stay in edit mode so user can try again
    _splitMode = false;
    _updateEditActions();
    var remaining = drawOverlayDraw.getAll().features;
    if (remaining.length > 0) {
      drawOverlayMap.getCanvas().style.pointerEvents = 'auto';
      raiseSlider();
      try { _setMode('direct_select', { featureId: remaining[0].id }); } catch(e) {}
    }
    console.warn('[split] Line must cross the polygon completely — try again.');
    return;
  }

  // Exit geometry edit without restoring original to promotedData
  clearDrawnFeatureEditing(true);
  if (typeof closePanelInfo === 'function') closePanelInfo(layer);

  var half1Geom = halves[0].geometry;
  var half2Geom = halves[1].geometry;
  var key1      = _newKey();
  var key2      = _newKey();
  var sharedProps = {
    nid:      null,
    label:    origProps.label    || null,
    DayStart: origProps.DayStart || null,
    DayEnd:   origProps.DayEnd   || null,
  };

  _dbHide(origKey);

  // Add both halves to map and Supabase
  addDrawnFeature(layer, key1, half1Geom, sharedProps);
  addDrawnFeature(layer, key2, half2Geom, sharedProps);

  function _insertHalf(key, geom) {
    _dbInsert(key, { geom_json: geom, DayStart: sharedProps.DayStart, DayEnd: sharedProps.DayEnd });
  }
  _insertHalf(key1, half1Geom);
  _insertHalf(key2, half2Geom);

  var lid = layer.id;

  pushUndo(
    function() {
      // undo split — remove halves, restore original
      if (window.promotedData[lid]) {
        window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
          var k = String(f.properties._drawKey);
          return k !== key1 && k !== key2;
        });
        _updateSources(lid);
      }
      _dbHide(key1);
      _dbHide(key2);
      addDrawnFeature(layer, origKey, origGeom, origProps);
      _dbShow(origKey);
    },
    function() {
      // redo split — remove original, restore halves
      if (window.promotedData[lid]) {
        window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
          return String(f.properties._drawKey) !== origKey;
        });
        _updateSources(lid);
      }
      _dbHide(origKey);
      addDrawnFeature(layer, key1, half1Geom, sharedProps);
      addDrawnFeature(layer, key2, half2Geom, sharedProps);
      _dbShow(key1);
      _dbShow(key2);
    }
  );
}

// ─── merge ────────────────────────────────────────────────────────────────────

function _enterMergeMode() {
  if (!_geometryEditMode || !_editingLayer) return;
  _mergeMode = true;
  _updateEditActions();

  var layer   = _editingLayer;
  var overlay = document.createElement('div');
  overlay.id  = 'merge-pick-overlay';
  // Crosshair cursor only over the map area; clicking anywhere else is a miss
  overlay.style.cssText = 'position:fixed;inset:0;z-index:1000;cursor:crosshair;';
  _mergeOverlay = overlay;

  overlay.addEventListener('click', function(e) {
    if (!layer) { _cancelMergeMode(); return; }

    var rect = afterMap.getContainer().getBoundingClientRect();
    var pt   = [e.clientX - rect.left, e.clientY - rect.top];
    var lid  = layer.id;

    // First: check already-promoted/drawn features
    var promFeats = afterMap.queryRenderedFeatures(pt, { layers: [lid + '-promoted-right'] });
    if (promFeats && promFeats.length) {
      var drawKey = String(promFeats[0].properties._drawKey);
      var featB   = window.promotedData[lid]
        ? window.promotedData[lid].features.find(function(f) {
            return String(f.properties._drawKey) === drawKey;
          })
        : null;
      if (featB) { _doMerge(featB, drawKey, layer); return; }
    }

    // Fallback: check raw tileset layer
    var tileFeats = afterMap.queryRenderedFeatures(pt, { layers: [lid + '-right'] });
    if (!tileFeats || !tileFeats.length) return; // true miss — user can try again

    var tf      = tileFeats[0];
    var tileKey = _newKey();
    var featB   = {
      type: 'Feature',
      geometry: tf.geometry,
      properties: Object.assign({}, tf.properties, { _drawKey: tileKey }),
    };

    // Suppress the tileset version of the picked building while it's being merged
    if (tf.id != null) {
      if (!window.promotedBuiltIds[lid]) window.promotedBuiltIds[lid] = [];
      var bidStr = String(tf.id);
      if (window.promotedBuiltIds[lid].indexOf(bidStr) === -1) {
        window.promotedBuiltIds[lid].push(bidStr);
        refreshTilesetFilter(layer);
      }
    }

    _doMerge(featB, tileKey, layer);
  });

  document.body.appendChild(overlay);
}

function _cancelMergeMode() {
  _mergeMode = false;
  if (_mergeOverlay) { _mergeOverlay.remove(); _mergeOverlay = null; }
  _updateEditActions();
}

function _doMerge(featB, keyB, layer) {
  _cancelMergeMode();

  if (!_geometryEditMode || !_editingCurrentGeom) return;

  var keyA    = _editingDrawKey;
  var geomA   = _editingCurrentGeom;
  var propsA  = _editingOriginalFeature ? Object.assign({}, _editingOriginalFeature.properties) : {};
  var geomB   = featB.geometry;
  var propsB  = Object.assign({}, featB.properties);

  var merged = turf.union(turf.feature(geomA), turf.feature(geomB));
  if (!merged) { console.error('[merge] union failed'); return; }

  var mergedGeom  = merged.geometry;
  var mergedKey   = _newKey();

  // Null means "unknown/unbounded" — if either side is null, keep null rather than
  // substituting the sentinel values 99999999 / 0 as real dates.
  var dsA = propsA.DayStart != null ? propsA.DayStart : null;
  var dsB = propsB.DayStart != null ? propsB.DayStart : null;
  var deA = propsA.DayEnd   != null ? propsA.DayEnd   : null;
  var deB = propsB.DayEnd   != null ? propsB.DayEnd   : null;
  var mergedProps = {
    nid:      null,
    label:    propsA.label || propsB.label || null,
    DayStart: (dsA === null || dsB === null) ? null : Math.min(dsA, dsB),
    DayEnd:   (deA === null || deB === null) ? null : Math.max(deA, deB),
  };

  // Exit edit mode without restoring A to promotedData
  clearDrawnFeatureEditing(true);
  if (typeof closePanelInfo === 'function') closePanelInfo(layer);

  var lid = layer.id;

  _dbHide(keyA);

  // Remove B from promotedData and soft-hide its DB row
  if (window.promotedData[lid]) {
    window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
      return String(f.properties._drawKey) !== keyB;
    });
    _updateSources(lid);
  }
  _dbHide(keyB);

  // Add merged feature
  addDrawnFeature(layer, mergedKey, mergedGeom, mergedProps);

  // Open info panel for the merged feature so the user can review/edit its metadata
  var _state = window.infoPanelState && window.infoPanelState[layer.id];
  if (_state && typeof fetchAndRender === 'function') {
    _state.viewId   = mergedKey;
    _state.geometry = mergedGeom;
    _state.isOpen   = true;
    fetchAndRender(layer, Object.assign({}, mergedProps, { _drawKey: mergedKey }), mergedGeom);
    if (typeof floatPanelToTop     === 'function') floatPanelToTop(_state.divId);
    if (typeof openSidebarIfHidden === 'function') openSidebarIfHidden();
  }

  // One-time insert for the new merged row
  _dbInsert(mergedKey, { geom_json: mergedGeom, DayStart: mergedProps.DayStart, DayEnd: mergedProps.DayEnd });

  pushUndo(
    function() {
      // undo merge — remove merged, restore A and B
      if (window.promotedData[lid]) {
        window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
          return String(f.properties._drawKey) !== mergedKey;
        });
        _updateSources(lid);
      }
      _dbHide(mergedKey);
      addDrawnFeature(layer, keyA, geomA, propsA);
      addDrawnFeature(layer, keyB, geomB, propsB);
      _dbShow(keyA);
      _dbShow(keyB);
    },
    function() {
      // redo merge — remove A and B, restore merged
      if (window.promotedData[lid]) {
        window.promotedData[lid].features = window.promotedData[lid].features.filter(function(f) {
          var k = String(f.properties._drawKey);
          return k !== keyA && k !== keyB;
        });
        _updateSources(lid);
      }
      _dbHide(keyA);
      _dbHide(keyB);
      addDrawnFeature(layer, mergedKey, mergedGeom, mergedProps);
      _dbShow(mergedKey);
    }
  );
}

// ─── edit actions toolbar ─────────────────────────────────────────────────────

function _updateEditActions() {
  var el = document.getElementById('draw-edit-actions');
  if (!el) return;
  el.style.display = _geometryEditMode ? 'flex' : 'none';

  el.querySelector('#ea-copy').disabled  = !_geometryEditMode;
  el.querySelector('#ea-paste').disabled = !_clipboard;

  var splitBtn = el.querySelector('#ea-split');
  splitBtn.disabled    = !_geometryEditMode || _mergeMode;
  splitBtn.textContent = _splitMode ? 'Cancel Split (Esc)' : 'Split';
  splitBtn.classList.toggle('active', _splitMode);

  var mergeBtn = el.querySelector('#ea-merge');
  mergeBtn.disabled    = !_geometryEditMode || _splitMode;
  mergeBtn.textContent = _mergeMode ? 'Cancel Merge (Esc)' : 'Merge With…';
  mergeBtn.classList.toggle('active', _mergeMode);
}

function _buildEditActions() {
  if (document.getElementById('draw-edit-actions')) return;

  var el = document.createElement('div');
  el.id  = 'draw-edit-actions';

  function makeBtn(id, label, onClick) {
    var b = document.createElement('button');
    b.id = id; b.textContent = label; b.onclick = onClick;
    return b;
  }
  function makeSep() {
    var d = document.createElement('div');
    d.className = 'ea-sep';
    return d;
  }

  el.appendChild(makeBtn('ea-copy',  'Copy',            _doCopy));
  el.appendChild(makeBtn('ea-paste', 'Paste',           _doPaste));
  el.appendChild(makeSep());
  el.appendChild(makeBtn('ea-split', 'Split',           function() { _splitMode ? _cancelSplitMode() : _enterSplitMode(); }));
  el.appendChild(makeSep());
  el.appendChild(makeBtn('ea-merge', 'Merge With…', function() { _mergeMode ? _cancelMergeMode() : _enterMergeMode(); }));

  document.body.appendChild(el);
  _updateEditActions();
}

function _addEditKeyboardShortcuts() {
  if (_editShortcutsAdded) return;
  _editShortcutsAdded = true;
  window.addEventListener('keydown', function(e) {
    if (!window.editMode) return;
    var tag = (document.activeElement || {}).tagName || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === 'c' || e.keyCode === 67)) { e.preventDefault(); _doCopy(); }
    if (mod && (e.key === 'v' || e.keyCode === 86)) { e.preventDefault(); _doPaste(); }
    if (e.key === 'Escape') {
      // stopPropagation in capture phase prevents MapboxDraw from also seeing this
      // Esc and changing mode to simple_select, which would accidentally close the panel.
      if (_splitMode) { e.stopPropagation(); _cancelSplitMode(); }
      if (_mergeMode) { e.stopPropagation(); _cancelMergeMode(); }
    }
  }, true);
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

  _buildEditActions();
  _addEditKeyboardShortcuts();

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
      if (e.mode === 'draw_polygon' || e.mode === 'draw_line_string') {
        drawOverlayMap.getCanvas().style.pointerEvents = 'auto';
        raiseSlider();
      } else if (e.mode === 'simple_select' && _splitMode) {
        // User pressed Esc while drawing the cut line — cancel split
        _cancelSplitMode();
      } else if (e.mode === 'simple_select' && _geometryEditMode && !_suppressModeClose && !_mergeMode) {
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

    // Polygon or line completed
    drawOverlayMap.on('draw.create', function(e) {
      var feature = e.features[0];

      // Split mode: line was drawn — run split logic
      if (_splitMode && feature.geometry.type === 'LineString') {
        _doSplit(feature, buildsLayer);
        return;
      }

      // Normal polygon draw
      drawOverlayMap.getCanvas().style.pointerEvents = 'none';
      lowerSlider();
      _suppressDrawDelete = true;
      try { drawOverlayDraw.deleteAll(); } finally { _suppressDrawDelete = false; }
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
        try { drawOverlayDraw.deleteAll(); } finally { _suppressDrawDelete = false; }
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
