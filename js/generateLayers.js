/**
 * @param {{
 *  id: string;
 * name?: string;
 * caretId?: string;
 * label: string;
 * iconColor?: string;
 * itemSelector?: string;
 * zoomTo?: string;
 * infoId: string;
 * type?: "group" | "lots-events" | "grants-lots" | "castello-points" | "current-buildings";
 * iconType?: "square"
 * }[]} layers
 * @returns {string}
 */
function renderGroupedLayers(layers) {
  let r = "";
  if (!layers) return r;
  
  // We need to know the group name for each item to pass to zoomToLayer.
  // In the current structure, 'layers' IS the group array.
  // The first item in 'layers' is usually the group header which has the label.
  let groupName = "Unknown";
  let isGroupCollapsed = false;
  if (layers.length > 0 && layers[0].type === "group") {
      groupName = layers[0].label;
      if (layers[0].collapsed) {
        isGroupCollapsed = true;
      }
  }

  layers.forEach((layer) => {
    if (layer.type === "group") {
      r += renderLayerRow(layer, groupName);
    } else {
      r += renderGroupLayerItem(layer, groupName, isGroupCollapsed);
    }
  });
  return r;
}

/**
 * 
 * @param {{
*  id: string;
* name?: string;
* caretId?: string;
* label: string;
* iconColor?: string;
* itemSelector?: string;
* zoomTo?: string;
* infoId: string;
* type?: "group" | "lots-events" | "grants-lots" | "castello-points" | "current-buildings";
* iconType?: "square";
* isSolid?: boolean;
* collapsed?: boolean;
* }} layerData 
 * @param {string} groupName
 * @returns {string}
 */
function renderLayerRow(layerData, groupName) {
  const iconClass = layerData.collapsed ? "fa-plus-square" : "fa-minus-square";
  const html = `
      <div class="layer-list-row">
        <input
          type="checkbox"
          class="group_items"
          id="${layerData.id || "group_items"}"
          name="${layerData.name || "group_items"}"
          ${layerData.checked ? 'checked="checked"' : ""}
        />
        <i
          class="fas ${iconClass} compress-expand-icon"
          id="${layerData.caretId || "group-layer-caret"}"
          onclick="itemsCompressExpand('${layerData.itemSelector || ""}','#${
    layerData.caretId || ""
  }')"
        ></i>
        <label for="${layerData.id || "group_items"}">
          ${layerData.label || ""}
          <div class="dummy-label-layer-space"></div>
        </label>
        <div class="layer-buttons-block">
          <div class="layer-buttons-list">
            <i
              class="fa fa-crosshairs zoom-to-layer"
              onclick="zoomToLayer('${groupName}')"
              title="Zoom to Layer"
            ></i>
            <i
              class="fa fa-info-circle layer-info trigger-popup"
              id="${layerData.infoId || "group-info"}"
              title="Layer Info"
            ></i>
          </div>
        </div>
      </div>
    `;
  return html;
}

/**
 * 
 * @param {{
 *  id: string;
* name?: string;
* caretId?: string;
* label: string;
* iconColor?: string;
* itemSelector?: string;
* zoomTo?: string;
* infoId: string;
* type?: "group" | "lots-events" | "grants-lots" | "castello-points" | "current-buildings";
* iconType?: "square";
* isSolid?: boolean;
* checked?: boolean;
* }} layerData 
 * @param {string} groupName
 * @param {boolean} [isGroupCollapsed=false]
 * @returns {string}
 */
function renderGroupLayerItem(layerData, groupName, isGroupCollapsed = false) {
  // Removed the zoom button div block entirely
  const style = isGroupCollapsed ? 'style="display: none;"' : '';
  const html = `
      <div class="layer-list-row ${layerData.topLayerClass}_item" ${style}>
        &nbsp; &nbsp; &nbsp;
        <input
          type="checkbox"
          class="${layerData.className}"
          id="${layerData.id}"
          name="${layerData.name}"
          ${layerData.checked ? 'checked="checked"' : ""}
        />
        <label for="${layerData.id}">
          <i class="${layerData.isSolid? "fas" : "far"} fa-${layerData.iconType || "slash"} ${["square", "circle", "comment-dots"].includes(layerData.iconType)? "" : "slash-icon"}" style="color: ${
            layerData.iconColor || "#ff0000"
          }"></i>
          ${layerData.label || "Lenape Trails"}
        </label>
      </div>
    `;

  return html;
}

/**
 * Sets up the group toggle logic for a given layer section.
 * @param {Array} sectionData - The array of layer data objects.
 */
function setupLayerGroupListeners(sectionData) {
    if (!sectionData || sectionData.length < 2) return;

    const groupInfo = sectionData[0];
    const groupCheckboxId = groupInfo.id;
    const groupCheckbox = $(`#${groupCheckboxId}`);

    if (groupCheckbox.length === 0) return;

    // Identify child checkboxes. 
    const childItems = sectionData.slice(1);
    const childIds = childItems.map(item => `#${item.id}`).join(", ");
    const $childCheckboxes = $(childIds);

    // 1. Group Checkbox Change Listener
    groupCheckbox.on('change', function () {
        const isChecked = $(this).is(':checked');
        $childCheckboxes.prop('checked', isChecked);
        
        // Trigger map update
        if (typeof refreshLayers === 'function') {
            refreshLayers();
        }
    });

    // 2. Child Checkbox Change Listener (to update Group Checkbox UI)
    $childCheckboxes.on('change', function () {
        const total = $childCheckboxes.length;
        const checked = $childCheckboxes.filter(':checked').length;
        
        // If all checked, check group. If not all checked, uncheck group.
        groupCheckbox.prop('checked', total === checked);
    });
}

/**
 * @param {{
*  id: string;
* name?: string;
* label: string;
* iconColor?: string;
* iconType?: "square";
* isSolid?: boolean;
* checked?: boolean;
* topLayerClass?: string;
* className?: string;
* }} layerData 
 * @returns {string}
 */
function renderSingleLayer(layerData) {
  const html = `
      <div class="layer-list-row ${layerData.topLayerClass}_item">
        <input
          type="checkbox"
          class="${layerData.className}"
          id="${layerData.id}"
          name="${layerData.name}"
          ${layerData.checked ? 'checked="checked"' : ""}
        />
        <label for="${layerData.id}">
          <i class="${layerData.isSolid ? "fas" : "far"} fa-${layerData.iconType || "slash"} ${["square", "circle", "comment-dots"].includes(layerData.iconType) ? "" : "slash-icon"}" style="color: ${layerData.iconColor || "#ff0000"}"></i>
          ${layerData.label}
        </label>
		<div class="layer-buttons-block">
          <div class="layer-buttons-list">
            <i
              class="fa fa-crosshairs zoom-to-layer"
              onclick="zoomToLayer('${layerData.label}')"
              title="Zoom to Layer"
            ></i>
            <i
              class="fa fa-info-circle layer-info trigger-popup"
              id="${layerData.infoId}"
              title="Layer Info"
            ></i>
          </div>
        </div>
      </div>
    `;
  return html;
}


try {
	  
  if (typeof roadsSection !== 'undefined') {
    $("#roads-section-layers").html(renderGroupedLayers(roadsSection));
    setupLayerGroupListeners(roadsSection);
  }
  
  if (typeof buildingsSection !== 'undefined') {
    $("#buildings-section-layers").html(renderGroupedLayers(buildingsSection));
    setupLayerGroupListeners(buildingsSection);
  }
  
  if (typeof parcelsSection !== 'undefined') {
    $("#parcels-section-layers").html(renderGroupedLayers(parcelsSection));
    setupLayerGroupListeners(parcelsSection);
  }
  
  if (typeof parcelsPLSSsection !== 'undefined') {
    $("#plss-parcels-section-layers").html(renderGroupedLayers(parcelsPLSSsection));
    setupLayerGroupListeners(parcelsPLSSsection);
  }
  
  if (typeof singleLayers !== 'undefined') {
    singleLayers.forEach(layer => {
      $(`#${layer.containerId}`).html(renderSingleLayer(layer));
    });
  }
  
} catch(error){
  console.log(error)
}
