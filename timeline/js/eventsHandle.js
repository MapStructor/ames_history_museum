function addRightEvents() {
  // Loop through all layers in the afterLayers array (which are for the 'after' map)
  afterEventLayers.forEach(layer => {
    // Add the layer to the map
    addHoverEvent(afterMap, layer);
  });
}

function addLeftEvents() {
  // Loop through all layers in the afterLayers array (which are for the 'after' map)
  beforeEventLayers.forEach(layer => {
    // Add the layer to the map
    addHoverEvent(beforeMap, layer);
  });
}

function addHoverEvent(map, layerConfig) {
	//console.warn("- add an event -");
	console.log(layerConfig.index);
	console.log(layerConfig.layerID);
	console.log(layerConfig.layerSource);
	
	hoveredID[layerConfig.index] = null;
	
	hoverPopUp[layerConfig.index] = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
	});
	
	map.on("mouseenter", layerConfig.layerID, function (e) {
      map.getCanvas().style.cursor = "pointer";
      hoverPopUp[layerConfig.index].setLngLat(e.lngLat).addTo(map);
    });

    map.on("mousemove", layerConfig.layerID, function (e) {
	  map.getCanvas().style.cursor = "pointer";
      if (e.features.length > 0) {
        if (hoveredID[layerConfig.index]) {
          map.setFeatureState(
            {
              source: layerConfig.layerID,
              sourceLayer: layerConfig.layerSource,
              id: hoveredID[layerConfig.index],
            },
            { hover: false }
          );
        }
        hoveredID[layerConfig.index] = e.features[0].id;
        map.setFeatureState(
          {
            source: layerConfig.layerID,
            sourceLayer: layerConfig.layerSource,
            id: hoveredID[layerConfig.index],
          },
          { hover: true }
        );
		
		//console.log(e.features[0].id);
		
        var PopUpHTML = "<div class='" + layerConfig.popupStyle + "'>";
		var popup_view_list = [];
		
			for (let i = 0, l = layerConfig["popupParamsList"].length; i < l; ++i) {
				if(typeof e.features[0].properties[layerConfig.popupParamsList[i]] !== 'undefined') {
					popup_view_list.push(e.features[0].properties[layerConfig.popupParamsList[i]]);
				}	
			}

        //BEFORE MAP POP UP CONTENTS
		if(popup_view_list.length > 0) {
			PopUpHTML += popup_view_list.join("<br/>") + "</div>"
			hoverPopUp[layerConfig.index].setLngLat(e.lngLat).setHTML(PopUpHTML);
		}
		
      }
    });

    map.on("mouseleave", layerConfig.layerID, function () {
      map.getCanvas().style.cursor = "";
      if (hoveredID[layerConfig.index]) {
        map.setFeatureState(
          {
            source: layerConfig.layerID,
            sourceLayer: layerConfig.layerSource,
            id: hoveredID[layerConfig.index],
          },
          { hover: false }
        );
      }
      hoveredID[layerConfig.index] = null;
      if (hoverPopUp[layerConfig.index].isOpen()) hoverPopUp[layerConfig.index].remove();
    });
	
}

