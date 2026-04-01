function addLayers(date) {
  layers.forEach(layer => {
    addMapLayer(beforeMap, { ...layer, id: layer.id + "-left"  }, date);
    addMapLayer(afterMap,  { ...layer, id: layer.id + "-right" }, date);
  });
}
