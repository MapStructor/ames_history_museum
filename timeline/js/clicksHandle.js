
/* previous buildings */

let prev_bulds_layer_view_flag = false;
let prev_bulds_layer_view_id = null;

var afterHighPrevBuildsPopUp = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 5,
  }),
  beforeHighPrevBuildsPopUp = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 5,
  });

  // CLICK AND OPEN POPUP
  beforeMap
    .on("click", "prev-builds-left", function (e) {
      prevBuildsClickHandle(e);
    });

  afterMap
    .on("click", "prev-builds-right", function (e) {
      prevBuildsClickHandle(e);
    });

const prevBuildsCheckbox = document.getElementById("prev-builds");
const itemsBuildsCheckbox = document.getElementById("builds_items");

prevBuildsCheckbox.addEventListener('change', function(event) {
  if(!prevBuildsCheckbox.checked) {
	  closePrevBuildsInfo();
  }
});

itemsBuildsCheckbox.addEventListener('change', function(event) {
  if(!itemsBuildsCheckbox.checked) {
	  closePrevBuildsInfo();
  }
});

function prevBuildsClickHandle(event) {

  if (prev_bulds_layer_view_id == event.features[0].id) {
    if(prev_bulds_layer_view_flag) {
       closePrevBuildsInfo();
	} else {
       openPrevBuildsInfo(event);
	}
  } else {
	openPrevBuildsInfo(event);
  }
}

function openPrevBuildsInfo(event) {
	prev_bulds_layer_view_flag = true;
	
	var highPopUpHTML = "<div class='infoLayerCoralPopUp'>" + event.features[0].properties.label + "</div>";
	
	afterMap.setFeatureState(
      {
        source: "prev-builds-right-highlighted",
        sourceLayer: "previous_buildings-02rrmr",
        id: prev_bulds_layer_view_id,
      },
      { hover: false }
    );
    afterMap.setFeatureState(
      {
        source: "prev-builds-right-highlighted",
        sourceLayer: "previous_buildings-02rrmr",
        id: event.features[0].id,
      },
      { hover: true }
    );
    beforeMap.setFeatureState(
      {
        source: "prev-builds-left-highlighted",
        sourceLayer: "previous_buildings-02rrmr",
        id: prev_bulds_layer_view_id,
      },
      { hover: false }
    );
    beforeMap.setFeatureState(
      {
        source: "prev-builds-left-highlighted",
        sourceLayer: "previous_buildings-02rrmr",
        id: event.features[0].id,
      },
      { hover: true }
    );
	
	prev_bulds_layer_view_id = event.features[0].id;
	
    afterHighPrevBuildsPopUp.setLngLat(event.lngLat).setHTML(highPopUpHTML);
    if (!afterHighPrevBuildsPopUp.isOpen())
      afterHighPrevBuildsPopUp.addTo(afterMap);
    beforeHighPrevBuildsPopUp.setLngLat(event.lngLat).setHTML(highPopUpHTML);
    if (!beforeHighPrevBuildsPopUp.isOpen())
      beforeHighPrevBuildsPopUp.addTo(beforeMap);
}

function closePrevBuildsInfo() {
  prev_bulds_layer_view_flag = false;
  
  afterMap.setFeatureState(
    {
      source: "prev-builds-right-highlighted",
      sourceLayer: "previous_buildings-02rrmr",
      id: prev_bulds_layer_view_id,
    },
    { hover: false }
  );
  beforeMap.setFeatureState(
    {
      source: "prev-builds-left-highlighted",
      sourceLayer: "previous_buildings-02rrmr",
      id: prev_bulds_layer_view_id,
    },
    { hover: false }
  );
  
  prev_bulds_layer_view_id = null;
  
  if (afterHighPrevBuildsPopUp.isOpen()) afterHighPrevBuildsPopUp.remove();
  if (beforeHighPrevBuildsPopUp.isOpen()) beforeHighPrevBuildsPopUp.remove();
}

/* previous buildings */


//------------------------------------------------------------------


/* Parcels Subdivisions */

let parcels_layer_view_flag = false;
let parcels_layer_view_id = null;

var afterHighParcelsPopUp = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 5,
  }),
  beforeHighParcelsPopUp = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 5,
  });

  // CLICK AND OPEN POPUP
  beforeMap
    .on("click", "parcels-subs-left", function (e) {
      ParcelsClickHandle(e);
    });

  afterMap
    .on("click", "parcels-subs-right", function (e) {
      ParcelsClickHandle(e);
    });

const parcelsCheckbox = document.getElementById("parcels-subs");
const itemsParcelsCheckbox = document.getElementById("parcels_items");

parcelsCheckbox.addEventListener('change', function(event) {
  if(!parcelsCheckbox.checked) {
	  closeParcelsInfo();
  }
});

itemsParcelsCheckbox.addEventListener('change', function(event) {
  if(!itemsParcelsCheckbox.checked) {
	  closeParcelsInfo();
  }
});

function ParcelsClickHandle(event) {

  if (parcels_layer_view_id == event.features[0].id) {
    if(parcels_layer_view_flag) {
       closeParcelsInfo();
	} else {
       openParcelsInfo(event);
	}
  } else {
	openParcelsInfo(event);
  }
}

function openParcelsInfo(event) {
	parcels_layer_view_flag = true;
	
	var highPopUpHTML = "<div class='infoLayerSlateBluePopUp'>" + event.features[0].properties.label + "</div>";;
	
	afterMap.setFeatureState(
      {
        source: "parcels-subs-right-highlighted",
        sourceLayer: "subdivisions-67jdnv",
        id: parcels_layer_view_id,
      },
      { hover: false }
    );
    afterMap.setFeatureState(
      {
        source: "parcels-subs-right-highlighted",
        sourceLayer: "subdivisions-67jdnv",
        id: event.features[0].id,
      },
      { hover: true }
    );
    beforeMap.setFeatureState(
      {
        source: "parcels-subs-left-highlighted",
        sourceLayer: "subdivisions-67jdnv",
        id: parcels_layer_view_id,
      },
      { hover: false }
    );
    beforeMap.setFeatureState(
      {
        source: "parcels-subs-left-highlighted",
        sourceLayer: "subdivisions-67jdnv",
        id: event.features[0].id,
      },
      { hover: true }
    );
	
	parcels_layer_view_id = event.features[0].id;
	
    afterHighParcelsPopUp.setLngLat(event.lngLat).setHTML(highPopUpHTML);
    if (!afterHighParcelsPopUp.isOpen())
      afterHighParcelsPopUp.addTo(afterMap);
    beforeHighParcelsPopUp.setLngLat(event.lngLat).setHTML(highPopUpHTML);
    if (!beforeHighParcelsPopUp.isOpen())
      beforeHighParcelsPopUp.addTo(beforeMap);
}

function closeParcelsInfo() {
  parcels_layer_view_flag = false;
  
  afterMap.setFeatureState(
    {
      source: "parcels-subs-right-highlighted",
      sourceLayer: "subdivisions-67jdnv",
      id: parcels_layer_view_id,
    },
    { hover: false }
  );
  beforeMap.setFeatureState(
    {
      source: "parcels-subs-left-highlighted",
      sourceLayer: "subdivisions-67jdnv",
      id: parcels_layer_view_id,
    },
    { hover: false }
  );
  
  parcels_layer_view_id = null;
  
  if (afterHighParcelsPopUp.isOpen()) afterHighParcelsPopUp.remove();
  if (beforeHighParcelsPopUp.isOpen()) beforeHighParcelsPopUp.remove();
}

/* Parcels Subdivisions */


//------------------------------------------------------------------


/* PLSS Ownership  */

let plss_own_layer_view_flag = false;
let plss_own_layer_view_id = null;

var afterHighPLSSownPopUp = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 5,
  }),
  beforeHighPLSSownPopUp = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 5,
  });

  // CLICK AND OPEN POPUP
  beforeMap
    .on("click", "plss-own-left", function (e) {
      PLSSownClickHandle(e);
    });

  afterMap
    .on("click", "plss-own-right", function (e) {
      PLSSownClickHandle(e);
    });

const PLSSownCheckbox = document.getElementById("plss-own");
const itemsPLSSownCheckbox = document.getElementById("plss_parcels_items");

PLSSownCheckbox.addEventListener('change', function(event) {
  if(!PLSSownCheckbox.checked) {
	  closePLSSownInfo();
  }
});

itemsPLSSownCheckbox.addEventListener('change', function(event) {
  if(!itemsPLSSownCheckbox.checked) {
	  closePLSSownInfo();
  }
});

function PLSSownClickHandle(event) {

  if (plss_own_layer_view_id == event.features[0].id) {
    if(plss_own_layer_view_flag) {
       closePLSSownInfo();
	} else {
       openPLSSownInfo(event);
	}
  } else {
	openPLSSownInfo(event);
  }
}

function openPLSSownInfo(event) {
	plss_own_layer_view_flag = true;
	
	var highPopUpHTML = "<div class='infoLayerAquaPopUp'>" + event.features[0].properties.LABEL + "</div>";
	
	afterMap.setFeatureState(
      {
        source: "plss-own-right-highlighted",
        sourceLayer: "plss_ownership_boundaries-7d8k3v",
        id: plss_own_layer_view_id,
      },
      { hover: false }
    );
    afterMap.setFeatureState(
      {
        source: "plss-own-right-highlighted",
        sourceLayer: "plss_ownership_boundaries-7d8k3v",
        id: event.features[0].id,
      },
      { hover: true }
    );
    beforeMap.setFeatureState(
      {
        source: "plss-own-left-highlighted",
        sourceLayer: "plss_ownership_boundaries-7d8k3v",
        id: plss_own_layer_view_id,
      },
      { hover: false }
    );
    beforeMap.setFeatureState(
      {
        source: "plss-own-left-highlighted",
        sourceLayer: "plss_ownership_boundaries-7d8k3v",
        id: event.features[0].id,
      },
      { hover: true }
    );
	
	plss_own_layer_view_id = event.features[0].id;
	
    afterHighPLSSownPopUp.setLngLat(event.lngLat).setHTML(highPopUpHTML);
    if (!afterHighPLSSownPopUp.isOpen())
      afterHighPLSSownPopUp.addTo(afterMap);
    beforeHighPLSSownPopUp.setLngLat(event.lngLat).setHTML(highPopUpHTML);
    if (!beforeHighPLSSownPopUp.isOpen())
      beforeHighPLSSownPopUp.addTo(beforeMap);
}

function closePLSSownInfo() {
  plss_own_layer_view_flag = false;
  
  afterMap.setFeatureState(
    {
      source: "plss-own-right-highlighted",
      sourceLayer: "plss_ownership_boundaries-7d8k3v",
      id: plss_own_layer_view_id,
    },
    { hover: false }
  );
  beforeMap.setFeatureState(
    {
      source: "plss-own-left-highlighted",
      sourceLayer: "plss_ownership_boundaries-7d8k3v",
      id: plss_own_layer_view_id,
    },
    { hover: false }
  );
  
  plss_own_layer_view_id = null;
  
  if (afterHighPLSSownPopUp.isOpen()) afterHighPLSSownPopUp.remove();
  if (beforeHighPLSSownPopUp.isOpen()) beforeHighPLSSownPopUp.remove();
}

/* PLSS Ownership  */


//------------------------------------------------------------------
