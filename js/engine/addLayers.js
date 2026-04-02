function addLayers(date) {
  layers.forEach(layer => {
    addMapLayer(beforeMap, { ...layer, id: layer.id + "-left"  }, date);
    addMapLayer(afterMap,  { ...layer, id: layer.id + "-right" }, date);
    if (layer.highlight) {
      const hl = { ...layer, paint: layer.highlight };
      addMapLayer(beforeMap, { ...hl, id: layer.id + "-highlighted-left"  }, date);
      addMapLayer(afterMap,  { ...hl, id: layer.id + "-highlighted-right" }, date);
    }
  });
}
