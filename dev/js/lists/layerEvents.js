const layerEvents = [
  {
    id: "prev-builds",
    sourceLayer: "previous_buildings-02rrmr",
    groupId: "builds_items",
    hover: {
      popupStyle: "infoLayerCoralPopUp",
      params: ["label"],
    },
    click: {
      popupStyle: "infoLayerCoralPopUp",
      prop: "label",
    },
  },
  {
    id: "curr-builds",
    sourceLayer: "buildings_ames_2026-9v0yur",
    groupId: "builds_items",
    hover: {
      popupStyle: "infoLayerGreenPopUp",
      params: [],
    },
    click: null,
  },
  {
    id: "parcels-parcels",
    sourceLayer: "parcels-136ib8",
    groupId: "parcels_items",
    hover: {
      popupStyle: "infoLayerPinkPopUp",
      params: [],
    },
    click: null,
  },
  {
    id: "parcels-subs",
    sourceLayer: "subdivisions-67jdnv",
    groupId: null,
    hover: {
      popupStyle: "infoLayerSlateBluePopUp",
      params: ["label"],
    },
    click: null,
  },
  {
    id: "plss-own",
    sourceLayer: "plss_ownership_boundaries-7d8k3v",
    groupId: "plss_parcels_items",
    hover: {
      popupStyle: "infoLayerAquaPopUp",
      params: ["LABEL"],
    },
    click: {
      popupStyle: "infoLayerAquaPopUp",
      prop: "LABEL",
    },
  },
  {
    id: "land-patents",
    sourceLayer: "land_patents_story_county-3r2b0g",
    groupId: null,
    hover: {
      popupStyle: "infoLayerYellowPopUp",
      params: [],
    },
    click: null,
  },
];
