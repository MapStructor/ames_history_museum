

// world bounds
const WorldBounds = [
  [-179, -59], // [west, south]
  [135, 77], // [east, north]
];

//-96.639704,40.378264,-90.140613,43.500945
const IowaBounds = [
  [-96.639704,40.378264], // [west, south]
  [-90.140613,43.500945] // [east, north]
];

const USAbounds = [
  [-125.41992187500001,23.725011735951796], // [west, south]
  [-66.53320312500001,49.95121990866204]    // [east, north]
];


//ACCESS TOKEN

const newToken = "pk.eyJ1Ijoibml0dHlqZWUiLCJhIjoiY21tcGlyeWt0MHExYzJ5b2VqcGJhdDRieSJ9.Ai9ymb2G5htA_2sUSB2GPg";
mapboxgl.accessToken = newToken;


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
	};

	const afterMapConfig  = {
		container: "after",
		style: mapConfig.style,
		center: mapConfig.center,
		hash: true,
		zoom: mapConfig.zoom,
		attributionControl: true,
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
	

	//BASEMAP SWITCHING
	beforeMap.on("style.load", function () {
		var sliderVal = moment($("#date").text()).unix();
		var yr = parseInt(moment.unix(sliderVal).format("YYYY"));
		var date = parseInt(moment.unix(sliderVal).format("YYYYMMDD"));
		addBeforeLineLayers(date);
		setTimeout(() => {
			addBeforeAreaLayers(date);
			addLeftEvents();
			// Ensure visibility is sync with checkboxes
			setTimeout(refreshLayers(), 222); 
		}, 111);
	});

	
	//BASEMAP SWITCHING
	afterMap.on("style.load", function () {
		var sliderVal = moment($("#date").text()).unix();
		var yr = parseInt(moment.unix(sliderVal).format("YYYY"));
		var date = parseInt(moment.unix(sliderVal).format("YYYYMMDD"));
		addAfterLineLayers(date);
		setTimeout(() => {
			addAfterAreaLayers(date);
			addRightEvents();
			// Ensure visibility is sync with checkboxes
			setTimeout(refreshLayers(), 333);
		}, 222);
	});
	
	
	// Error Handling
    beforeMap.on("error", function (e) {
      if (e && e.error !== "Error") console.log(e);
    });

    afterMap.on("error", function (e) {
      if (e && e.error !== "Error") console.log(e);
    });




function zoomtobounds(boundsName) {
  switch (boundsName) {
    case "Iowa":
      beforeMap.fitBounds(IowaBounds, { bearing: 0 });
      afterMap.fitBounds(IowaBounds, { bearing: 0 });
      break;
    case "USA":
      beforeMap.fitBounds(USAbounds, { bearing: 0 });
      afterMap.fitBounds(USAbounds, { bearing: 0 });
      break;
    case "World":
      beforeMap.fitBounds(WorldBounds, { bearing: 0 });
      afterMap.fitBounds(WorldBounds, { bearing: 0 });
      break;
  }
}
/*

#13.63/42.03112/-93.63661


*/

// Zoom to Layer Function
function zoomToLayer(label) {
  const allLayers = [...roadsSection, ...buildingsSection, ...parcelsSection, ...parcelsPLSSsection, ...singleLayers];
  const layer = allLayers.find(l => l.label === label);
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
  var date = parseInt(moment.unix(unixDate).format("YYYYMMDD"));
  var dateFilter = ["all", ["<=", "DayStart", date], [">=", "DayEnd", date]];
  

  //LAYERS FOR FILTERING
  afterLineLayers.forEach(layer => {
	if (afterMap.getLayer(layer.id)) {
		afterMap.setFilter(layer.id, dateFilter);
	}
  });
  beforeLineLayers.forEach(layer => {
	if (beforeMap.getLayer(layer.id)) {
		beforeMap.setFilter(layer.id, dateFilter);
	}
  });
  afterAreaLayers.forEach(layer => {
	if (afterMap.getLayer(layer.id)) {
		afterMap.setFilter(layer.id, dateFilter);
	}
  });
  beforeAreaLayers.forEach(layer => {
	if (beforeMap.getLayer(layer.id)) {
		beforeMap.setFilter(layer.id, dateFilter);
	}
  });
  
 } //end function changeDate

/////////////////////////////
//   ZOOM LABELS
/////////////////////////////






// Generic Layer Toggler
$(document).on('change', '.layer-list-row input[type="checkbox"]', function() {
    refreshLayers();
});