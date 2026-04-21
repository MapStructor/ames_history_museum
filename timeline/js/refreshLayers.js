function refreshLayers() {
    if (typeof afterLineLayers !== 'undefined') {
        afterLineLayers.forEach(layer => {
            const id = layer.id;
            const checkbox = document.getElementById(layer.toggleElement);
            if (checkbox && afterMap.getLayer(id)) {
                afterMap.setLayoutProperty(
                    id,
                    "visibility",
                    checkbox.checked ? "visible" : "none"
                );
            }
        });
    }

    if (typeof beforeLineLayers !== 'undefined') {
        beforeLineLayers.forEach(layer => {
            const id = layer.id;
            const checkbox = document.getElementById(layer.toggleElement);
            if (checkbox && beforeMap.getLayer(id)) {
                beforeMap.setLayoutProperty(
                    id,
                    "visibility",
                    checkbox.checked ? "visible" : "none"
                );
            }
        });
    }
	
	if (typeof afterAreaLayers !== 'undefined') {
        afterAreaLayers.forEach(layer => {
            const id = layer.id;
            const checkbox = document.getElementById(layer.toggleElement);
            if (checkbox && afterMap.getLayer(id)) {
                afterMap.setLayoutProperty(
                    id,
                    "visibility",
                    checkbox.checked ? "visible" : "none"
                );
            }
        });
    }

    if (typeof beforeAreaLayers !== 'undefined') {
        beforeAreaLayers.forEach(layer => {
            const id = layer.id;
            const checkbox = document.getElementById(layer.toggleElement);
            if (checkbox && beforeMap.getLayer(id)) {
                beforeMap.setLayoutProperty(
                    id,
                    "visibility",
                    checkbox.checked ? "visible" : "none"
                );
            }
        });
    }
	
}
