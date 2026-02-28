// List of layers with 

let hoveredID = new Array();
let hoverPopUp = new Array();

const afterEventLayers = [
	{
		"index": "right_1",
		"layerID": "prev-builds-right",
		"layerIDhigh":"prev-builds-right-highlighted",
		"layerSource": "previous_buildings-02rrmr",
		"popupParamsList": ["label"],
		"popupStyle": "infoLayerCoralPopUp",
    },
	{
		"index": "right_2",
		"layerID": "curr-builds-right",
		"layerIDhigh":"curr-builds-right-highlighted",
		"layerSource": "current_buildings-0dk1i0",
		"popupParamsList": [],
		"popupStyle": "infoLayerGreenPopUp",
    },
	{
		"index": "right_3",
		"layerID": "parcels-parcels-right",
		"layerIDhigh":"parcels-parcels-right-highlighted",
		"layerSource": "parcels-136ib8",
		"popupParamsList": [],
		"popupStyle": "infoLayerPinkPopUp",
    },
	{
		"index": "right_4",
		"layerID": "parcels-subs-right",
		"layerIDhigh":"parcels-subs-right-highlighted",
		"layerSource": "subdivisions-67jdnv",
		"popupParamsList": ["label"],
		"popupStyle": "infoLayerSlateBluePopUp",
    },
	{
		"index": "right_5",
		"layerID": "plss-own-right",
		"layerIDhigh":"plss-own-right-highlighted",
		"layerSource": "plss_ownership_boundaries-7d8k3v",
		"popupParamsList": ["LABEL"],
		"popupStyle": "infoLayerAquaPopUp",
    },
	{
		"index": "right_6",
		"layerID": "land-patents-right",
		"layerIDhigh":"land-patents-right-highlighted",
		"layerSource": "land_patents_story_county-3r2b0g",
		"popupParamsList": [],
		"popupStyle": "infoLayerYellowPopUp",
    },
];


const beforeEventLayers = [
	{
		"index": "left_1",
		"layerID": "prev-builds-left",
		"layerIDhigh":"prev-builds-left-highlighted",
		"layerSource": "previous_buildings-02rrmr",
		"popupParamsList": ["label"],
		"popupStyle": "infoLayerCoralPopUp",
    },
	{
		"index": "left_2",
		"layerID": "curr-builds-left",
		"layerIDhigh":"curr-builds-left-highlighted",
		"layerSource": "current_buildings-0dk1i0",
		"popupParamsList": [],
		"popupStyle": "infoLayerGreenPopUp",
    },
	{
		"index": "left_3",
		"layerID": "parcels-parcels-left",
		"layerIDhigh":"parcels-parcels-left-highlighted",
		"layerSource": "parcels-136ib8",
		"popupParamsList": [],
		"popupStyle": "infoLayerPinkPopUp",
    },
	{
		"index": "left_4",
		"layerID": "parcels-subs-left",
		"layerIDhigh":"parcels-subs-left-highlighted",
		"layerSource": "subdivisions-67jdnv",
		"popupParamsList": ["label"],
		"popupStyle": "infoLayerSlateBluePopUp",
    },
	{
		"index": "left_5",
		"layerID": "plss-own-left",
		"layerIDhigh":"plss-own-left-highlighted",
		"layerSource": "plss_ownership_boundaries-7d8k3v",
		"popupParamsList": ["LABEL"],
		"popupStyle": "infoLayerAquaPopUp",
    },
	{
		"index": "left_6",
		"layerID": "land-patents-left",
		"layerIDhigh":"land-patents-left-highlighted",
		"layerSource": "land_patents_story_county-3r2b0g",
		"popupParamsList": [],
		"popupStyle": "infoLayerYellowPopUp",
    },
];



