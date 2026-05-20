function addMapLayer(map, layerConfig, date) {
  if (date) {
    map.addLayer({
      ...layerConfig,
      filter: ["all", ["<=", ["coalesce", ["get", "DayStart"], 0], date], [">=", ["coalesce", ["get", "DayEnd"], 99999999], date]],
    });
  } else {
    map.addLayer({
      ...layerConfig,
    });
  }
}
