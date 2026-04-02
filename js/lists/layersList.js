const layers = [
//Railroads
    {
    id: "rail-roads",
    name: "rail-roads",
    label: "Railroads",
    iconColor: "#ff0000",
    className: "rail_roads_layer",
    topLayerClass: "rail_roads_layer",
    isSolid: true,
    iconType: "slash",
    checked: true,
    containerId: "rail-roads-cont",
    zoomCenter: [-93.64029, 42.04075],
    zoomLevel: 12.6,
    infoId: "rail-roads-info-layer",
    type: "line",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.bfibuetx",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "railroads-bdj6n3",
    paint: {
      "line-color": "#ea00ff",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 0.5,
        12, 1.5,
        16, 3,
        20, 6
      ],
      "line-opacity": 1.0,
    },
    toggleElement: "rail-roads"
   },
//Roads
    {
    type: "group",
    id: "roads_items",
    containerId: "roads-section-layers",
    caretId: "roads-layer-caret",
    label: "Roads",
    itemSelector: ".roads_layer_item",
    zoomCenter: [-93.64369, 42.02561],
    zoomLevel: 12.3,
    infoId: "roads-info-layer",
    collapsed: true,
    checked: true,
    children: [
//Confirmed Roads
   {
    id: "confirmed-roads",
    name: "confirmed-roads",
    label: "Confirmed Roads",
    iconColor: "#A9A9A9",
    className: "roads_layer",
    topLayerClass: "roads_layer",
    isSolid: true,
    iconType: "slash",
    checked: true,
    type: "line",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.5u39kagk",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "roads_maps_ames_iowa-4rufgk",
    paint: {
      "line-color": "#A9A9A9",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 0.5,
        12, 1.5,
        16, 3,
        20, 6
      ],
      "line-opacity": 1.0,
    },
    toggleElement: "confirmed-roads"
   },
//Subdivions Roads
   {
    id: "sub-roads",
    name: "sub-roads",
    label: "Subdivision Roads",
    iconColor: "#808080",
    className: "roads_layer",
    topLayerClass: "roads_layer",
    isSolid: true,
    iconType: "slash",
    checked: true,
    type: "line",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.4k1su4m3",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "roads_subd_ames_iowa_2026-8t8va0",
    paint: {
      "line-color": "#00b7ff",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 0.5,
        13, 2,
        15, 3.5,
        18, 6,
        19, 26
      ],
      "line-opacity": 0.5,
      "line-blur": 0
    },
    toggleElement: "sub-roads"
   },
  /*
//Proximity Roads
   {
    id: "proxy-roads",
    name: "proxy-roads",
    label: "Proximity",
    iconColor: "#696969",
    className: "roads_layer",
    topLayerClass: "roads_layer",
    isSolid: true,
    iconType: "slash",
    checked: true,
    type: "line",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.proxy-roads",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "roads_proximity_ames_iowa-458tl3",
    paint: {
      "line-color": "#696969",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 0.5,
        12, 1.5,
        16, 3,
        20, 6
      ],
      "line-opacity": 1.0,
    },
    toggleElement: "proxy-roads"
   },
  */
    ],
    },
//City Limits
   {
    id: "city-limits",
    name: "city-limits",
    label: "City Limits",
    iconColor: "#7ab11b",
    className: "city_limits_layer",
    topLayerClass: "city_limits_layer",
    isSolid: true,
    iconType: "slash",
    checked: true,
    containerId: "city-limits-cont",
    zoomCenter: [-93.63891, 42.02708],
    zoomLevel: 11.85,
    infoId: "city-limits-info-layer",
    type: "line",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.41zrmwvc",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "city_limits_lines_2026-a8hdoi",
    paint: {
      "line-color": "#00c610",
      "line-width": 4,
      "line-opacity": 1,
    },
    toggleElement: "city-limits"
    },
//Buildings
    {
    type: "group",
    id: "builds_items",
    containerId: "buildings-section-layers",
    caretId: "builds-layer-caret",
    label: "Buildings",
    itemSelector: ".builds_layer_item",
    zoomCenter: [-93.64369, 42.02561],
    zoomLevel: 12.3,
    infoId: "builds-info-layer",
    collapsed: true,
    checked: true,
    children: [
//Previous Buildings
    {
    id: "prev-builds",
    name: "prev-builds",
    label: "Previous buildings",
    iconColor: "#FF7F50",
    className: "builds_layer",
    topLayerClass: "builds_layer",
    isSolid: true,
    iconType: "square",
    checked: true,
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.421y21fx",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "previous_buildings-02rrmr",
    paint: {
      "fill-color": "#FF7F50",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.5,
        1,
      ],
      "fill-outline-color": "#FF7F50",
    },
    highlight: {
      "fill-color": "#FF7F50",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.7,
        0,
      ],
      "fill-outline-color": "#FF7F50",
    },
    groupId: "builds_items",
    popupStyle: "infoLayerCoralPopUp",
    prop: "label",
    click: true,
    toggleElement: "prev-builds"
    },
//Current Buildings
    {
    id: "curr-builds",
    name: "curr-builds",
    label: "Current buildings",
    iconColor: "#35b779",
    className: "builds_layer",
    topLayerClass: "builds_layer",
    isSolid: true,
    iconType: "square",
    checked: true,
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.du0aopr8",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "buildings_ames_2026-9v0yur",
    paint: {
      "fill-color": "#ffb255",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.5,
        1.0,
      ],
      "fill-outline-color": "#ff0000",
    },
    highlight: {
      "fill-color": "#35b779",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.7,
        0,
      ],
      "fill-outline-color": "#35b779",
    },
    groupId: "builds_items",
    popupStyle: "infoLayerGreenPopUp",
    toggleElement: "curr-builds"
    },
    ],
    },
//Properties
    {
    type: "section",
    children: [
//Pre-Subdivisions
    {
    id: "plss-own",
    name: "plss-own",
    label: "Pre-Subdivisions",
    iconColor: "#00E5D9",
    className: "pre_subdivisions",
    topLayerClass: "pre_subdivisions_layer",
    isSolid: true,
    iconType: "square",
    checked: true,
    containerId: "pre-subdivisions-cont",
    zoomCenter: [-93.61106, 42.02711],
    zoomLevel: 14.27,
    infoId: "pre-subdivisions-info-layer",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.blb6xx89",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "plss_ownership_boundaries-7d8k3v",
    paint: {
      "fill-color": "#00E5D9",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.5,
        0.2,
      ],
      "fill-outline-color": "#000000",
    },
    highlight: {
      "fill-color": "#00E5D9",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.7,
        0,
      ],
      "fill-outline-color": "#000000",
    },
    groupId: "plss_parcels_items",
    popupStyle: "infoLayerAquaPopUp",
    prop: "LABEL",
    click: true,
    toggleElement: "plss-own"
    },
//Parcels
    {
    type: "group",
    id: "parcels_items",
    containerId: "parcels-section-layers",
    caretId: "parcels-layer-caret",
    label: "Parcels",
    itemSelector: ".parcels_layer_item",
    zoomCenter: [-93.64369, 42.02561],
    zoomLevel: 12.3,
    infoId: "parcels-info-layer",
    collapsed: true,
    checked: false,
    children: [
//Lot Lines
   {
    id: "lot-lines",
    name: "lot-lines",
    label: "Lot Lines",
    iconColor: "#ffd700",
    className: "parcels_layer",
    topLayerClass: "parcels_layer",
    isSolid: false,
    iconType: "square",
    checked: false,
    type: "line",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.95nfth3k",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "lots-bv0zn0",
    paint: {
      "line-color": "#ffd700",
      "line-width": 2,
      "line-opacity": 1.0,
    },
    toggleElement: "lot-lines"
   },
//Parcels
    {
    id: "parcels-parcels",
    name: "parcels-parcels",
    label: "Parcels",
    iconColor: "#ff1493",
    className: "parcels_layer",
    topLayerClass: "parcels_layer",
    isSolid: true,
    iconType: "square",
    checked: false,
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.5eq8mpcd",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "parcels-136ib8",
    paint: {
      "fill-color": "#d1d1d1",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.2,
        0.1,
      ],
      "fill-outline-color": "#000000",
      "fill-outline-color-opacity": 1,
    },
    highlight: {
      "fill-color": "#ff1493",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.3,
        0,
      ],
      "fill-outline-color": "#FFD700",
    },
    groupId: "parcels_items",
    popupStyle: "infoLayerPinkPopUp",
    toggleElement: "parcels-parcels"
    },
    ],
    },
//Subdivision Parcels
    {
    id: "parcels-subs",
    name: "parcels-subs",
    label: "Subdivisions",
    iconColor: "#7b68ee",
    className: "subdivisions_layer",
    topLayerClass: "subdivisions_layer",
    isSolid: true,
    iconType: "square",
    checked: false,
    containerId: "subdivisions-cont",
    zoomCenter: [-93.64369, 42.02561],
    zoomLevel: 12.3,
    infoId: "subdivisions-info-layer",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.4ccvb6kg",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "subdivisions-67jdnv",
    paint: {
      "fill-color": "#7b68ee",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.4,
        0.2,
      ],
      "fill-outline-color": "#000000",
    },
    highlight: {
      "fill-color": "#7b68ee",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.6,
        0,
      ],
      "fill-outline-color": "#000000",
    },
    popupStyle: "infoLayerSlateBluePopUp",
    prop: "label",
    toggleElement: "parcels-subs"
    },
//Story County Land Patents
    {
    id: "land-patents",
    name: "land-patents",
    label: "Story County Land Patents",
    iconColor: "#e3ed58",
    className: "story_patents",
    topLayerClass: "story_patents_layer",
    isSolid: true,
    iconType: "square",
    checked: false,
    containerId: "story-patents-cont",
    zoomCenter: [-93.5116, 42.0363],
    zoomLevelLeft: 10,
    zoomLevelRight: 12.5,
    infoId: "story-patents-info-layer",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.5ttrrebx",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "land_patents_story_county-3r2b0g",
    paint: {
      "fill-color": "#e3ed58",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.5,
        0.2,
      ],
      "fill-outline-color": "#000000",
    },
    highlight: {
      "fill-color": "#e3ed58",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.7,
        0,
      ],
      "fill-outline-color": "#000000",
    },
    popupStyle: "infoLayerYellowPopUp",
    toggleElement: "land-patents"
    },
    ],
    },
/*
//PLSS Parcels
    {
    id: "plss-parcels",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.6o2n1b1w",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "plss_parcels_ames_area-cphlvs",
    paint: {
      "fill-color": "#00ff7f",
      "fill-opacity": 0.3,
      "fill-outline-color": "#000000",
    },
    toggleElement: "plss-parcels"
    },
*/
];
