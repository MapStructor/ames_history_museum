
function addAfterLineLayers(date) {
  // Loop through all layers in the afterLayers array (which are for the 'after' map)
  afterLineLayers.forEach(layer => {
    // Add the layer to the map
    addMapLayer(afterMap, layer, date);
  });
}

function addAfterAreaLayers(date) {
  // Loop through all layers in the afterLayers array (which are for the 'after' map)
  afterAreaLayers.forEach(layer => {
    // Add the layer to the map
    addMapLayer(afterMap, layer, date);
  });
}
