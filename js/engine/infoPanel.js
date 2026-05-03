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
      }
    });
    afterMap.on("mouseleave", layer.id + "-right", function() {
      afterMap.getCanvas().style.cursor = "";
      if (hoveredId.right !== null)
        afterMap.setFeatureState({ source: layer.id + "-right", sourceLayer: sourceLayer, id: hoveredId.right }, { hover: false });
      hoveredId.right = null;
    });

    beforeMap.on("click", layer.id + "-left",  function(e) { handlePanelClick(layer, e); });
    afterMap.on("click",  layer.id + "-right", function(e) { handlePanelClick(layer, e); });
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

function handlePanelClick(layer, event) {
  if (infoPanelClickFired[layer.id]) return;
  infoPanelClickFired[layer.id] = true;
  setTimeout(function() { infoPanelClickFired[layer.id] = false; }, 300);

  var state     = infoPanelState[layer.id];
  var panel     = layer.panel;
  var props     = event.features[0].properties;
  var clickedId = event.features[0].id;
  var geometry  = event.features[0].geometry;

  var popupHTML =
    "<div class='" + state.popupClass + "'>" +
    (props.name || "") +
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
      .from("features")
      .select("feature_id,label,description,DayStart,DayEnd,nid")
      .eq("feature_id", drawKey)
      .limit(1)
      .then(function(r) { return (!r.error && r.data && r.data.length) ? r.data[0] : null; })
      .catch(function() { return null; });
  } else if (panel.supabaseLookup && window.supabaseClient && nid) {
    supabasePromise = window.supabaseClient
      .from("features")
      .select("feature_id,label,description,DayStart,DayEnd,nid")
      .eq("nid", String(nid))
      .limit(1)
      .then(function(r) { return (!r.error && r.data && r.data.length) ? r.data[0] : null; })
      .catch(function() { return null; });
  } else {
    supabasePromise = Promise.resolve(null);
  }

  supabasePromise.then(function(live) {
    var featureId = drawKey || null;  // drawn features always have a featureId
    if (live) {
      props = Object.assign({}, props);
      featureId            = live.feature_id  || featureId;
      if (live.label)       props.label       = live.label;
      if (live.description) props.description = live.description;
      if (live.DayStart)    props.DayStart    = live.DayStart;
      if (live.DayEnd)      props.DayEnd      = live.DayEnd;
    }

    // Step 2: fetch Drupal content, or render with empty f()
    if (panel.encyclopediaBase && nid) {
      fetch(panel.encyclopediaBase + "/rendered-export-single?nid=" + nid)
        .then(function(r) { return r.json(); })
        .then(function(data) {
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
    { source: layer.id + "-highlighted-right", sourceLayer: sourceLayer, id: featureId },
    { hover: hover }
  );
  beforeMap.setFeatureState(
    { source: layer.id + "-highlighted-left", sourceLayer: sourceLayer, id: featureId },
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
      '<input type="text"  class="edit-input" id="ei-label"    value="' + (props.label || '') + '"/>',
      '<label class="edit-label">Start Date</label>',
      '<input type="date"  class="edit-input" id="ei-daystart" value="' + toDateInput(props.DayStart) + '"/>',
      '<label class="edit-label">End Date</label>',
      '<input type="date"  class="edit-input" id="ei-dayend"   value="' + toDateInput(props.DayEnd) + '"/>',
      '<button class="edit-save-btn" id="ei-save">Save</button>',
      '<p class="edit-status" id="ei-status"></p>',
    '</div>',
  ].join('');

  $el.append(html);

  // Drawn features: load geometry into the draw overlay for editing
  var isDrawn = !!props._drawKey;
  if (isDrawn && typeof loadDrawnFeatureForEditing === 'function' && geometry) {
    loadDrawnFeatureForEditing(layer, String(props._drawKey), geometry);
  }

  document.getElementById('ei-save').addEventListener('click', async function () {
    var labelVal    = document.getElementById('ei-label').value.trim() || null;
    var dayStartVal = fromDateInput(document.getElementById('ei-daystart').value);
    var dayEndVal   = fromDateInput(document.getElementById('ei-dayend').value);

    // For drawn features, capture updated geometry from the overlay
    var savedGeom = geometry;
    if (isDrawn && typeof drawOverlayDraw !== 'undefined' && drawOverlayDraw) {
      var all = drawOverlayDraw.getAll();
      if (all.features.length > 0) savedGeom = all.features[0].geometry;
    }

    var payload = {
      label:     labelVal,
      DayStart:  dayStartVal,
      DayEnd:    dayEndVal,
      source:    isDrawn ? 'drawn' : 'edited',
      geom_json: savedGeom || null,
    };
    var statusEl = document.getElementById('ei-status');
    var btn      = document.getElementById('ei-save');

    btn.disabled         = true;
    statusEl.textContent = 'Saving...';

    var result = await window.supabaseClient
      .from('features')
      .update(payload)
      .eq('feature_id', featureId);

    if (result.error) {
      statusEl.textContent = 'Error: ' + result.error.message;
    } else {
      statusEl.textContent = 'Saved.';
      if (isDrawn) {
        var _dk  = String(props._drawKey);
        var _fid = parseInt(String(featureId), 10);
        var _prevProps = { nid: props.nid, label: props.label || null, DayStart: props.DayStart || null, DayEnd: props.DayEnd || null };
        var _nextProps = { nid: props.nid, label: labelVal, DayStart: dayStartVal, DayEnd: dayEndVal };
        var _prevGeom  = geometry;
        var _nextGeom  = savedGeom;
        pushUndo(
          async function() {
            await window.supabaseClient.from('features').update({ label: _prevProps.label, DayStart: _prevProps.DayStart, DayEnd: _prevProps.DayEnd, geom_json: _prevGeom }).eq('feature_id', _fid);
            addDrawnFeature(layer, _dk, _prevGeom, _prevProps);
          },
          async function() {
            await window.supabaseClient.from('features').update({ label: _nextProps.label, DayStart: _nextProps.DayStart, DayEnd: _nextProps.DayEnd, geom_json: _nextGeom }).eq('feature_id', _fid);
            addDrawnFeature(layer, _dk, _nextGeom, _nextProps);
          }
        );
        addDrawnFeature(layer, _dk, savedGeom, _nextProps);
        if (typeof clearDrawnFeatureEditing === 'function') clearDrawnFeatureEditing(true);
      } else if (layer && layer.panel && layer.panel.supabaseLookup && geometry) {
        var nidVal = props[layer.panel.nidProp];
        if (nidVal != null) {
          var _fid2      = parseInt(String(featureId), 10);
          var _prevP     = Object.assign({}, props);
          var _nextP     = Object.assign({}, props, { label: labelVal, DayStart: dayStartVal, DayEnd: dayEndVal });
          pushUndo(
            async function() {
              if (window.supabaseClient && _fid2) await window.supabaseClient.from('features').update({ label: _prevP.label || null, DayStart: _prevP.DayStart || null, DayEnd: _prevP.DayEnd || null }).eq('feature_id', _fid2);
              promoteFeature(layer, nidVal, geometry, Object.assign({}, _prevP));
            },
            async function() {
              if (window.supabaseClient && _fid2) await window.supabaseClient.from('features').update({ label: _nextP.label || null, DayStart: _nextP.DayStart || null, DayEnd: _nextP.DayEnd || null }).eq('feature_id', _fid2);
              promoteFeature(layer, nidVal, geometry, Object.assign({}, _nextP));
            }
          );
          promoteFeature(layer, nidVal, geometry, Object.assign({}, _nextP));
        }
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
