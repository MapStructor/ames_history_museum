
const groupedSections = [

//Roads
  [
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
  },
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
  },
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
  },

  /*
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
  }
    */

  ],

//Buildings
  [
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
  },
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
  },
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
  }
  ],

//Parcels
  [
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
  },
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
  },
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
  }
  ],

];


const singleLayers = [

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
  },
//Subdivisions
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
  },
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

  }


  ];


  /*
  {
    id: "plss-parcels",
    name: "plss-parcels",
    label: "PLSS Parcels",
    iconColor: "#00ff7f",
	className: "plss_parcels_layer",
    topLayerClass: "plss_parcels_layer",
    isSolid: true,
    iconType: "square",
    checked: false,
  },
  */
