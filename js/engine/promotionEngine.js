window.promotedData     = {};  // { [layerId]: GeoJSON FeatureCollection }
window.promotedBuiltIds = {};  // { [layerId]: string[] } — ames_buildings_2026 ids suppressed in tileset

// Add a feature to the live GeoJSON overlay. featureKey is the ames_buildings_2026 id (as string)
// for promoted buildings, or a local UUID for drawn buildings.
function addDrawnFeature(layer, featureKey, geometry, props) {
  var lid = layer.id;
  if (!window.promotedData[lid])
    window.promotedData[lid] = { type: 'FeatureCollection', features: [] };

  var features = window.promotedData[lid].features.filter(function(f) {
    return f.properties._drawKey !== featureKey;
  });
  features.push({
    type: 'Feature',
    geometry: geometry,
    properties: Object.assign({}, props, { _drawKey: featureKey }),
  });
  window.promotedData[lid] = { type: 'FeatureCollection', features: features };

  [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
    var src = pair[1].getSource(lid + '-promoted-' + pair[0]);
    if (src) src.setData(window.promotedData[lid]);
  });
}

// On page load: fetch all draft/editing buildings from ames_buildings_2026 and put them
// in the GeoJSON overlay. Editing buildings also get ghost-suppressed in the tileset.
async function loadLiveFeatures(layer) {
  if (!window.supabaseClient) return;

  var result = await window.supabaseClient
    .from('ames_buildings_2026')
    .select('id, nid, label, DayStart, DayEnd, notes, status, geom')
    .in('status', ['draft', 'editing']);

  if (result.error || !result.data || !result.data.length) return;

  var lid = layer.id;
  if (!window.promotedBuiltIds[lid]) window.promotedBuiltIds[lid] = [];

  result.data.forEach(function(row) {
    if (!row.geom) return;
    var props = { id: row.id, nid: row.nid, label: row.label, DayStart: row.DayStart, DayEnd: row.DayEnd, notes: row.notes };
    addDrawnFeature(layer, String(row.id), row.geom, props);
    if (row.status === 'editing') {
      var idStr = String(row.id);
      if (window.promotedBuiltIds[lid].indexOf(idStr) === -1)
        window.promotedBuiltIds[lid].push(idStr);
    }
  });

  refreshTilesetFilter(layer, getCurrentSliderDate());
}

// Called per-side from mapinit.js style.load, after addLayersToMap
function initPromotedLayers(side, map, date) {
  flatLayers(layers).forEach(function(layer) {
    if (!layer.panel || !layer.panel.supabaseLookup) return;

    var srcId   = layer.id + '-promoted-' + side;
    var emptyFC = { type: 'FeatureCollection', features: [] };
    var d       = (date && !isNaN(date)) ? date : 0;

    map.addSource(srcId, { type: 'geojson', data: emptyFC, promoteId: '_drawKey' });
    map.addLayer({
      id:     srcId,
      type:   layer.type,
      source: srcId,
      paint:  layer.paint,
      filter: ['all',
        ['<=', ['coalesce', ['get', 'DayStart'], 0], d],
        ['>=', ['coalesce', ['get', 'DayEnd'], 99999999], d],
      ],
    });

    var hoveredPromKey = null;
    map.on('mousemove', srcId, function(e) {
      map.getCanvas().style.cursor = 'pointer';
      if (e.features.length > 0) {
        if (hoveredPromKey !== null)
          map.setFeatureState({ source: srcId, id: hoveredPromKey }, { hover: false });
        hoveredPromKey = e.features[0].properties._drawKey;
        map.setFeatureState({ source: srcId, id: hoveredPromKey }, { hover: true });
        if (side === 'right') {
          var _lbl = e.features[0].properties.label;
          var _state = typeof infoPanelState !== 'undefined' && infoPanelState[layer.id];
          if (_lbl && _state && !_state.isOpen) {
            _state.afterPopup
              .setLngLat(e.lngLat)
              .setHTML("<div class='" + _state.popupClass + "'>" + _lbl + "</div>")
              .addTo(map);
          }
        }
      }
    });
    map.on('mouseleave', srcId, function() {
      map.getCanvas().style.cursor = '';
      if (hoveredPromKey !== null)
        map.setFeatureState({ source: srcId, id: hoveredPromKey }, { hover: false });
      hoveredPromKey = null;
      if (side === 'right') {
        var _state = typeof infoPanelState !== 'undefined' && infoPanelState[layer.id];
        if (_state && !_state.isOpen) _state.afterPopup.remove();
      }
    });
    map.on('click', srcId, function(e) { handlePanelClick(layer, e, false); });

    if (side === 'right') loadLiveFeatures(layer);
  });
}

// Mark a tileset building as editing: adds to ghost suppression and GeoJSON overlay.
// Called from infoPanel.js when a permanent building is clicked in edit mode.
function promoteFeature(layer, buildingId, geometry, props) {
  var lid   = layer.id;
  var idStr = String(buildingId);

  if (!window.promotedBuiltIds[lid]) window.promotedBuiltIds[lid] = [];
  if (window.promotedBuiltIds[lid].indexOf(idStr) === -1)
    window.promotedBuiltIds[lid].push(idStr);

  addDrawnFeature(layer, idStr, geometry, props);

  if (window.supabaseClient) {
    window.supabaseClient.from('ames_buildings_2026')
      .update({ status: 'editing' }).eq('id', buildingId)
      .then(function(r) { if (r.error) console.warn('[promote] status update failed:', r.error.message); });
  }

  refreshTilesetFilter(layer, getCurrentSliderDate());
}

function refreshTilesetFilter(layer, date) {
  if (date === undefined) date = getCurrentSliderDate();
  var filter  = buildLayerFilter(layer.id, date);
  var leftId  = layer.id + '-left';
  var rightId = layer.id + '-right';
  if (beforeMap.getLayer(leftId))  beforeMap.setFilter(leftId,  filter);
  if (afterMap.getLayer(rightId))  afterMap.setFilter(rightId,  filter);
}

// Builds the date filter for a layer, suppressing any promoted/editing buildings by id.
function buildLayerFilter(layerId, date) {
  var filter = ['all',
    ['<=', ['coalesce', ['get', 'DayStart'], 0],        date],
    ['>=', ['coalesce', ['get', 'DayEnd'],   99999999], date],
  ];
  var excludedIds = window.promotedBuiltIds[layerId];
  if (excludedIds && excludedIds.length > 0)
    filter.push(['match', ['id'], excludedIds.map(Number), false, true]);
  return filter;
}

function getCurrentSliderDate() {
  var sliderVal = moment($('#date').text()).unix();
  return parseInt(moment.unix(sliderVal).format('YYYYMMDD'));
}
