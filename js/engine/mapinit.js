



//ACCESS TOKEN

//Restricted Token (defined in js/lists/restrictedToken.js)
mapboxgl.accessToken = (typeof mapboxToken !== 'undefined') ? mapboxToken : restrictedToken;



var beforeMap;
var afterMap;
var map;


	const beforeMapConfig = {
		container: "before",
		style: mapConfig.style,
		center: mapConfig.center,
		hash: true,
		zoom: mapConfig.zoom,
		attributionControl: true,
		projection: 'mercator',
	};

	const afterMapConfig  = {
		container: "after",
		style: mapConfig.style,
		center: mapConfig.center,
		hash: true,
		zoom: mapConfig.zoom,
		attributionControl: true,
		projection: 'mercator',
	};
	
	//ADD MAP CONTAINER
	
	beforeMap = new mapboxgl.Map(beforeMapConfig);
    afterMap = new mapboxgl.Map(afterMapConfig);

    map = new mapboxgl.Compare(beforeMap, afterMap, "#comparison-container", {
      // Set this to enable comparing two maps by mouse movement:
      // mousemove: true
    });
	
	//ADD NAVIGATION CONTROLS (ZOOM IN AND OUT)


	var nav_left = new mapboxgl.NavigationControl();
	beforeMap.addControl(nav_left, "bottom-right");
	var nav_right = new mapboxgl.NavigationControl();
	afterMap.addControl(nav_right, "bottom-right");

	setupInfoPanels();
	

	function getDate() {
		var sliderVal = moment($("#date").text()).unix();
		return parseInt(moment.unix(sliderVal).format("YYYYMMDD"));
	}

	var initialLoadDone = false;

	beforeMap.on("style.load", function() {
		var date = getDate();
		addLayersToMap(beforeMap, "left", date);
		initPromotedLayers("left", beforeMap, date);
		refreshLayers();
		if (window._buildingsOpacity < 1 && typeof applyBuildingsOpacity === 'function')
			applyBuildingsOpacity(window._buildingsOpacity);
	});

	afterMap.on("style.load", function() {
		var date = getDate();
		addLayersToMap(afterMap, "right", date);
		initPromotedLayers("right", afterMap, date);
		refreshLayers();
		if (window._buildingsOpacity < 1 && typeof applyBuildingsOpacity === 'function')
			applyBuildingsOpacity(window._buildingsOpacity);
		if (!initialLoadDone) {
			initialLoadDone = true;
			addEvents();
			registerInfoPanelClicks();
		}
	});
	
	
	// Error Handling
    beforeMap.on("error", function (e) {
      if (e && e.error !== "Error") console.log(e);
    });

    afterMap.on("error", function (e) {
      if (e && e.error !== "Error") console.log(e);
    });




function zoomtobounds(boundsName) {
  const bounds = boundsList[boundsName];
  if (!bounds) return;
  beforeMap.fitBounds(bounds, { bearing: 0 });
  afterMap.fitBounds(bounds, { bearing: 0 });
}
/*

#13.63/42.03112/-93.63661


*/

// Zoom to Layer Function
function zoomToLayer(label) {
  const layer = findLayer(layers, label);
  if (!layer?.zoomCenter) return;
  const zoomLeft = layer.zoomLevelLeft ?? layer.zoomLevel;
  const zoomRight = layer.zoomLevelRight ?? layer.zoomLevel;
  beforeMap.flyTo({center: layer.zoomCenter, zoom: zoomLeft, bearing: 0});
  afterMap.flyTo({center: layer.zoomCenter, zoom: zoomRight, bearing: 0});
}




setupMapSwitching();

// on Map events
//var urlHash = window.location.hash;





// TIME LAYER FILTERING

function changeDate(unixDate) {
  var date       = parseInt(moment.unix(unixDate).format("YYYYMMDD"));
  var dateFilter = ["all", ["<=", ["coalesce", ["get", "DayStart"], 0], date], [">=", ["coalesce", ["get", "DayEnd"], 99999999], date]];

  flatLayers(layers).forEach(layer => {
    const leftId  = layer.id + "-left";
    const rightId = layer.id + "-right";
    // Use buildLayerFilter so promoted NIDs are excluded from the tileset
    var filter = buildLayerFilter(layer.id, date);
    if (beforeMap.getLayer(leftId))  beforeMap.setFilter(leftId,  filter);
    if (afterMap.getLayer(rightId))  afterMap.setFilter(rightId,  filter);

    // Also update the promoted GeoJSON layer's date filter
    var promLeft  = layer.id + "-promoted-left";
    var promRight = layer.id + "-promoted-right";
    if (beforeMap.getLayer(promLeft))  beforeMap.setFilter(promLeft,  dateFilter);
    if (afterMap.getLayer(promRight))  afterMap.setFilter(promRight,  dateFilter);
  });

} //end function changeDate

/////////////////////////////
//   ZOOM LABELS
/////////////////////////////






// Generic Layer Toggler
$(document).on('change', '.layer-list-row input[type="checkbox"]', function() {
    refreshLayers();
});