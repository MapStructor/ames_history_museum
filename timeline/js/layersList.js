const afterLineLayers = [
    {
    id: "rail-roads-right",
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
      "line-color": "#FF0000",
      "line-width": 3,
      "line-opacity": 1.0,
    },
    toggleElement: "rail-roads"
   },
   {
    id: "confirmed-roads-right",
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
      "line-width": 2,
      "line-opacity": 1.0,
    },
    toggleElement: "confirmed-roads"
   },
   {
    id: "sub-roads-right",
    type: "line",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.5a51yr96",
    },
    layout: {
      visibility: "visible", 
    },
    "source-layer": "roads_subd_ames_iowa-apmxo6",
    paint: {
      "line-color": "#808080",
      "line-width": 2,
      "line-opacity": 1.0,
    },
    toggleElement: "sub-roads"
   },
   {
    id: "proxy-roads-right",
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
      "line-width": 2,
      "line-opacity": 1.0,
    },
    toggleElement: "proxy-roads"
   },
   {
    id: "lot-lines-right",
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
];

const beforeLineLayers = [
    {
    id: "rail-roads-left",
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
      "line-color": "#FF0000",
      "line-width": 3,
      "line-opacity": 1.0,
    },
    toggleElement: "rail-roads"
    },
    {
    id: "confirmed-roads-left",
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
      "line-width": 2,
      "line-opacity": 1.0,
    },
    toggleElement: "confirmed-roads"
   },
   {
    id: "sub-roads-left",
    type: "line",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.5a51yr96",
    },
    layout: {
      visibility: "visible", 
    },
    "source-layer": "roads_subd_ames_iowa-apmxo6",
    paint: {
      "line-color": "#808080",
      "line-width": 2,
      "line-opacity": 1.0,
    },
    toggleElement: "sub-roads"
   },
   {
    id: "proxy-roads-left",
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
      "line-width": 2,
      "line-opacity": 1.0,
    },
    toggleElement: "proxy-roads"
   },
   {
    id: "lot-lines-left",
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
];

const afterAreaLayers = [
    {
    id: "city-limits-right",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.aztmvbuc",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "city_limits-0cql6y",
    paint: {
      "fill-color": "#6495ED",
      "fill-opacity": 0.2,
      "fill-outline-color": "#6495ED",
    },
    toggleElement: "city-limits"
    },
    {
    id: "prev-builds-right",
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
        0.2,
      ],
      "fill-outline-color": "#FF7F50",
    },
    toggleElement: "prev-builds"
    },
	{
    id: "prev-builds-right-highlighted",
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
        0.7,
        0,
      ],
      "fill-outline-color": "#FF7F50",
    },
    toggleElement: "prev-builds"
    },
    {
	id: "curr-builds-right",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.1f6os6ce",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "current_buildings-0dk1i0",
    paint: {
      "fill-color": "#35b779",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.5,
        0.2,
      ],
      "fill-outline-color": "#35b779",
    },
    toggleElement: "curr-builds"
    },
	{
	id: "curr-builds-right-highlighted",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.1f6os6ce",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "current_buildings-0dk1i0",
    paint: {
      "fill-color": "#35b779",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.7,
        0,
      ],
      "fill-outline-color": "#35b779",
    },
    toggleElement: "curr-builds"
    },
	{
	id: "parcels-parcels-right",
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
      "fill-color": "#ff1493",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.2,
        0.1,
      ],
      "fill-outline-color": "#FFD700",
    },
    toggleElement: "parcels-parcels"
    },
	{
	id: "parcels-parcels-right-highlighted",
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
      "fill-color": "#ff1493",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.3,
        0,
      ],
      "fill-outline-color": "#FFD700",
    },
    toggleElement: "parcels-parcels"
    },
    {
	id: "parcels-subs-right",
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
    toggleElement: "parcels-subs"
    },
	{
	id: "parcels-subs-right-highlighted",
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
        0.6,
        0,
      ],
      "fill-outline-color": "#000000",
    },
	toggleElement: "parcels-subs"
    },
	{
	id: "plss-own-right",
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
    toggleElement: "plss-own"
    },
	{
	id: "plss-own-right-highlighted",
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
        0.7,
        0,
      ],
      "fill-outline-color": "#000000",
    },
    toggleElement: "plss-own"
    },
    {
	id: "plss-parcels-right",
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
    {
	id: "land-patents-right",
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
    toggleElement: "land-patents"
    },
	{
	id: "land-patents-right-highlighted",
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
        0.7,
        0,
      ],
      "fill-outline-color": "#000000",
    },
    toggleElement: "land-patents"
    },
];

const beforeAreaLayers = [
   {
    id: "city-limits-left",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.aztmvbuc",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "city_limits-0cql6y",
    paint: {
      "fill-color": "#6495ED",
      "fill-opacity": 0.2,
      "fill-outline-color": "#6495ED",
    },
    toggleElement: "city-limits"
    },
	{
    id: "prev-builds-left",
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
        0.2,
      ],
      "fill-outline-color": "#FF7F50",
    },
    toggleElement: "prev-builds"
    },
    {
    id: "prev-builds-left-highlighted",
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
        0.7,
        0,
      ],
      "fill-outline-color": "#FF7F50",
    },
    toggleElement: "prev-builds"
    },
    {
	id: "curr-builds-left",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.1f6os6ce",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "current_buildings-0dk1i0",
    paint: {
      "fill-color": "#35b779",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.5,
        0.2,
      ],
      "fill-outline-color": "#35b779",
    },
    toggleElement: "curr-builds"
    },
    {
	id: "curr-builds-left-highlighted",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://nittyjee.1f6os6ce",
    },
    layout: {
      visibility: "visible",
    },
    "source-layer": "current_buildings-0dk1i0",
    paint: {
      "fill-color": "#35b779",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.7,
        0,
      ],
      "fill-outline-color": "#35b779",
    },
    toggleElement: "curr-builds"
    },
	{
	id: "parcels-parcels-left",
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
      "fill-color": "#ff1493",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.2,
        0.1,
      ],
      "fill-outline-color": "#FFD700",
    },
	toggleElement: "parcels-parcels"
    },
	{
	id: "parcels-parcels-left-highlighted",
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
      "fill-color": "#ff1493",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.3,
        0,
      ],
      "fill-outline-color": "#FFD700",
    },
    toggleElement: "parcels-parcels"
    },
    {
	id: "parcels-subs-left",
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
    toggleElement: "parcels-subs"
    },
	{
	id: "parcels-subs-left-highlighted",
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
        0.6,
        0,
      ],
      "fill-outline-color": "#000000",
    },
    toggleElement: "parcels-subs"
    },
    {
	id: "plss-own-left",
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
    toggleElement: "plss-own"
    },
	{
	id: "plss-own-left-highlighted",
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
        0.7,
        0,
      ],
      "fill-outline-color": "#000000",
    },
	toggleElement: "plss-own"
    },
    {
	id: "plss-parcels-left",
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
    {
	id: "land-patents-left",
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
    toggleElement: "land-patents"
    },
	{
	id: "land-patents-left-highlighted",
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
        0.7,
        0,
      ],
      "fill-outline-color": "#000000",
    },
    toggleElement: "land-patents"
    },
];
