

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

const newToken = "";
mapboxgl.accessToken = newToken;


// Initialize maps with the default style
initMaps("mapbox://styles/nittyjee/cjg705tp9c5xw2rlhsukbq0bs",[-93.61547, 42.0263],15.5);

var beforeMap;
var afterMap;
var map;

function initMaps(mapStyle,mapCenterCoords,mapZoom) {

	const beforeMapConfig = {
		container: "before",
		style: mapStyle,
		center: mapCenterCoords,
		hash: true,
		zoom: mapZoom,
		attributionControl: true,
	};

	const afterMapConfig  = {
		container: "after",
		style: mapStyle,
		center: mapCenterCoords,
		hash: true,
		zoom: mapZoom,
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
}




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

// Zoom to Layer Function
function zoomToLayer(groupName) {
  // Simple zoom logic based on Group Name
  switch (groupName) {
    case "Buildings":
     beforeMap.flyTo({center: [-93.61547, 42.0263], zoom: 15.5, bearing: 0});
     afterMap.flyTo({center: [-93.61547, 42.0263], zoom: 15.5, bearing: 0});
	break;
	case "Roads","Parcels":
     beforeMap.flyTo({center: [-93.62675, 42.0263], zoom: 13.5, bearing: 0});
     afterMap.flyTo({center: [-93.62675, 42.0263], zoom: 13.5, bearing: 0});
	break;
	case "Railroads":
	 beforeMap.flyTo({center: [-93.5097,42.0309], zoom: 9, bearing: 0});
	 afterMap.flyTo({center: [-93.5097,42.0309], zoom: 9, bearing: 0});
	break;
	case "City Limits":
	 beforeMap.flyTo({center: [-93.61547, 42.0263], zoom: 12, bearing: 0});
	 afterMap.flyTo({center: [-93.61547, 42.0263], zoom: 12, bearing: 0});
	break;
	case "PLSS Parcels":
     beforeMap.flyTo({center: [-93.62675, 42.0263], zoom: 12.5, bearing: 0});
     afterMap.flyTo({center: [-93.62675, 42.0263], zoom: 12.5, bearing: 0});
	break;
  }

}




//BASEMAP MENU SWITCHING FUNCTIONALITY

//RIGHT MENU
var rightInputs = document.getElementsByName("rtoggle");

function switchRightLayer(layer) {
  var rightLayerClass = layer.target.className; //*A layer.target.id;
  afterMap.setStyle("mapbox://styles/" + ( rightLayerClass == "cjg705tp9c5xw2rlhsukbq0bs" ? "nittyjee/" : "mapbox/" ) + rightLayerClass);
}

for (var i = 0; i < rightInputs.length; i++) {
  rightInputs[i].onclick = switchRightLayer;
}

//LEFT MENU
var leftInputs = document.getElementsByName("ltoggle");

function switchLeftLayer(layer) {
  var leftLayerClass = layer.target.className; 
  beforeMap.setStyle("mapbox://styles/" + ( leftLayerClass == "cjg705tp9c5xw2rlhsukbq0bs" ? "nittyjee/" : "mapbox/" ) + leftLayerClass);
}

for (var i = 0; i < leftInputs.length; i++) {
  leftInputs[i].onclick = switchLeftLayer;
}

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
