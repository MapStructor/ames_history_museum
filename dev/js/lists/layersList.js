const layers = [
//Railroads
    {
    id: "rail-roads",
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
//Confirmed Roads
   {
    id: "confirmed-roads",
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
//Proximity Roads
   {
    id: "proxy-roads",
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
//Lot Lines
   {
    id: "lot-lines",
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
//City Limits
   {
    id: "city-limits",
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
//Previous Buildings
    {
    id: "prev-builds",
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
//Parcels
    {
    id: "parcels-parcels",
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
//Subdivision Parcels
    {
    id: "parcels-subs",
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
//Pre-Subdivisions
    {
    id: "plss-own",
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
//Story County Land Patents
    {
    id: "land-patents",
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
];
