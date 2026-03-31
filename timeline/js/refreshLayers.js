function refreshLayers() {
    if (typeof layers !== 'undefined') {
        layers.forEach(layer => {
            const checkbox = document.getElementById(layer.toggleElement);
            const leftId = layer.id + "-left";
            const rightId = layer.id + "-right";
            if (checkbox && afterMap.getLayer(rightId)) {
                afterMap.setLayoutProperty(rightId, "visibility", checkbox.checked ? "visible" : "none");
            }
            if (checkbox && beforeMap.getLayer(leftId)) {
                beforeMap.setLayoutProperty(leftId, "visibility", checkbox.checked ? "visible" : "none");
            }
        });
    }
}
