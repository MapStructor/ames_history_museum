

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
initMaps("mapbox://styles/nittyjee/cjg705tp9c5xw2rlhsukbq0bs",[-93.63661, 42.03112],13.63);

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
/*

#13.63/42.03112/-93.63661


*/

// Zoom to Layer Function
function zoomToLayer(groupName) {
  // Simple zoom logic based on Group Name
  switch (groupName) {
	case "Roads":
     beforeMap.flyTo({center: [-93.64369, 42.02561], zoom: 12.3, bearing: 0});
     afterMap.flyTo({center: [-93.64369, 42.02561], zoom: 12.3, bearing: 0});
	break;
	case "Railroads":
	 beforeMap.flyTo({center: [-93.64029,42.04075], zoom: 12.6, bearing: 0});
	 afterMap.flyTo({center: [-93.64029,42.04075], zoom: 12.6, bearing: 0});
	break;
    case "Buildings":
     beforeMap.flyTo({center: [-93.64369, 42.02561], zoom: 12.3, bearing: 0});
     afterMap.flyTo({center: [-93.64369, 42.02561], zoom: 12.3, bearing: 0});
	break;
	case "City Limits":
	 beforeMap.flyTo({center: [-93.63891, 42.02708], zoom: 11.85, bearing: 0});
	 afterMap.flyTo({center: [-93.63891, 42.02708], zoom: 11.85, bearing: 0});
	break;
	case "Pre-Subdivisions":
	 beforeMap.flyTo({center: [-93.61106, 42.02711], zoom: 14.27, bearing: 0});
	 afterMap.flyTo({center: [-93.61106, 42.02711], zoom: 14.27, bearing: 0});
	break;
	case "Parcels":
     beforeMap.flyTo({center: [-93.64369, 42.02561], zoom: 12.3, bearing: 0});
     afterMap.flyTo({center: [-93.64369, 42.02561], zoom: 12.3, bearing: 0});
	break;
	case "Subdivisions":
	 beforeMap.flyTo({center: [-93.64369, 42.02561], zoom: 12.3, bearing: 0});
	 afterMap.flyTo({center: [-93.64369, 42.02561], zoom: 12.3, bearing: 0});
	break;
	case "Story County Land Patents":
     beforeMap.flyTo({center: [-93.5116, 42.0363], zoom: 10, bearing: 0});
     afterMap.flyTo({center: [-93.5116, 42.0363], zoom: 12.5, bearing: 0});
	break;
  }

}




//BASEMAP MENU SWITCHING FUNCTIONALITY

//RIGHT MENU
var rightInputs = document.getElementsByName("rtoggle");

function switchRightLayer(layer) {
  var rightLayerClass = ( typeof layer.className === "undefined" ) ? layer.target.className : layer.className ; //*A layer.target.id;
  console.log(rightLayerClass);
  afterMap.setStyle("mapbox://styles/" + ( rightLayerClass == "outdoors-v9" ? "mapbox/" : "nittyjee/" ) + rightLayerClass);
}

for (var i = 0; i < rightInputs.length; i++) {
  if(rightInputs[i].checked) switchRightLayer(rightInputs[i]);
  rightInputs[i].onclick = switchRightLayer;
}

//LEFT MENU
var leftInputs = document.getElementsByName("ltoggle");

function switchLeftLayer(layer) {
  var leftLayerClass = ( typeof layer.className === "undefined" ) ?  layer.target.className : layer.className; 
  beforeMap.setStyle("mapbox://styles/" + ( leftLayerClass == "outdoors-v9" ? "mapbox/" : "nittyjee/" ) + leftLayerClass);
}

for (var i = 0; i < leftInputs.length; i++) {
  if(leftInputs[i].checked) switchLeftLayer(leftInputs[i]);
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