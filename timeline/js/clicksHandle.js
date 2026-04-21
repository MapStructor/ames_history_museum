/* =========================================================
   CLICK / POPUP CONFIG
   ========================================================= */

const layerClickConfigs = [
  {
    id: "prev-builds",
    groupId: "builds_items",
    sourceLayer: "previous_buildings-02rrmr",
    popupClass: "infoLayerCoralPopUp",
    featureLabelProp: "label",
    hover: true,
  },
  /*
  {
    id: "parcels-subs",
    groupId: "parcels_items",
    sourceLayer: "subdivisions-67jdnv",
    popupClass: "infoLayerSlateBluePopUp",
    featureLabelProp: "label",
    hover: true,
  },
  */
  {
    id: "plss-own",
    groupId: "plss_parcels_items",
    sourceLayer: "plss_ownership_boundaries-7d8k3v",
    popupClass: "infoLayerAquaPopUp",
    featureLabelProp: "LABEL",
    hover: true,
  }
];

/* =========================================================
   REFACTORED CLICK / POPUP SYSTEM
   ========================================================= */

function setupLayerClickInfo({
  id,
  groupId,
  sourceLayer,
  popupClass,
  featureLabelProp = "label",
  hover = true
}) {
  let viewId = null;

  const afterPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 5,
  });

  const beforePopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 5,
  });

  const layerLeft = `${id}-left`;
  const layerRight = `${id}-right`;
  const highlightLeft = `${id}-left-highlighted`;
  const highlightRight = `${id}-right-highlighted`;

  const mainCheckbox = document.getElementById(id);
  const groupCheckbox = document.getElementById(groupId);

  function setHighlight(map, source, featureId, isHovered) {
    if (!hover || featureId == null) return;

    map.setFeatureState(
      {
        source,
        sourceLayer,
        id: featureId,
      },
      { hover: isHovered }
    );
  }

  function buildPopupHTML(event) {
    const labelValue = event.features?.[0]?.properties?.[featureLabelProp] ?? "";
    return `<div class="${popupClass}">${labelValue}</div>`;
  }

  function closeInfo() {
    setHighlight(afterMap, highlightRight, viewId, false);
    setHighlight(beforeMap, highlightLeft, viewId, false);

    viewId = null;

    if (afterPopup.isOpen()) afterPopup.remove();
    if (beforePopup.isOpen()) beforePopup.remove();
  }

  function openInfo(event) {
    const clickedId = event.features?.[0]?.id;
    if (clickedId == null) return;

    const popupHTML = buildPopupHTML(event);

    setHighlight(afterMap, highlightRight, viewId, false);
    setHighlight(afterMap, highlightRight, clickedId, true);

    setHighlight(beforeMap, highlightLeft, viewId, false);
    setHighlight(beforeMap, highlightLeft, clickedId, true);

    viewId = clickedId;

    afterPopup.setLngLat(event.lngLat).setHTML(popupHTML);
    beforePopup.setLngLat(event.lngLat).setHTML(popupHTML);

    if (!afterPopup.isOpen()) afterPopup.addTo(afterMap);
    if (!beforePopup.isOpen()) beforePopup.addTo(beforeMap);
  }

  function clickHandle(event) {
    const clickedId = event.features?.[0]?.id;
    if (clickedId == null) return;

    if (viewId === clickedId) {
      closeInfo();
      return;
    }

    openInfo(event);
  }

  beforeMap.on("click", layerLeft, clickHandle);
  afterMap.on("click", layerRight, clickHandle);

  if (mainCheckbox) {
    mainCheckbox.addEventListener("change", function () {
      if (!mainCheckbox.checked) closeInfo();
    });
  }

  if (groupCheckbox) {
    groupCheckbox.addEventListener("change", function () {
      if (!groupCheckbox.checked) closeInfo();
    });
  }
}

/* =========================================================
   INIT
   ========================================================= */

layerClickConfigs.forEach(setupLayerClickInfo);