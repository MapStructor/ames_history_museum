// Generic info panel engine.
// Each layer with a `panel` config must define a `render(props, data)` function
// that returns the full HTML string for the panel.
// props = Mapbox feature properties
// data  = raw JSON response from the encyclopedia API (may be null if no encyclopediaBase)

var infoPanelState = {};
var infoPanelClickFired = {};

function setupInfoPanels() {
  flatLayers(layers).forEach(function(layer) {
    if (!layer.panel) return;

    var panel = layer.panel;
    var divId = "infoPanel-" + layer.id;

    // Create the panel div and append to rightInfoBar
    var $div = $("<div>").addClass("infoLayerElem").attr("id", divId);
    $("#rightInfoBar").append($div);

    // Inject color styles for this layer's panel and popup
    var popupClass = "infoPanelPopUp-" + layer.id;
    $("<style>")
      .text(
        "#" + divId + ", ." + popupClass + " {" +
        "  background-color: " + hexToRgba(panel.color, 0.5) + ";" +
        "  border-color: " + panel.color + ";" +
        "}" +
        "." + popupClass + " {" +
        "  padding-left: 5px;" +
        "  padding-right: 5px;" +
        "}"
      )
      .appendTo("head");

    // Create floating map popups (small label that appears on the map at click point)
    var afterPopup  = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 5 });
    var beforePopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 5 });

    infoPanelState[layer.id] = {
      viewId: null,
      isOpen: false,
      divId: divId,
      popupClass: popupClass,
      afterPopup: afterPopup,
      beforePopup: beforePopup,
    };

    infoPanelClickFired[layer.id] = false;
  });
}

function registerInfoPanelClicks() {
  // Background click — toggle sidebar if no panel layer was hit
  // Debounced to avoid firing on double-click (which should zoom, not toggle)
  var clickTimer = null;
  function scheduleToggle() {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(function() { infoPanelDefaultHandle(); }, 250);
  }
  beforeMap.on("click",    scheduleToggle);
  beforeMap.on("dblclick", function() { clearTimeout(clickTimer); });
  afterMap.on("click",     scheduleToggle);
  afterMap.on("dblclick",  function() { clearTimeout(clickTimer); });

  flatLayers(layers).forEach(function(layer) {
    if (!layer.panel) return;

    var hoveredId = { left: null, right: null };
    var sourceLayer = layer["source-layer"];

    beforeMap.on("mousemove", layer.id + "-left", function(e) {
      beforeMap.getCanvas().style.cursor = "pointer";
      if (e.features.length > 0) {
        if (hoveredId.left !== null)
          beforeMap.setFeatureState({ source: layer.id + "-left", sourceLayer: sourceLayer, id: hoveredId.left }, { hover: false });
        hoveredId.left = e.features[0].id;
        beforeMap.setFeatureState({ source: layer.id + "-left", sourceLayer: sourceLayer, id: hoveredId.left }, { hover: true });
      }
    });
    beforeMap.on("mouseleave", layer.id + "-left", function() {
      beforeMap.getCanvas().style.cursor = "";
      if (hoveredId.left !== null)
        beforeMap.setFeatureState({ source: layer.id + "-left", sourceLayer: sourceLayer, id: hoveredId.left }, { hover: false });
      hoveredId.left = null;
    });

    afterMap.on("mousemove", layer.id + "-right", function(e) {
      afterMap.getCanvas().style.cursor = "pointer";
      if (e.features.length > 0) {
        if (hoveredId.right !== null)
          afterMap.setFeatureState({ source: layer.id + "-right", sourceLayer: sourceLayer, id: hoveredId.right }, { hover: false });
        hoveredId.right = e.features[0].id;
        afterMap.setFeatureState({ source: layer.id + "-right", sourceLayer: sourceLayer, id: hoveredId.right }, { hover: true });
        var _lbl = e.features[0].properties.label;
        if (_lbl && !state.isOpen) {
          state.afterPopup
            .setLngLat(e.lngLat)
            .setHTML("<div class='" + state.popupClass + "'>" + _lbl + "</div>")
            .addTo(afterMap);
        }
      }
    });
    afterMap.on("mouseleave", layer.id + "-right", function() {
      afterMap.getCanvas().style.cursor = "";
      if (hoveredId.right !== null)
        afterMap.setFeatureState({ source: layer.id + "-right", sourceLayer: sourceLayer, id: hoveredId.right }, { hover: false });
      hoveredId.right = null;
      if (!state.isOpen) state.afterPopup.remove();
    });

    beforeMap.on("click", layer.id + "-left",  function(e) { handlePanelClick(layer, e, true); });
    afterMap.on("click",  layer.id + "-right", function(e) { handlePanelClick(layer, e, true); });
  });
}

function infoPanelDefaultHandle() {
  var anyFired = Object.keys(infoPanelClickFired).some(function(id) {
    return infoPanelClickFired[id];
  });
  if (!anyFired) {
    if ($("#view-hide-layer-panel").length > 0)
      $("#view-hide-layer-panel").trigger("click");
  }
}

function handlePanelClick(layer, event, isTileset) {
  if (infoPanelClickFired[layer.id]) return;
  infoPanelClickFired[layer.id] = true;
  setTimeout(function() { infoPanelClickFired[layer.id] = false; }, 300);

  var state     = infoPanelState[layer.id];
  var panel     = layer.panel;
  var props     = event.features[0].properties;
  if (isTileset) props = Object.assign({}, props, { _tileFeatureId: event.features[0].id });
  var clickedId = event.features[0].id;
  var geometry  = event.features[0].geometry;

  var popupHTML =
    "<div class='" + state.popupClass + "'>" +
    (props.label || props.name || "") +
    (panel.popupLabel ? "<br><b>" + panel.popupLabel + ": </b>" + props[panel.popupProp] : "") +
    "</div>";

  if (state.viewId === clickedId) {
    if (state.isOpen) {
      closePanelInfo(layer);
    } else {
      state.geometry = geometry;
      fetchAndRender(layer, props, geometry);
      floatPanelToTop(state.divId);
      openSidebarIfHidden();
      state.isOpen = true;
      setPanelHighlight(layer, state.viewId, true);
      showPanelPopups(state, event.lngLat, popupHTML);
    }
  } else {
    setPanelHighlight(layer, state.viewId, false);
    state.viewId  = clickedId;
    state.geometry = geometry;
    fetchAndRender(layer, props, geometry);
    floatPanelToTop(state.divId);
    openSidebarIfHidden();
    state.isOpen = true;
    setPanelHighlight(layer, clickedId, true);
    showPanelPopups(state, event.lngLat, popupHTML);
  }

  state.viewId = clickedId;
}

function fetchAndRender(layer, props, geometry) {
  if (typeof clearDrawnFeatureEditing === 'function') clearDrawnFeatureEditing(false);

  var panel   = layer.panel;
  var state   = infoPanelState[layer.id];
  var $el     = $("#" + state.divId);
  var drawKey = props._drawKey != null ? String(props._drawKey) : null;
  var nid     = props[panel.nidProp];

  // Tileset feature in edit mode: fetch real geometry from PostGIS, then enter geometry edit.
  // The tile geometry is simplified at render zoom — always use the PostGIS source for editing.
  if (!drawKey && window.editMode && typeof _newKey === 'function' && geometry) {
    var tileKey    = _newKey();
    var buildingId = props._tileFeatureId != null ? props._tileFeatureId : (props.id != null ? props.id : null);

    var geomPromise = (buildingId && window.supabaseClient)
      ? window.supabaseClient
          .from('ames_buildings_2026')
          .select('geom')
          .eq('id', buildingId)
          .limit(1)
          .then(function(r) {
            return (r.data && r.data[0] && r.data[0].geom) ? r.data[0].geom : geometry;
          })
          .catch(function() { return geometry; })
      : Promise.resolve(geometry);

    $el.html("<p style='padding:5px;'>Loading...</p>");
    $el.slideDown();

    geomPromise.then(function(realGeom) {
      var tileProps = Object.assign({}, props, { _drawKey: tileKey });

      // Map the session key → known building id so saves/geom-updates use it immediately
      if (typeof _drawKeyToDbId !== 'undefined' && buildingId != null)
        _drawKeyToDbId[tileKey] = buildingId;

      // Mark building as editing in DB
      if (buildingId != null && window.supabaseClient) {
        window.supabaseClient.from('ames_buildings_2026')
          .update({ status: 'editing' }).eq('id', buildingId)
          .then(function(r) { if (r.error) console.warn('[promote] status update failed:', r.error.message); });
      }

      if (buildingId != null) {
        if (!window.promotedBuiltIds) window.promotedBuiltIds = {};
        if (!window.promotedBuiltIds[layer.id]) window.promotedBuiltIds[layer.id] = [];
        var bidStr = String(buildingId);
        if (window.promotedBuiltIds[layer.id].indexOf(bidStr) === -1)
          window.promotedBuiltIds[layer.id].push(bidStr);
      }
      window._editingBuildingId = buildingId;
      if (typeof refreshTilesetFilter === 'function') refreshTilesetFilter(layer);

      var f = function() { return ''; };
      $el.html(panel.render(tileProps, f));
      appendEditSection($el, tileKey, tileProps, layer, realGeom);

      if (typeof loadDrawnFeatureForEditing === 'function')
        loadDrawnFeatureForEditing(layer, tileKey, realGeom);
    });

    return;
  }

  // For UUID-keyed drawn features, resolve the actual Supabase feature_id via _drawKeyToDbId
  var lookupId = drawKey;
  if (drawKey && typeof _drawKeyToDbId !== 'undefined' && _drawKeyToDbId[drawKey] !== undefined) {
    lookupId = String(_drawKeyToDbId[drawKey]);
  }

  // Enter draw edit mode immediately — don't wait for the Supabase fetch
  if (drawKey && typeof loadDrawnFeatureForEditing === 'function' && geometry) {
    loadDrawnFeatureForEditing(layer, drawKey, geometry);
  }

  // Fast path: no async fetching needed
  if (!panel.supabaseLookup && !(panel.encyclopediaBase && nid)) {
    var f = function() { return ""; };
    $el.html(panel.render(props, f));
    appendEditSection($el, drawKey || null, props, layer, geometry);
    $el.slideDown();
    return;
  }

  $el.html("<p style='padding:5px;'>Loading...</p>");
  $el.slideDown();

  // Step 1: fetch live fields from Supabase.
  // Drawn features (have _drawKey): look up by feature_id.
  // Tileset features: look up by NID.
  var supabasePromise;
  if (panel.supabaseLookup && window.supabaseClient && drawKey) {
    supabasePromise = window.supabaseClient
      .from("ames_buildings_2026")
      .select("id,label,DayStart,DayEnd,nid,notes")
      .eq("id", lookupId)
      .limit(1)
      .then(function(r) { return (!r.error && r.data && r.data.length) ? r.data[0] : null; })
      .catch(function() { return null; });
  } else if (panel.supabaseLookup && window.supabaseClient && nid) {
    supabasePromise = window.supabaseClient
      .from("ames_buildings_2026")
      .select("id,label,DayStart,DayEnd,nid,notes")
      .eq("nid", String(nid))
      .limit(1)
      .then(function(r) { return (!r.error && r.data && r.data.length) ? r.data[0] : null; })
      .catch(function() { return null; });
  } else {
    supabasePromise = Promise.resolve(null);
  }

  supabasePromise.then(function(live) {
    var featureId = drawKey ? (typeof _drawKeyToDbId !== 'undefined' && _drawKeyToDbId[drawKey] != null ? _drawKeyToDbId[drawKey] : drawKey) : null;
    if (live) {
      props = Object.assign({}, props);
      featureId         = live.id        || featureId;
      if (live.id)            props.id       = live.id;
      if (live.label)         props.label    = live.label;
      if (live.DayStart)      props.DayStart = live.DayStart;
      if (live.DayEnd)        props.DayEnd   = live.DayEnd;
      if (live.notes != null) props.notes    = live.notes;
    }

    // Step 2: fetch Drupal content, or render with empty f()
    if (panel.encyclopediaBase && nid) {
      fetch(panel.encyclopediaBase + "/rendered-export-single?nid=" + nid)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!data || !data[0] || !data[0].rendered_entity) throw new Error('empty');
          var docEl = document.createElement("div");
          docEl.innerHTML = processEncyclopediaHtml(data[0].rendered_entity, panel.encyclopediaBase);
          var $doc = $(docEl);

          var $titleLink = $doc.find("h2.node__title a");
          var titleHref  = $titleLink.attr("href") || "";
          var titleText  = $titleLink.text().trim() || "";
          $titleLink.closest("h2").hide();

          // f()                      → full processed doc HTML
          // f("node-url")            → href from node title link
          // f("node-title")          → plain text of node title
          // f("field-name", "hero")  → first <img> from that field, removes it from doc
          // f("field-name")          → plain text of field's first item
          // f("field-name", "html")  → inner HTML of field (for linked entity fields)
          // f("field-name", "imgs")  → all <img> tags in field joined
          var f = function(name, mode) {
            if (!name)                 return $doc.html();
            if (name === "node-url")   return titleHref;
            if (name === "node-title") return titleText;
            if (name === "all-images") return $doc.find("img").map(function() { return this.outerHTML; }).get().join("");
            if (mode === "hero") {
              var $field = $doc.find(".field--name-" + name);
              var img = $field.find("img").first().prop("outerHTML") || "";
              $field.remove();
              return img;
            }
            var $items = $doc.find(".field--name-" + name + " .field__item");
            if (!$items.length) $items = $doc.find(".field--name-" + name + ".field__item");
            if (mode === "html") return $items.first().html() || "";
            if (mode === "imgs") return $items.find("img").map(function() { return this.outerHTML; }).get().join("");
            return $items.first().text().trim();
          };

          var rendered = document.createElement("div");
          rendered.innerHTML = panel.render(props, f);
          // Auto-remove <p> blocks that have a <b> label but empty content
          $(rendered).find("p").each(function() {
            var $p = $(this);
            if ($p.find("b").length) {
              var clone = $p.clone();
              clone.find("b, br").remove();
              if (!clone.text().trim()) $p.remove();
            }
          });
          $el.html(rendered.innerHTML);
          appendEditSection($el, featureId, props, layer, geometry);
        })
        .catch(function() {
          var f = function() { return ""; };
          $el.html(panel.render(props, f));
          appendEditSection($el, featureId, props, layer, geometry);
        });
    } else {
      var f = function() { return ""; };
      $el.html(panel.render(props, f));
      appendEditSection($el, featureId, props, layer, geometry);
    }
  });
}

function closePanelInfo(layer) {
  var state = infoPanelState[layer.id];
  $("#" + state.divId).slideUp();
  state.isOpen = false;
  setPanelHighlight(layer, state.viewId, false);
  if (state.afterPopup.isOpen()) state.afterPopup.remove();
  if (state.beforePopup.isOpen()) state.beforePopup.remove();
  if (typeof clearDrawnFeatureEditing === 'function') clearDrawnFeatureEditing(false);
}

function setPanelHighlight(layer, featureId, hover) {
  if (featureId == null) return;
  var sourceLayer = layer["source-layer"];
  afterMap.setFeatureState(
    { source: layer.id + "-right", sourceLayer: sourceLayer, id: featureId },
    { hover: hover }
  );
  beforeMap.setFeatureState(
    { source: layer.id + "-left", sourceLayer: sourceLayer, id: featureId },
    { hover: hover }
  );
}

function showPanelPopups(state, lngLat, html) {
  state.afterPopup.setLngLat(lngLat).setHTML(html);
  if (!state.afterPopup.isOpen()) state.afterPopup.addTo(afterMap);
  state.beforePopup.setLngLat(lngLat).setHTML(html);
  if (!state.beforePopup.isOpen()) state.beforePopup.addTo(beforeMap);
}

function floatPanelToTop(divId) {
  if ($(".infoLayerElem").first().attr("id") !== divId)
    $("#" + divId).insertBefore($(".infoLayerElem").first());
}

function openSidebarIfHidden() {
  if ($("#view-hide-layer-panel").length > 0)
    if (!layer_view_flag) $("#view-hide-layer-panel").trigger("click");
}

function processEncyclopediaHtml(html, base) {
  var origin = base.replace(/^(https?:\/\/[^\/]+).*/, "$1");
  return html
    .replace(/(<a\s+href=")([^"]+)(")/g, function(_, p1, p2, p3) {
      if (p2.slice(0, 4) === "http") return p1 + p2 + p3;
      return p1 + origin + p2 + p3;
    })
    .replace(/(<a\s+[^>]*)(>)/g, function(_, p1, p2) {
      return p1 + ' target="_blank"' + p2;
    })
    .replace(/(<img.*src=")([^"]+)(")/g, function(_, p1, p2, p3) {
      if (p2.slice(0, 4) === "http") return p1 + p2 + p3;
      return p1 + origin + p2 + p3;
    });
}

function appendEditSection($el, featureId, props, layer, geometry) {
  if (!window.editMode || !featureId) return;

  function toDateInput(yyyymmdd) {
    if (!yyyymmdd) return '';
    var s = String(yyyymmdd).padStart(8, '0');
    return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8);
  }

  function fromDateInput(val) {
    if (!val) return null;
    return parseInt(val.replace(/-/g, ''), 10) || null;
  }

  var editId = 'edit-section-' + featureId;
  var html = [
    '<div class="edit-section" id="' + editId + '">',
      '<hr/>',
      '<p class="edit-section-title">Edit</p>',
      '<label class="edit-label">Label</label>',
      '<input type="text" class="edit-input" id="ei-label" maxlength="25" value="' + (props.label || '') + '"/>',
      '<label class="edit-label">Start Date</label>',
      '<input type="date"  class="edit-input" id="ei-daystart" value="' + toDateInput(props.DayStart) + '"/>',
      '<label class="edit-label">End Date</label>',
      '<input type="date"  class="edit-input" id="ei-dayend"   value="' + toDateInput(props.DayEnd) + '"/>',
      '<label class="edit-label">Notes</label>',
      '<textarea class="edit-input" id="ei-notes" maxlength="500">' + (props.notes || '') + '</textarea>',
      '<button class="edit-save-btn" id="ei-save">Save</button>',
      '<p class="edit-status" id="ei-status"></p>',
    '</div>',
  ].join('');

  $el.append(html);

  $el.append(
    '<div class="edit-section">' +
      '<hr/>' +
      '<p class="edit-section-title">Debug — Supabase Data</p>' +
      '<pre style="font-size:11px;overflow:auto;max-height:200px;background:#f5f5f5;padding:6px;border-radius:3px;">' +
        JSON.stringify({ featureId: featureId, props: props }, null, 2) +
      '</pre>' +
    '</div>'
  );

  var isDrawn = !!props._drawKey;

  document.getElementById('ei-save').addEventListener('click', async function () {
    var labelVal    = document.getElementById('ei-label').value.trim() || null;
    var dayStartVal = fromDateInput(document.getElementById('ei-daystart').value);
    var dayEndVal   = fromDateInput(document.getElementById('ei-dayend').value);
    var notesVal    = document.getElementById('ei-notes').value.trim() || null;

    // For drawn features, capture updated geometry from the overlay
    var savedGeom = geometry;
    if (isDrawn && typeof drawOverlayDraw !== 'undefined' && drawOverlayDraw) {
      var all = drawOverlayDraw.getAll();
      if (all.features.length > 0) savedGeom = all.features[0].geometry;
    }

    var statusEl = document.getElementById('ei-status');
    var btn      = document.getElementById('ei-save');

    btn.disabled         = true;
    statusEl.textContent = 'Saving...';

    // Resolve ames_buildings_2026.id — drawn features use _drawKeyToDbId; promoted use buildingId
    var _saveId = null;
    if (props._drawKey && typeof _drawKeyToDbId !== 'undefined') {
      var _dk0 = String(props._drawKey);
      if (_drawKeyToDbId[_dk0] !== undefined) _saveId = _drawKeyToDbId[_dk0];
    }
    if (_saveId == null) {
      _saveId = props._tileFeatureId != null ? props._tileFeatureId
              : props.id             != null ? props.id
              : null;
    }

    if (!_saveId || !window.supabaseClient) {
      statusEl.textContent = 'Error: could not resolve building id.';
      btn.disabled = false;
      return;
    }

    var _prevProps = { nid: props.nid, label: props.label || null, DayStart: props.DayStart || null, DayEnd: props.DayEnd || null, notes: props.notes || null };
    var _nextProps = { nid: props.nid, label: labelVal, DayStart: dayStartVal, DayEnd: dayEndVal, notes: notesVal };
    var _prevGeom  = geometry;
    var _nextGeom  = savedGeom;
    var _dk        = props._drawKey ? String(props._drawKey) : null;

    var result = await window.supabaseClient
      .from('ames_buildings_2026')
      .update({ label: labelVal, DayStart: dayStartVal, DayEnd: dayEndVal, notes: notesVal, geom: toMultiPolygon(savedGeom) })
      .eq('id', _saveId);

    if (result.error) {
      statusEl.textContent = 'Error: ' + result.error.message;
    } else {
      statusEl.textContent = 'Saved.';

      function _applyUndo(bProps, bGeom) {
        return async function() {
          await window.supabaseClient.from('ames_buildings_2026')
            .update({ label: bProps.label, DayStart: bProps.DayStart, DayEnd: bProps.DayEnd, notes: bProps.notes, geom: toMultiPolygon(bGeom) })
            .eq('id', _saveId);
          if (_dk) addDrawnFeature(layer, _dk, bGeom, bProps);
        };
      }

      pushUndo(_applyUndo(_prevProps, _prevGeom), _applyUndo(_nextProps, _nextGeom));

      if (_dk) {
        addDrawnFeature(layer, _dk, savedGeom, _nextProps);
        if (typeof clearDrawnFeatureEditing === 'function') clearDrawnFeatureEditing(true);
      }
    }
    btn.disabled = false;
  });
}

function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}
