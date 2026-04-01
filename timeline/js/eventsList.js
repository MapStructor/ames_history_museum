let hoveredID = new Array();
let hoverPopUp = new Array();

const eventLayers = [
	{
		"index": "1",
		"layerID": "prev-builds",
		"layerIDhigh": "prev-builds-highlighted",
		"layerSource": "previous_buildings-02rrmr",
		"popupParamsList": ["label"],
		"popupStyle": "infoLayerCoralPopUp",
    },
	{
		"index": "2",
		"layerID": "curr-builds",
		"layerIDhigh": "curr-builds-highlighted",
		"layerSource": "buildings_ames_2026-9v0yur",
		"popupParamsList": [],
		"popupStyle": "infoLayerGreenPopUp",
    },
	{
		"index": "3",
		"layerID": "parcels-parcels",
		"layerIDhigh": "parcels-parcels-highlighted",
		"layerSource": "parcels-136ib8",
		"popupParamsList": [],
		"popupStyle": "infoLayerPinkPopUp",
    },
	{
		"index": "4",
		"layerID": "parcels-subs",
		"layerIDhigh": "parcels-subs-highlighted",
		"layerSource": "subdivisions-67jdnv",
		"popupParamsList": ["label"],
		"popupStyle": "infoLayerSlateBluePopUp",
    },
	{
		"index": "5",
		"layerID": "plss-own",
		"layerIDhigh": "plss-own-highlighted",
		"layerSource": "plss_ownership_boundaries-7d8k3v",
		"popupParamsList": ["LABEL"],
		"popupStyle": "infoLayerAquaPopUp",
    },
	{
		"index": "6",
		"layerID": "land-patents",
		"layerIDhigh": "land-patents-highlighted",
		"layerSource": "land_patents_story_county-3r2b0g",
		"popupParamsList": [],
		"popupStyle": "infoLayerYellowPopUp",
    },
];
