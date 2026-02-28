
function addBeforeLineLayers(date) {
  // Loop through all layers in the beforeLayers array
  beforeLineLayers.forEach(layer => {
    // Add the layer to the map
    addMapLayer(beforeMap, layer, date);
  });
  
}

function addBeforeAreaLayers(date) {
  // Loop through all layers in the beforeLayers array
  beforeAreaLayers.forEach(layer => {
    // Add the layer to the map
    addMapLayer(beforeMap, layer, date);
  });
  
}
