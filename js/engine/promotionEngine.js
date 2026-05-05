// Promotion system: when a tileset feature's dates are edited in-session,
// it gets added to a live GeoJSON layer and excluded from the tileset via NID filter.
// On a fresh page load, previously edited features revert to tileset rendering
// (a future RPC-based geometry fetch would fix this; deferred to phase 2).

window.promotedNids = {};  // { [layerId]: string[] }  — NIDs excluded from tileset
window.promotedData = {};  // { [layerId]: GeoJSON FeatureCollection }

var LIVE_LAYER_ID = 'a4b20188-34fb-4723-90a9-ff105a73ce76';

// Add a drawn (new) feature to the live GeoJSON layer without touching the tileset filter.
// featureKey is any stable string (feature_id or a placeholder).
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

// Fetch drawn+edited features from Supabase and load them onto the map.
// For edited features missing geom_json, falls back to a PostGIS RPC and self-heals by
// writing the geometry back so future loads skip the RPC entirely.
async function loadLiveFeatures(layer) {
  if (!window.supabaseClient) return;

  var result = await window.supabaseClient
    .from('features')
    .select('feature_id, nid, label, DayStart, DayEnd, source, geom_json')
    .eq('layer_id', LIVE_LAYER_ID)
    .in('source', ['drawn', 'edited']);

  if (result.error || !result.data || !result.data.length) return;

  var withGeom  = [];
  var needsGeom = [];

  result.data.forEach(function(row) {
    if (row.geom_json) {
      withGeom.push(row);
    } else if (row.source === 'edited' && row.nid) {
      needsGeom.push(row);
    }
    // drawn features without geom_json cannot be shown — skip
  });

  withGeom.forEach(function(row) {
    var props = { nid: row.nid, label: row.label, DayStart: row.DayStart, DayEnd: row.DayEnd };
    if (row.source === 'edited' && row.nid) {
      promoteFeature(layer, row.nid, row.geom_json, props);
    } else {
      addDrawnFeature(layer, row.feature_id, row.geom_json, props);
    }
  });

  if (!needsGeom.length) return;

  // Fetch geometry via RPC in parallel for edited features with null geom_json
  var rpcResults = await Promise.all(needsGeom.map(function(row) {
    return window.supabaseClient
      .rpc('get_feature_geojson', { p_feature_id: row.feature_id })
      .then(function(r) { return { row: row, geom: r.data }; })
      .catch(function()  { return { row: row, geom: null };  });
  }));

  rpcResults.forEach(function(item) {
    if (!item.geom) return;
    var row   = item.row;
    var props = { nid: row.nid, label: row.label, DayStart: row.DayStart, DayEnd: row.DayEnd };

    promoteFeature(layer, row.nid, item.geom, props);

    // Self-heal: write geom_json back so future loads skip the RPC
    window.supabaseClient
      .from('features')
      .update({ geom_json: item.geom })
      .eq('feature_id', row.feature_id);
  });
}

// Called per-side from mapinit.js style.load, after addLayersToMap
function initPromotedLayers(side, map, date) {
  flatLayers(layers).forEach(function(layer) {
    if (!layer.panel || !layer.panel.supabaseLookup) return;

    var srcId   = layer.id + '-promoted-' + side;
    var emptyFC = { type: 'FeatureCollection', features: [] };
    var d       = (date && !isNaN(date)) ? date : 0;

    map.addSource(srcId, { type: 'geojson', data: emptyFC });
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

    map.on('mouseenter', srcId, function() { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', srcId, function() { map.getCanvas().style.cursor = ''; });
    map.on('click', srcId, function(e) { handlePanelClick(layer, e); });

    // Load existing drawn/edited features from Supabase once (right side only)
    if (side === 'right') loadLiveFeatures(layer);
  });
}

// Call after a successful edit save on a tileset feature:
// adds the feature to the live GeoJSON layer and hides the tileset version.
function promoteFeature(layer, nidVal, geometry, props) {
  var nidStr = String(nidVal);
  var lid    = layer.id;

  if (!window.promotedNids[lid]) window.promotedNids[lid] = [];
  if (window.promotedNids[lid].indexOf(nidStr) === -1)
    window.promotedNids[lid].push(nidStr);

  if (!window.promotedData[lid])
    window.promotedData[lid] = { type: 'FeatureCollection', features: [] };

  var nidProp  = layer.panel.nidProp;
  var features = window.promotedData[lid].features.filter(function(f) {
    return String(f.properties[nidProp]) !== nidStr;
  });
  // Use NID as stable feature id so toggle-to-close works in handlePanelClick
  features.push({ type: 'Feature', id: parseInt(nidStr, 10), geometry: geometry, properties: props });
  window.promotedData[lid] = { type: 'FeatureCollection', features: features };

  var date       = getCurrentSliderDate();
  var dateFilter = ['all',
    ['<=', ['coalesce', ['get', 'DayStart'], 0], date],
    ['>=', ['coalesce', ['get', 'DayEnd'], 99999999], date],
  ];

  [['left', beforeMap], ['right', afterMap]].forEach(function(pair) {
    var side = pair[0], map = pair[1];
    var srcId = lid + '-promoted-' + side;
    var src   = map.getSource(srcId);
    if (src) src.setData(window.promotedData[lid]);
    if (map.getLayer(srcId)) map.setFilter(srcId, dateFilter);
  });

  refreshTilesetFilter(layer, date);
}

function refreshTilesetFilter(layer, date) {
  if (date === undefined) date = getCurrentSliderDate();
  var filter  = buildLayerFilter(layer.id, date);
  var leftId  = layer.id + '-left';
  var rightId = layer.id + '-right';
  if (beforeMap.getLayer(leftId))  beforeMap.setFilter(leftId,  filter);
  if (afterMap.getLayer(rightId))  afterMap.setFilter(rightId,  filter);
}

// Builds the date filter for a layer, including NID exclusions for promoted features
function buildLayerFilter(layerId, date) {
  var filter   = ['all', ['<=', 'DayStart', date], ['>=', 'DayEnd', date]];
  var excluded = window.promotedNids[layerId];
  if (excluded && excluded.length > 0)
    filter.push(['!in', 'nid'].concat(excluded.map(function(s) { return parseInt(s, 10); })));
  return filter;
}

function getCurrentSliderDate() {
  var sliderVal = moment($('#date').text()).unix();
  return parseInt(moment.unix(sliderVal).format('YYYYMMDD'));
}
