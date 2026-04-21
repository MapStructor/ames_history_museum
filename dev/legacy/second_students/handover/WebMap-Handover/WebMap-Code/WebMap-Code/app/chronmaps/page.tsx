"use client";

import moment from "moment";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { CSSTransition } from "react-transition-group";
import mapboxgl, { FilterSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "mapbox-gl-compare/dist/mapbox-gl-compare.css";
import { usePathname, useRouter } from "next/navigation";
import { ButtonLink } from "@/app/models/button-link.model";
import "@fontsource/source-sans-pro";
import "@fontsource/source-sans-pro/400.css"; // Specify weight
import { getCookie } from "cookies-next";
import { GenericPopUpProps } from "@/app/models/popups/pop-up.model";
import { IconColors } from "@/app/models/colors.model";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { MapFiltersGroup } from "@/app/models/maps/map-filters.model";
import { SectionLayer, SectionLayerGroup, SectionLayerItem } from "@/app/models/layers/layer.model";
import { MapItem, MapZoomProps } from "@/app/models/maps/map.model";
import { PopupType } from "@/app/models/popups/pop-up-type.model";
import { ZoomLabel } from "@/app/models/zoom-layer.model";
import { addInteractivityToLabel, zoomToWorld } from "@/app/helpers/zoom-layer.helper";
import { getFontawesomeIcon, parseFromString } from "@/app/helpers/font-awesome.helper";
import "@/app/popup.css";

import SliderWithDatePanel from "./components/slider/slider-with-date-panel.component";
import SliderPopUp from "./components/right-info-bar/popups/pop-up";
import ExpandableLayerGroupSection from "./components/layers/layer-group-section.component";
import MapFilterWrapperComponent from "./components/map-filters/map-filter-wrapper.component";
import NewLayerSectionForm from "./components/forms/NewLayerSectionForm";
import MapboxCompareWrapper from "./components/map/mapbox-compare.component";





// CODE IN THIS FILE STILL USES PASSWORD PROTECTING THE MAIN PAGE, WHEN THAT IS NO LONGER NEEDED...
// COPY AN EXISITING page.tsx FROM ANOTHER SUBFOLDER AND JUST MAKE THE MINOR MODIFICATIONS TO THE FOLLOWING:
// 1. prisma import (below)
// 2. MapBox API access token (if necessary, also below)
// 3. MapBox style links
// 4. API paths





/*
 -------------------------------- NEED TO UPDATE THIS SPECIFIC IMPORT --------------------------------
*/

import {
  Map as PrismaMap,
  ZoomLabel as PrismaZoomLabel,
  LayerSection as PrismaLayerSection,
  LayerData as PrismaLayer,
  LayerGroup as PrismaLayerGroup,
  MapGroup as PrismaMapGroup,
  hoverItem
} from "@/prisma/generated_schema/chronmaps";
                                                                  
// ---------------------------------------------------------------------------------------------------





// IMPORTANT: MAPBOX ACCESS TOKEN
mapboxgl.accessToken = "pk.eyJ1IjoibWFwbnkiLCJhIjoiY200OW03ZGh2MGJyMzJrcTEydW4wMGh2eSJ9.eJnHIk7wriv-Hp02T7mT3g";





// HTML rendering for the page
export default function Home() {
  // ----------------------------- PROTECT PAGE ------------------------------
  const [pageVisible, setPageVisible] = useState(false);
  const [pageCode, setPageCode] = useState<string>("");

  // --------------------------------- MAPS ----------------------------------
  const currBeforeMap = useRef<mapboxgl.Map | null>(null);
  const currAfterMap = useRef<mapboxgl.Map | null>(null);
  // URL hash parameters
  const [hashParams, setHashParams] = useState<string[]>(["0", "0", "0", "0", "0"]);

  // ------------------------------ MOVE LAYERS ------------------------------
  const [showLayerOrdering, setShowLayerOrdering] = useState<boolean>(false);
  const [layerOrder, setLayerOrder] = useState<PrismaLayer[]>([]);

  // -------------------------------------------------------------------------
  const [currDate, setCurrDate] = useState<moment.Moment | null>(moment("1950-01-01", "YYYY-MM-DD") );
  const [popUp, setPopUp] = useState<GenericPopUpProps>({
    layerName: "",
    nid: "",
    type: "yellow",
  });
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [layerPopupBefore, setLayerPopupBefore] = useState(false);
  const [layerPanelVisible, setLayerPanelVisible] = useState(true);
  const [MapboxCompare, setMapboxCompare] = useState<any>(null);
  const beforeMapContainerRef = useRef<HTMLDivElement>(null);
  const afterMapContainerRef = useRef<HTMLDivElement>(null);
  const comparisonContainerRef = useRef<HTMLDivElement>(null);
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mappedFilterItemGroups, setMappedFilterItemGroups] = useState<MapFiltersGroup[]>([]);
  const [currMaps, setCurrMaps] = useState<PrismaMap[]>([]);
  const [currLayers, setCurrLayers] = useState<PrismaLayer[]>([]);
  const [defaultBeforeMap, setDefaultBeforeMap] = useState<mapboxgl.Map>();
  const [defaultAfterMap, setDefaultAfterMap] = useState<mapboxgl.Map>();
  const [currSectionLayers, setSectionLayers] = useState<SectionLayer[]>();
  const [standAloneLayers, setStandaloneLayers] = useState<PrismaLayer[]>(); //addition of standalone layer type for useEffect and display the standalone layers
  const [hasDoneInitialZoom, setHasDoneInitialZoom] = useState<boolean>(false);
  // State variable to determine if groupForm is open or not
  const [groupFormOpen, setGroupFormOpen] = useState<boolean>(false);
  const [currZoomLayers, setCurrZoomLayers] = useState<ZoomLabel[]>([]);
  const [beforeMapItem, setBeforeMapItem] = useState<MapItem>();
  // Variable to be used on map refresh to show currently active layers
  const [reRenderActiveLayers, setReRenderActiveLayers] = useState<boolean>(false);
  const [buttonLinks, setButtonLinks] = useState<ButtonLink[]>([]);
  const [currAuthToken, setCurrAuthToken] = useState<string>("");
  const [inPreviewMode, setInPreviewMode] = useState<boolean>(false);
  const activePopupsBefore = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const activePopupsAfter = useRef<Map<string, mapboxgl.Popup>>(new Map());

  // Route to the desired URL
  const router = useRouter();
  
  // Path to the site (before the hash parameters)
  const pathname = usePathname();





  // -------------------------------------- SHOW PAGE OR NOT -------------------------------------
  useEffect(() => {
    const pastPageVisible = sessionStorage.getItem("pageVisible");
    setPageVisible(pastPageVisible === "true");
  }, []);





  // --------------------------------------- INITIALIZE MAP --------------------------------------

  // URL HASH PARAMS, LOADING API DATA
  useEffect(() => {
    if (!hasDoneInitialZoom && hashParams.length > 0) {

      // -------------------- URL HASH PARAMS --------------------

      const previousZoom = sessionStorage.getItem("hashZoom");
      const previousLat = sessionStorage.getItem("hashLat");
      const previousLng = sessionStorage.getItem("hashLng");
      const previousBearing = sessionStorage.getItem("hashBearing");
      const previousPitch = sessionStorage.getItem("hashPitch");

      if(previousZoom && previousLat && previousLng && previousBearing && previousPitch) {
        // Logs for debugging
        /* console.log("After reload -- PREVIOUS HASH FOUND");
        console.log("Zoom", previousZoom);
        console.log("Lat", previousLat);
        console.log("Lng", previousLng);
        console.log("Bearing", previousBearing);
        console.log("Pitch", previousPitch); */

        // If the hash parameters are found in sessionStorage, update here for loading the previous map
        setHashParams([previousZoom, previousLng, previousLat, previousBearing, previousPitch]);
      }
      // Branch strictly used for debugging
      /* else {
        console.log("After reload -- PREVIOUS HASH NOT FOUND");
      } */

      setBeforeMapItem({
        id: "0",
        name: "Current Satellite",
        mapId: "clm2yrx1y025401p93v26bhyl",
        styleId: "clm2yrx1y025401p93v26bhyl",
        groupId: "",
        zoom: Number(hashParams?.at(0) ?? 0),
        center: [Number(hashParams?.at(1) ?? 0), Number(hashParams?.at(2) ?? 0)],
        bearing: Number(hashParams?.at(3) ?? 0),
        infoId: ''
      });

      // -------------------- LOADING API DATA -------------------

      const newCookie = getCookie("authToken");

      if (newCookie != "" && newCookie != undefined && newCookie != null) {
        setCurrAuthToken(newCookie);
      }

      getLayerSections();
      getZoomLayers();
      getStandaloneLayers();
      getMaps();
      fetchButtonLinks();
      
      setHasDoneInitialZoom(true);
    }
  }, []);

  // Dynamic import for mapbox-gl-compare package to allow it to be imported.
  // (Once they release a TS package, that can be added to NPM and this can be removed)
  useEffect(() => {
    import("mapbox-gl-compare").then((mod) => {
      setMapboxCompare(() => mod.default);
    });
  }, []);





  // ---------------------------------- FUNCTIONS FOR INITIALIZATION ----------------------------------

  const getLayerSections = () => {
    // Start with an empty array
    setCurrLayers([]);

    // Call the API fetch for the sections
    fetch("/api/chronmaps/LayerSection", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((sections) => {
      sections.json()?.then((parsed) => {
        if (!!parsed && !!parsed.LayerSections && parsed.LayerSections.length > 0) {
          let sections: PrismaLayerSection[] = parsed.LayerSections;

          let returnSectionLayers: SectionLayer[] = sections.map((x, idx_x) => {
            let layer: SectionLayer = {
              id: x.id,
              label: x.name,
              groups: (x as any).layerGroups.map((y: PrismaLayerGroup, idx_y: number) => {
                let mappedGroup: SectionLayerGroup = {
                  id: y.id,
                  label: y.name,
                  iconColor: (y as any).iconColor ?? IconColors.YELLOW,
                  iconType: FontAwesomeLayerIcons.PLUS_SQUARE,
                  isSolid: true,
                  center: y.longitude != null && y.latitude != null && y.longitude.length > 0 && y.latitude.length > 0
                    ? [+(y.longitude ?? 0), +(y.latitude ?? 0)]
                    : undefined,
                  zoomToBounds: y.zoomToBounds ?? false,
                  bounds: y.topLeftBoundLongitude && y.topLeftBoundLatitude && y.bottomRightBoundLongitude && y.bottomRightBoundLatitude
                    ? [[y.topLeftBoundLongitude, y.topLeftBoundLatitude], [y.bottomRightBoundLongitude, y.bottomRightBoundLatitude]]
                    : undefined,
                  bearing: y.bearing ?? 0,
                  zoom: y.zoom ?? 0,
                  infoId: y.infoId ?? '',
                  items: (y as any).layers?.map((z: PrismaLayer, z_idx: number) => {
                    let newDBMap: SectionLayerItem = {
                      id: z.id,
                      layerId: z.id,
                      label: z.label,
                      center: z.longitude != null && z.latitude != null ? [z.longitude, z.latitude] : undefined,
                      zoomToBounds: z.zoomToBounds ?? false,
                      enableByDefault: z.enableByDefault ?? false,
                      bounds: z.topLeftBoundLongitude && z.topLeftBoundLatitude && z.bottomRightBoundLongitude && z.bottomRightBoundLatitude
                        ? [[z.topLeftBoundLongitude, z.topLeftBoundLatitude], [z.bottomRightBoundLongitude, z.bottomRightBoundLatitude]]
                        : undefined,
                      zoom: z.zoom ?? undefined,
                      bearing: z.bearing ?? undefined,
                      iconColor: z.iconColor ?? IconColors.YELLOW,
                      iconType: z.iconType
                        ? parseFromString(z.iconType)
                        : FontAwesomeLayerIcons.LINE,
                      isSolid: false,
                    };
                                
                    return newDBMap;
                  }) ?? []
                };
                    
                return mappedGroup;
              })
            };

            return layer;
          });
          
          setSectionLayers(returnSectionLayers);
        }
      });
    });

    // Once the layer sections have been created, call the API fetch for the layers themselves
    fetch("/api/chronmaps/LayerData", {
      method: "GET",
      headers: {
        authorization: currAuthToken ?? '',
        "Content-Type": "application/json",
      },
    }).then((layerResponse) => {
      layerResponse.json()?.then((parsed) => {
        parsed.LayerData;
        console.log(parsed.LayerData);
        setCurrLayers(parsed.LayerData);
      });
    });
  };

  const getZoomLayers = () => {
    // Call the API fetch for the zooms
    fetch("/api/chronmaps/ZoomLabel", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((layers) => {
      layers.json()?.then((parsed) => {
        if (!!parsed && !!parsed.zoomLabel) {
          let labels: PrismaZoomLabel[] = parsed.zoomLabel;

          let parsedZoomLabels: ZoomLabel[] =
              labels?.map((lbl) => {
                let currLbl: ZoomLabel = {
                  title: lbl.title,
                  center:
                      lbl.centerLongitude && lbl.centerLatitude
                          ? [lbl.centerLongitude, lbl.centerLatitude]
                          : undefined,
                  bounds:
                      lbl.topLeftBoundLongitude &&
                      lbl.topLeftBoundLatitude &&
                      lbl.bottomRightBoundLongitude &&
                      lbl.bottomRightBoundLatitude
                          ? [
                            [lbl.topLeftBoundLongitude, lbl.topLeftBoundLatitude],
                            [
                              lbl.bottomRightBoundLongitude,
                              lbl.bottomRightBoundLatitude,
                            ],
                          ]
                          : undefined,
                  zoom: lbl.zoom ?? undefined,
                  bearing: lbl.bearing ?? undefined,
                  zoomToBounds: false,
                  textStyling: {
                    useTextSizeZoomStyling: lbl.useTextSizeZoomStyling,
                    textSizeDefault: lbl.textSizeDefault,
                    textSizeStops: [
                      [lbl.textSizeStopsZoom1, lbl.textSizeStopsVal1],
                      [lbl.textSizeStopsZoom2, lbl.textSizeStopsVal2],
                    ],
                    useTextColorZoomStyling: lbl.useTextColorZoomStyling,
                    textColorDefault: lbl.textColorDefault,
                    textColorStops: [
                      [lbl.textColorStopsZoom1, lbl.textColorStopsVal1],
                      [lbl.textColorStopsZoom2, lbl.textColorStopsVal2],
                    ],
                    useTextHaloWidthZoomStyling: lbl.useTextHaloWidthZoomStyling,
                    textHaloWidthDefault: lbl.textHaloWidthDefault,
                    textHaloWidthStops: [
                      [lbl.textHaloWidthStopsZoom1, lbl.textHaloBlurStopsVal1],
                      [lbl.textHaloWidthStopsZoom2, lbl.textHaloBlurStopsVal2],
                    ],
                    useTextHaloBlurZoomStyling: lbl.useTextHaloBlurZoomStyling,
                    textHaloBlurDefault: lbl.textHaloBlurDefault,
                    textHaloBlurStops: [
                      [lbl.textHaloBlurStopsZoom1, lbl.textHaloBlurStopsVal1],
                      [lbl.textHaloBlurStopsZoom2, lbl.textHaloBlurStopsVal2],
                    ],
                    useTextHaloColorZoomStyling: lbl.useTextHaloColorZoomStyling,
                    textHaloColorDefault: lbl.textHaloColorDefault,
                    textHaloColorStops: [
                      [lbl.textHaloColorStopsZoom1, lbl.textHaloColorStopsVal1],
                      [lbl.textHaloColorStopsZoom2, lbl.textHaloColorStopsVal2],
                    ],
                    useTextOpacityZoomStyling: lbl.useTextOpacityZoomStyling,
                    textOpacityDefault: lbl.textOpacityDefault,
                    textOpacityStops: [
                      [lbl.textOpacityStopsZoom1, lbl.textOpacityStopsVal1],
                      [lbl.textOpacityStopsZoom2, lbl.textOpacityStopsVal2],
                    ],
                  },
                };
                return currLbl;
              }) ?? [];
          addZoomLayers(parsedZoomLabels);
          setCurrZoomLayers(parsedZoomLabels);
        }
      });
    });
  };

  /*
    New function to parse all standalone layers in the database.
    Utilized the standalone layer api file to bring in information on the layers.
    The layers are then fed to the frontend in the same format as existing layers so that they display in the same format and with the same icons.
  */
  const getStandaloneLayers = () => {
    fetch("/api/chronmaps/StandaloneLayers", {
      method: "GET",
      headers: {
        authorization: currAuthToken ?? '',
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json()?.then((parsed) => {
        if (!!parsed && !!parsed.standaloneLayers && parsed.standaloneLayers.length > 0) {
          let standaloneLayers: PrismaLayer[] = parsed.standaloneLayers.map((layer: PrismaLayer) => {
            let newLayer: SectionLayerItem = {
              id: layer.id,
              layerId: layer.id,
              label: layer.label,
              center: layer.longitude != null && layer.latitude != null ? [layer.longitude, layer.latitude] : undefined,
              zoomToBounds: layer.zoomToBounds ?? false,
              enableByDefault: layer.enableByDefault ?? false,
              bounds: layer.topLeftBoundLongitude && layer.topLeftBoundLatitude && layer.bottomRightBoundLongitude && layer.bottomRightBoundLatitude
                ? [[layer.topLeftBoundLongitude, layer.topLeftBoundLatitude], [layer.bottomRightBoundLongitude, layer.bottomRightBoundLatitude],]
                : undefined,
              zoom: layer.zoom ?? undefined,
              bearing: layer.bearing ?? undefined,
              iconColor: layer.iconColor ?? IconColors.YELLOW,
              iconType: layer.iconType ? parseFromString(layer.iconType) : FontAwesomeLayerIcons.LINE,
              isSolid: false,
            };
            
            return newLayer;
          });
                  
          setStandaloneLayers(standaloneLayers);
        }
      });
    });
  };
  
  const getMaps = () => {
    // Call the API fetch for the maps
    fetch("/api/chronmaps/MapGroup", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((maps) => {
      maps.json()?.then((parsed) => {
        if (!!parsed && !!parsed.groups && parsed.groups.length) {
          let groups: PrismaMapGroup[] = parsed.groups;
                
          let mapFilterGroups: MapFiltersGroup[] = groups.map((grp, idx) => {
            let mappedGroup: MapFiltersGroup = {
              id: grp.id,
              name: grp.groupName,
              label: grp.label,
              maps: (grp as any).maps.map((x: PrismaMap) => {
                console.log("ZOOOOOM", x.zoomToBounds ?? false, x)
                    
                let newDBMap: MapItem = {
                  id: x.id,
                  mapId: x.mapId,
                  groupId: x.groupId,
                  center: x.longitude && x.latitude && x.longitude > 0 && x.latitude > 0 ? [x.longitude, x.latitude] : null,
                  zoomToBounds: x.zoomToBounds ?? false,
                  bounds: x.topLeftBoundLongitude && x.topLeftBoundLatitude && x.bottomRightBoundLongitude && x.bottomRightBoundLatitude
                    ? [[x.topLeftBoundLongitude, x.topLeftBoundLatitude], [x.bottomRightBoundLongitude, x.bottomRightBoundLatitude]]
                    : undefined,
                  zoom: x.zoom,
                  bearing: x.bearing,
                  styleId: x.styleId,
                  name: x.mapName,
                  infoId: x.infoId ?? ''
                };
                        
                return newDBMap;
              })
            };
                    
            return mappedGroup;
          });
                
          setMappedFilterItemGroups(mapFilterGroups);
        }
      }).catch((err) => {
        console.error("failed to convert to json: ", err);
      });
    }).catch((err) => {
      console.error(err);
    });
  };

  const fetchButtonLinks = async () => {
    try {
      const response = await fetch("/api/chronmaps/ButtonLink");
      const data = await response.json();
      if (data && data.buttonLinks) {
        setButtonLinks(data.buttonLinks);
      }
    } catch (error) {
      console.error("Error fetching button links:", error);
    }
  };





  // ------------------------------ MOVE LAYERS (ORDERING ON MAP RENDER) ------------------------------

  const openOrderingMenu = () => {
    if (showLayerOrdering) {
      setShowLayerOrdering(false);
    }
    else {
      setShowLayerOrdering(true);
    }
  };

  const moveLayerUp = (layerUp: PrismaLayer) => {
    // Get the index of the layer to insert this layer before
    let beforeIndex = layerOrder.findIndex((e) => e.id == layerUp.id) - 1;

    console.log("Layer ordering:", layerOrder);
    console.log("Index layer wants to move to (up):", beforeIndex);

    // Make sure it is valid to move up (not already at the top)
    if (beforeIndex >= 0) {
      // Update both maps (moveLayer is a mapbox api function)
      currAfterMap.current?.moveLayer(layerUp.id, layerOrder[beforeIndex].id);
      currBeforeMap.current?.moveLayer(layerUp.id, layerOrder[beforeIndex].id);

      // Shallow copy of the current layer order
      let TEMP_layerOrder = [...layerOrder];

      // Grab the layers that need updated in the database
      let TEMP_moveUpLayer = layerOrder[beforeIndex + 1];
      let TEMP_moveDownLayer = layerOrder[beforeIndex];

      // Swap the viewOrder properties
      let TEMP_swapOrderHelper = TEMP_moveUpLayer.viewOrder;
      TEMP_moveUpLayer.viewOrder = TEMP_moveDownLayer.viewOrder;
      TEMP_moveDownLayer.viewOrder = TEMP_swapOrderHelper;

      // Update the layerOrder array with the new viewOrder properties
      TEMP_layerOrder[beforeIndex] = TEMP_moveUpLayer;
      TEMP_layerOrder[beforeIndex + 1] = TEMP_moveDownLayer;

      // Move the desired layer up (in the database)
      try {
        fetch("/api/chronmaps/LayerData", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(TEMP_moveUpLayer),
        });
      } catch (e) {
        console.log("Error moving the layer up:", e);
      }

      // Move the layer above down (in the database)
      try {
        fetch("/api/chronmaps/LayerData", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(TEMP_moveDownLayer),
        });
      } catch (e) {
        console.log("Error moving the layer up (layer to be moved down):", e);
      }

      // Update the useState for future data
      setLayerOrder(TEMP_layerOrder);
    }
  };

  const moveLayerDown = (layerDown: PrismaLayer) => {
    // Get layer 2 away because moveLayer inserts the given layer before it
    let beforeIndex = layerOrder.findIndex((e) => e.id == layerDown.id) + 2;

    // Check if moveLayer should append to the end (false) or move to before another layer
    if (beforeIndex < layerOrder.length) {
      // Update both maps (moveLayer is a mapbox api function -- layerID, insertBeforeID)
      currAfterMap.current?.moveLayer(layerDown.id, layerOrder[beforeIndex].id);
      currBeforeMap.current?.moveLayer(layerDown.id, layerOrder[beforeIndex].id);

      // Shallow copy of the current layer order
      let TEMP_layerOrder = [...layerOrder];

      // Grab the layers that need updated in the database
      let TEMP_moveDownLayer = layerOrder[beforeIndex - 2];
      let TEMP_moveUpLayer = layerOrder[beforeIndex - 1];

      // Swap the viewOrder properties
      let TEMP_swapOrderHelper = TEMP_moveDownLayer.viewOrder;
      TEMP_moveDownLayer.viewOrder = TEMP_moveUpLayer.viewOrder;
      TEMP_moveUpLayer.viewOrder = TEMP_swapOrderHelper;

      // Update the layerOrder array with the new viewOrder properties
      TEMP_layerOrder[beforeIndex - 1] = TEMP_moveDownLayer;
      TEMP_layerOrder[beforeIndex - 2] = TEMP_moveUpLayer;

      // Move the desired layer down (in the database)
      try {
        fetch("/api/chronmaps/LayerData", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(TEMP_moveDownLayer),
        });
      } catch (e) {
        console.log("Error moving the layer down:", e);
      }

      // Move the layer below up (in the database)
      try {
        fetch("/api/chronmaps/LayerData", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(TEMP_moveUpLayer),
        });
      } catch (e) {
        console.log("Error moving the layer down (layer to be moved up):", e);
      }

      // Update the useState for future data
      setLayerOrder(TEMP_layerOrder);
    } 

    // NEEDS TO BE AN ELSE IF -- Otherwise, it doesn't handle case of moving outside index range (ATA 3/18/25)
    else if (beforeIndex == layerOrder.length) {
      // Update both maps (moveLayer is a mapbox api function -- layerID) APPENDS TO THE END
      currAfterMap.current?.moveLayer(layerDown.id);
      currBeforeMap.current?.moveLayer(layerDown.id);

      // Shallow copy of the current layer order
      let TEMP_layerOrder = [...layerOrder];

      // Grab the layers that need updated in the database
      let TEMP_moveDownLayer = layerDown;
      let TEMP_moveDownLayerViewOrder = TEMP_moveDownLayer.viewOrder; // add in a variable to make swap slightly easier and different
      let TEMP_moveUpLayer = layerOrder[layerOrder.length - 1];

      // Swap the viewOrder properties
      TEMP_moveDownLayer.viewOrder = TEMP_moveUpLayer.viewOrder;
      TEMP_moveUpLayer.viewOrder = TEMP_moveDownLayerViewOrder;

      // Update the layerOrder array with the new viewOrder properties
      TEMP_layerOrder[layerOrder.length - 2] = TEMP_moveUpLayer;
      TEMP_layerOrder[layerOrder.length - 1] = TEMP_moveDownLayer;

      try {
        fetch("/api/chronmaps/LayerData", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(TEMP_moveDownLayer),
        });
      } catch (e) {
        console.log("Error moving the layer down:", e);
      }

      try {
        fetch("/api/chronmaps/LayerData", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(TEMP_moveUpLayer),
        });
      } catch (e) {
        console.log("Error moving the layer down (layer to be moved up):", e);
      }

      setLayerOrder(TEMP_layerOrder);
    }
  };





  // ---------------------------------------------------------------------------------------------

  /**
   * On first load (When Mapbox defaults haven't been loaded yet, but the dynamic import is complete), create defaults for the before/after map and initialize everything
   */
  useEffect(() => {
    if (!MapboxCompare || !comparisonContainerRef.current) return;
    if (beforeMapItem == null || beforeMapItem.bearing == null) return;
    // setMapLoaded(true); ORIGINALLY set here, but I think that's wrong

    const defBeforeMap = new mapboxgl.Map({
      ...beforeMapItem,
      container: beforeMapContainerRef.current as HTMLElement,
      style: "mapbox://styles/mapny/clm2yrx1y025401p93v26bhyl",
      zoom: Number(hashParams?.at(0) ?? 0),
      center: [Number(hashParams?.at(1) ?? 0), Number(hashParams?.at(2) ?? 0)],
      bearing: Number(hashParams?.at(3) ?? 0),
      pitch: Number(hashParams?.at(4) ?? 0),
      attributionControl: false,
    });

    const defAfterMap = new mapboxgl.Map({
      ...beforeMapItem,
      container: afterMapContainerRef.current as HTMLElement,
      style: "mapbox://styles/mapny/clm2yu5fg022801phfh479c8x",
      zoom: Number(hashParams?.at(0) ?? 0),
      center: [Number(hashParams?.at(1) ?? 0), Number(hashParams?.at(2) ?? 0)],
      bearing: Number(hashParams?.at(3) ?? 0),
      pitch: Number(hashParams?.at(4) ?? 0),
      attributionControl: false,
    });


    defBeforeMap.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    defAfterMap.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    setDefaultBeforeMap(defBeforeMap);
    setDefaultAfterMap(defAfterMap);

    currBeforeMap.current = defBeforeMap;
    currAfterMap.current = defAfterMap;

    currBeforeMap.current?.easeTo({
      zoom: Number(hashParams?.at(0) ?? 0),
      center: [Number(hashParams?.at(1) ?? 0), Number(hashParams?.at(2) ?? 0)],
      bearing: Number(hashParams?.at(3) ?? 0),
      pitch: Number(hashParams?.at(4) ?? 0),
      easing(t) {
        return t;
      },
    });

    const mapboxCompare = new MapboxCompare(
      currBeforeMap.current,
      currAfterMap.current,
      comparisonContainerRef.current as HTMLElement
    );

    const compareSwiper = document.querySelector(
        ".compare-swiper"
    ) as HTMLElement;
    if (compareSwiper && !modalOpen) {
      compareSwiper.innerHTML = "";

      const circleHandle = document.createElement("div");
      circleHandle.classList.add("compare-circle");
      circleHandle.innerHTML = "<span>⏴⏵</span>";

      compareSwiper.appendChild(circleHandle);

      circleHandle.onmousedown = function (e: MouseEvent) {
        e.preventDefault();

        const containerWidth = comparisonContainerRef.current?.offsetWidth || 1;

        document.onmousemove = function (e) {
          let newLeft = e.clientX;

          newLeft = Math.max(0, Math.min(newLeft, containerWidth));

          compareSwiper.style.left = `${newLeft}px`;

          const swiperPosition = newLeft / containerWidth;
          mapboxCompare.setSlider(swiperPosition * containerWidth);
        };

        document.onmouseup = function () {
          document.onmousemove = null;
        };
      };
    }

    // Add scroll event listener to update hashParams
    const updateHashParams = () => {
      // Get the hash states
      const zoom = currBeforeMap.current?.getZoom();
      const center = currBeforeMap.current?.getCenter();
      const bearing = currBeforeMap.current?.getBearing();
      const pitch = currBeforeMap.current?.getPitch();

      // Check each value is defined
      if (zoom != null && center != null && bearing != null && pitch != null) {
        // Update the hash in the URL
        window.history.replaceState(null, "", `${pathname}/#${zoom.toFixed(2)}/${center.lat.toFixed(6)}/${center.lng.toFixed(6)}/${bearing.toFixed(1)}/${pitch.toFixed(0)}`);

        // Set the useState for any other use of the hash parameters
        setHashParams([zoom.toFixed(2).toString(), center.lat.toFixed(6).toString(), center.lng.toFixed(6).toString(), bearing.toFixed(1).toString(), pitch.toFixed(0).toString()]);
        
        // Set local storage for potential reloads
        sessionStorage.setItem("hashZoom", zoom.toFixed(2).toString());
        sessionStorage.setItem("hashLat", center.lat.toFixed(6).toString());
        sessionStorage.setItem("hashLng", center.lng.toFixed(6).toString());
        sessionStorage.setItem("hashBearing", bearing.toFixed(1).toString());
        sessionStorage.setItem("hashPitch", pitch.toFixed(0).toString());
      }
    };

    // Wait until movement stops, then update hashParams
    currBeforeMap.current?.on('moveend', updateHashParams);
    currAfterMap.current?.on('moveend', updateHashParams);

    setMapLoaded(true);

    // Upon exiting useEffect, remove that listener for updating the hashParams
    return () => {
      currBeforeMap.current?.off('moveend', updateHashParams);
      currAfterMap.current?.off('moveend', updateHashParams);
    };
  }, [MapboxCompare, hasDoneInitialZoom]); 

  useEffect(() => {
    if (!mapLoaded) return;
    if (currBeforeMap === null || currAfterMap === null) return;

    function updateLayerVisibility() {
      if (!currBeforeMap.current?.isStyleLoaded() || !currAfterMap.current?.isStyleLoaded()) return;

      currLayers.forEach((layer) => {
        if ( 
            activeLayerIds.includes(layer.id) &&
            currBeforeMap.current?.getLayer(layer.id)
        ) {
          currBeforeMap.current!.setLayoutProperty(layer.id, "visibility", "visible");
          currAfterMap.current!.setLayoutProperty(layer.id, "visibility", "visible");
        }
        else {
          currBeforeMap.current!.setLayoutProperty(
              layer.id,
              "visibility",
              "none"
          );
          currAfterMap.current!.setLayoutProperty(
              layer.id,
              "visibility",
              "none"
          );
          const popupBefore = activePopupsBefore.current.get(layer.id);
          const popupAfter = activePopupsAfter.current.get(layer.id);
          if (popupBefore)
          {
            popupBefore.remove();
            activePopupsBefore.current.delete(layer.id);
          }
          if (popupAfter)
          {
            popupAfter.remove();
            activePopupsAfter.current.delete(layer.id);
          }
          if(popUpVisible)
          {
            setPopUpVisible(false);
          }
        }
      });
    }

    // Run immediately if styles are already loaded
    if (currBeforeMap.current?.isStyleLoaded() && currAfterMap.current?.isStyleLoaded()) {
      updateLayerVisibility();
    }

    // Listen for style loading if not ready yet
    currBeforeMap.current?.on("styledata", updateLayerVisibility);
    currAfterMap.current?.on("styledata", updateLayerVisibility);

    // Cleanup function to remove event listeners on unmount
    return () => {
      currBeforeMap.current?.off("styledata", updateLayerVisibility);
      currAfterMap.current?.off("styledata", updateLayerVisibility);
    };
  }, [mapLoaded, currBeforeMap, currAfterMap, activeLayerIds, reRenderActiveLayers, hasDoneInitialZoom]);









  useEffect(() => {
    if (!MapboxCompare || !comparisonContainerRef.current) return;
    const mapboxCompare = new MapboxCompare(
        currBeforeMap.current,
        currAfterMap.current,
        comparisonContainerRef.current as HTMLElement
    );

    const compareSwiper = document.querySelector(
        ".compare-swiper"
    ) as HTMLElement;
    if (compareSwiper && !modalOpen) {
      compareSwiper.innerHTML = "";

      const circleHandle = document.createElement("div");
      circleHandle.classList.add("compare-circle");
      circleHandle.innerHTML = "<span>⏴⏵</span>";

      compareSwiper.appendChild(circleHandle);

      circleHandle.onmousedown = function (e: MouseEvent) {
        e.preventDefault();

        const containerWidth = comparisonContainerRef.current?.offsetWidth || 1;

        document.onmousemove = function (e) {
          let newLeft = e.clientX;

          newLeft = Math.max(0, Math.min(newLeft, containerWidth));

          compareSwiper.style.left = `${newLeft}px`;

          const swiperPosition = newLeft / containerWidth;
          mapboxCompare.setSlider(swiperPosition * containerWidth);
        };

        document.onmouseup = function () {
          document.onmousemove = null;
        };
      };
    }
  }, [currBeforeMap, currAfterMap]);

  useEffect(() => {
    if (currBeforeMap !== null && currAfterMap !== null) {
      addAllMapLayers();
      addZoomLayers(currZoomLayers);
    }
  }, [currLayers, currBeforeMap, currAfterMap, currZoomLayers, hasDoneInitialZoom]);

  /*
    Update the date filter for each layer when either thing happens
      1. Date is changed on the map
      2. The active layers change
  */
  useEffect(() => {
    if (!currDate) return;

    var date = parseInt(currDate.format("YYYYMMDD"));

    var dateFilter: FilterSpecification = [
      "all",
      ["<=", ["get", "DayStart"], date],
      [">=", ["get", "DayEnd"], date],
    ];

    activeLayerIds.forEach((lid) => {
      if (currBeforeMap.current?.getLayer(lid) !== null && currBeforeMap.current?.getLayer(lid)?.filter !== undefined) {
        currBeforeMap.current?.setFilter(lid, dateFilter);
      }

      if (currAfterMap.current?.getLayer(lid) !== null && currAfterMap.current?.getLayer(lid)?.filter !== undefined) {
        currAfterMap.current?.setFilter(lid, dateFilter);
      }
    });
  }, [currDate, activeLayerIds]);










  const setMapStyle = (
      map: MutableRefObject<mapboxgl.Map | null>,
      mapId: string
  ) => {
    if (map?.current) {
      map.current.setStyle(`mapbox://styles/mapny/${mapId.trim()}`);

      // Replace this later
      setTimeout(() => {
        addAllMapLayers();
        setReRenderActiveLayers(!reRenderActiveLayers);
        addZoomLayers(currZoomLayers);
      }, 2000);
    }
  };

  const addZoomLayers = (layerData: ZoomLabel[]) => {
    if (currAfterMap != null && currBeforeMap != null) {
      layerData.forEach((label) => {
        addInteractivityToLabel(
            currAfterMap,
            label,
            false,
            router,
            pathname ?? ""
        );
        addInteractivityToLabel(
            currBeforeMap,
            label,
            true,
            router,
            pathname ?? ""
        );
      });
    }
  };

  const addMapLayer = (
      beforeMap: MutableRefObject<mapboxgl.Map | null>,
      afterMap: MutableRefObject<mapboxgl.Map | null>,
      layerConfig: PrismaLayer
  ) => {
    if (beforeMap?.current == null || afterMap?.current == null) return;

    let layerTypes: string[] = [
      "symbol",
      "fill",
      "line",
      "circle",
      "heatmap",
      "fill-extrusion",
      "raster",
      "raster-particle",
      "hillshade",
      "model",
      "background",
      "sky",
      "slot",
      "clip",
    ];

    // Parses the paint string into a JSON object
    const parsedPaint = layerConfig.paint ? JSON.parse(layerConfig.paint) : {};
    const parsedLayout = layerConfig.layout
        ? JSON.parse(layerConfig.layout)
        : {};

    if (layerTypes.includes(layerConfig.type)) {
      let paint = {};
      let layout = { ...parsedLayout };

      // Sets paint properties based on layer type
      if (layerConfig.type === "fill") {
        paint = {
          "fill-color": parsedPaint["fill-color"] ?? "#e3ed58",
          "fill-opacity": parsedPaint["fill-opacity"] ?? [
            "interpolate",
            ["linear"],
            ["zoom"],
            ...(parsedPaint["fill-opacity-zoom"] ?? [8, 0.5, 15, 1.0]),
          ],
          "fill-outline-color": parsedPaint["fill-outline-color"] ?? "#FF0000",
        };
      } else if (layerConfig.type === "symbol") {
        paint = {
          "text-color": parsedPaint["text-color"] ?? "#000080",
          "text-halo-color": parsedPaint["text-halo-color"] ?? "#ffffff",
          "text-halo-width": parsedPaint["text-halo-width"] ?? 2,
        };

        layout = {
          ...layout,
          "text-field": parsedLayout["text-field"] ?? "{name}", // Default text
          // "text-offset": Array.isArray(parsedLayout["text-offset"]),
          "text-size": Array.isArray(parsedLayout["text-size"])
              ? parsedLayout["text-size"] // Use existing interpolation array
              : parsedLayout["text-size"]?.useTextSizeZoomStyling
                  ? [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    ...(parsedLayout["text-size"].textSizeStops ?? [
                      6,
                      0,
                      8,
                      7,
                      15,
                      17,
                      20,
                      25, // Invisible at zoom 8, visible and larger as you zoom in
                    ]),
                  ]
                  : parsedLayout["text-size"]?.textSizeDefault ?? 12,
          "text-anchor": parsedLayout["text-anchor"] ?? "top",
          "icon-image": parsedLayout["icon-image"] ?? "marker-icon",
          "icon-size": parsedLayout["icon-size"]?.useIconSizeZoomStyling
              ? [
                "interpolate",
                ["linear"],
                ["zoom"],
                ...(parsedLayout["icon-size"].iconSizeStops ?? [
                  8, 0.5, 15, 1.0,
                ]),
              ]
              : parsedLayout["icon-size"]?.iconSizeDefault ?? 0.5,
        };
      } else if (layerConfig.type === "circle") {
        paint = {
          "circle-color": parsedPaint["circle-color"] ?? "#FF0000",
          "circle-opacity": parsedPaint["circle-opacity"] ?? [
            "interpolate",
            ["linear"],
            ["zoom"],
            ...(parsedPaint["circle-opacity-zoom"] ?? [6, 0, 10, 0.5, 14, 1]),
          ],
          "circle-radius": parsedPaint["circle-radius"] ?? [
            "interpolate",
            ["linear"],
            ["zoom"],
            ...(parsedPaint["circle-radius-zoom"] ?? [
              6, 0, 10, 3, 14, 7, 18, 12,
            ]),
          ],
          "circle-stroke-color":
              parsedPaint["circle-stroke-color"] ?? "#000000",
          "circle-stroke-width": parsedPaint["circle-stroke-width"] ?? 1,
          "circle-stroke-opacity": parsedPaint["circle-stroke-opacity"] ?? [
            "interpolate",
            ["linear"],
            ["zoom"],
            ...(parsedPaint["circle-stroke-opacity-zoom"] ?? [
              6, 0, 10, 0.5, 14, 1,
            ]),
          ],
        };
      } else if (layerConfig.type === "line") {
        paint = {
          "line-color": parsedPaint["line-color"] ?? "#ff9900",
          "line-width": parsedPaint["line-width"] ?? [
            "interpolate",
            ["linear"],
            ["zoom"],
            ...(parsedPaint["line-width-zoom"] ?? [8, 2, 15, 0]),
          ],
          "line-blur": parsedPaint["line-blur"] ?? 0,
          "line-opacity": parsedPaint["line-opacity"] ?? 1.0,
        };
      }
      // if (layerConfig.type === "circle" && layerConfig.iconImage) {
      //   const imageKey = `icon_image_${layerConfig.id}`;

      //   // Ensure the image is loaded into the `beforeMap`
      //   if (!beforeMap.current?.hasImage(imageKey)) {
      //     beforeMap.current?.loadImage(layerConfig.iconImage, (err, image) => {
      //       if (err) throw err;
      //       beforeMap.current?.addImage(imageKey, image!);
      //     });
      //   }

      //   // Ensure the image is loaded into the `afterMap`
      //   if (!afterMap.current?.hasImage(imageKey)) {
      //     afterMap.current?.loadImage(layerConfig.iconImage, (err, image) => {
      //       if (err) throw err;
      //       afterMap.current?.addImage(imageKey, image!);
      //     });
      //   }

      //   // Add the `symbol` layer to both maps
      //   // const symbolLayer = {
      //   //   id: `${layerConfig.id}-symbol`,
      //   //   type: "symbol",
      //   //   source: {
      //   //     type: "vector",
      //   //     url: layerConfig.sourceUrl,
      //   //   },
      //   //   "source-layer": layerConfig.sourceLayer,
      //   //   layout: {
      //   //     "icon-image": imageKey,
      //   //     "icon-size": 0.5,
      //   //     "icon-allow-overlap": true,
      //   //   },
      //   // };

      //   // if (!beforeMap.current?.getLayer(symbolLayer.id)) {
      //   //   beforeMap.current?.addLayer(symbolLayer as any);
      //   // }

      //   // if (!afterMap.current?.getLayer(symbolLayer.id)) {
      //   //   afterMap.current?.addLayer(symbolLayer as any);
      //   // }

      //   // return; // Exit early for this custom case
      // }

      const layerStuff = {
        id: layerConfig.id,
        type: layerConfig.type as unknown as mapboxgl.LayerSpecification["type"],
        source: {
          type: "vector",
          url: layerConfig.sourceUrl,
        },
        layout: {
          visibility: "none",
          ...layout,
        },
        "source-layer": layerConfig.sourceLayer,
        paint,
      };

      var date = parseInt(currDate!.format("YYYYMMDD"));
      var dateFilter: FilterSpecification = [
        "all",
        ["<=", ["get", "DayStart"], date],
        [">=", ["get", "DayEnd"], date],
      ];
      //Create generic layerhandler for both maps
      const handleEvent = createHandleEvent(beforeMap, afterMap, layerConfig);

      // Waiting for load of style before adding layer -- Fixes "Style not done loading" error
      beforeMap.current?.on("load", () => {
        // Added the part after the && to help with "Resource already exists" error
        if (!beforeMap.current?.getLayer(layerConfig.id) && !beforeMap.current?.getSource(layerConfig.id)) {
          if (layerConfig.time) {
            beforeMap.current?.addLayer({
              ...(layerStuff as any),
              filter: dateFilter,
            });
          }
          else {
            beforeMap.current?.addLayer(layerStuff as any);
          }

          beforeMap.current?.on("mousemove", layerConfig.id, handleEvent);
          beforeMap.current?.on("mouseleave", layerConfig.id, handleEvent);
          beforeMap.current?.on("click", layerConfig.id, handleEvent);

          // Store the reference to the handler in a way you can access it later if needed
          (beforeMap.current as any)._eventHandlers =
              (beforeMap.current as any)._eventHandlers || {};
          (beforeMap.current as any)._eventHandlers[layerConfig.id] = handleEvent;
        }
      });

      // Waiting for load of style before adding layer -- Fixes "Style not done loading" error
      afterMap.current?.on("load", () => {
        // Added the part after the && to help with "Resource already exists" error
        if (!afterMap.current?.getLayer(layerConfig.id) && !afterMap.current?.getSource(layerConfig.id)) {
          if (layerConfig.time) {
            afterMap.current?.addLayer({
              ...(layerStuff as any),
              filter: dateFilter,
            });
          }
          else {
            afterMap.current?.addLayer(layerStuff as any);
          }

          afterMap.current?.on("mousemove", layerConfig.id, handleEvent);
          afterMap.current?.on("mouseleave", layerConfig.id, handleEvent);
          afterMap.current?.on("click", layerConfig.id, handleEvent);

          // Store the reference to the handler in a way you can access it later if needed
          (afterMap.current as any)._eventHandlers =
              (afterMap.current as any)._eventHandlers || {};
          (afterMap.current as any)._eventHandlers[layerConfig.id] = handleEvent;
        }
      });
    }
  };




  





  function createHandleEvent(
    beforeMap: MutableRefObject<mapboxgl.Map | null>, 
    afterMap: MutableRefObject<mapboxgl.Map | null>, 
    layerConfig: PrismaLayer
  ) {
    let hoveredId: string | number | undefined = undefined;
    let hoverStyleString: string;
    var popUpType: PopupType;
    var clickVisible: boolean = popUpVisible;
    var previousNid: number | string | undefined;
    var newNid: number | string | undefined;
    var previousName: string | undefined;
    var newName: string | undefined;
    let beforeHoverPopup = new mapboxgl.Popup({closeOnClick: false, closeButton: false});
    let beforeClickHoverPopUp = new mapboxgl.Popup({closeOnClick: false, closeButton: false});
    let afterHoverPopup = new mapboxgl.Popup({closeOnClick: false, closeButton: false});
    let afterClickHoverPopUp = new mapboxgl.Popup({closeOnClick: false, closeButton: false});



    //Determine clickPopup styling vs hoverPopup styling
    //They're the same right now
    popUpType = layerConfig.clickStyle as PopupType;



    return (e: any) => {
      if (e.type === "click" && layerConfig.click) {
        let nIdPropNames: string[] = ['drupalNid', 'nid', 'node_id', 'node', 'NID_num'];
        const nidVals = nIdPropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
        const unknowNid = nidVals.length > 0 ? nidVals[0] : undefined;

        if(typeof unknowNid === 'number')
        {
          newNid = unknowNid;
        }
        else
        {
          const match = unknowNid.match(/\d+/);
          if(match)
          {
            newNid = parseInt(match[0], 10);
          }
          else
          {
            newNid = undefined;
          }
        }
        console.log("Nid value:");
        console.log(newNid);
        let namePropNames: string[] = ['name', 'Name', 'NAME', 'name_txt', 'OwnerName', 'to'];
        const nameVals = namePropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
        newName = nameVals.length > 0 ? nameVals[0] : undefined;
        if (beforeClickHoverPopUp.isOpen() || afterClickHoverPopUp.isOpen()) {
          beforeClickHoverPopUp.remove();
          afterClickHoverPopUp.remove();
          activePopupsBefore.current.delete(layerConfig.id);
          activePopupsAfter.current.delete(layerConfig.id);
        }
        beforeClickHoverPopUp
          .setHTML(hoverStyleString)
          .setLngLat(e.lngLat)
          .addTo(beforeMap.current!);
        activePopupsBefore.current.set(layerConfig.id, beforeClickHoverPopUp);
        afterClickHoverPopUp
          .setHTML(hoverStyleString)
          .setLngLat(e.lngLat)
          .addTo(afterMap.current!);
        activePopupsAfter.current.set(layerConfig.id, afterClickHoverPopUp);
        if (
          clickVisible &&
          previousNid &&
          previousNid === newNid
        ) {
          clickVisible = false;
          setPopUpVisible(clickVisible);
          beforeClickHoverPopUp.remove();
          afterClickHoverPopUp.remove();
          activePopupsBefore.current.delete(layerConfig.id);
          activePopupsAfter.current.delete(layerConfig.id);
        } else if (
            clickVisible &&
            previousName &&
            previousName === newName
        ) {
          clickVisible = false;
          setPopUpVisible(clickVisible);
          beforeClickHoverPopUp.remove();
          afterClickHoverPopUp.remove();
          activePopupsBefore.current.delete(layerConfig.id);
          activePopupsAfter.current.delete(layerConfig.id);
        } else {
          previousName = newName;
          previousNid = newNid;
          setPopUp({
            layerName: layerConfig.clickHeader,
            nid: newNid,
            type: popUpType,
          });
          clickVisible = true;
          setPopUpVisible(clickVisible);
        }
      } else if (e.type === "mousemove" && layerConfig.hover) {
        hoverStyleString =
            "<div class='" + layerConfig.hoverStyle + "HoverPopup'>";
        //Setup some sort of check on LayerConfig
        //Sample data maybe? [{label: "", type: "LOT"}, {label: "Name", type: "NAME"}, {label: "", type: "DATE-START"}, {label: "", type: "DATE-END"}]
        layerConfig.hoverContent.map((item: hoverItem) => {
          if (item.label.length !== 0) {
            hoverStyleString += "<b>" + item.label + ":</b> ";
          }
          if (item.type === "NAME") {
            let namePropNames: string[] = ['name', 'Name', 'NAME', 'name_txt', 'OwnerName', 'to'];
            const nameVals = namePropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
            const name: string = nameVals.length > 0 ? nameVals[0] : undefined;
            if(name)
            {
              hoverStyleString += name + "<br>";
            }
          } else if (item.type === "LOT") {
            let lotPropNames: string[] = ['LOT2', 'TAXLOT', 'Lot', 'dutchlot', 'lot2'];
            const lotVals = lotPropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
            const lot: string = lotVals.length > 0 ? lotVals[0] : undefined;
            if(lot)
            {
              hoverStyleString += lot + "<br>";
            }
          } else if (item.type === "DATE-START") {
            let dayStartPropNames: string[] = ['day1'];
            const dayStartVals = dayStartPropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
            const dayStart: string = dayStartVals.length > 0 ? dayStartVals[0] : undefined;
            let yearStartPropNames: string[] = ['year1'];
            const yearStartVals = yearStartPropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
            const yearStart: string = yearStartVals.length > 0 ? yearStartVals[0] : undefined;
            if(dayStart)
            {
              hoverStyleString += dayStart + ", ";
            }
            if(yearStart)
            {
              hoverStyleString += yearStart;
            }
            hoverStyleString += "<br>";
          } else if (item.type === "DATE-END") {
            let dayEndPropNames: string[] = ['day2'];
            const dayEndVals = dayEndPropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
            const dayEnd: string = dayEndVals.length > 0 ? dayEndVals[0] : undefined;
            let yearEndPropNames: string[] = ['year2'];
            const yearEndVals = yearEndPropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
            const yearEnd: string = yearEndVals.length > 0 ? yearEndVals[0] : undefined;
            if(dayEnd)
            {
              hoverStyleString += dayEnd + ", ";
            }
            if(yearEnd)
            {
              hoverStyleString += yearEnd;
            }
            hoverStyleString += "<br>";
          } else if (item.type === "ADDRESS") {
            let addressPropNames: string[] = ['Address'];
            const addressVals = addressPropNames.map(x => e.features[0].properties[x]).filter(y => y != null);
            const address: string = addressVals.length > 0 ? addressVals[0] : undefined;
            if(address)
            {
              hoverStyleString += address + "<br>";
            }
          }
        });
        hoverStyleString += "</div>";
        if (e.features?.length) {
          if (hoveredId !== null) {
            beforeMap.current!.setFeatureState(
                {
                  source: layerConfig.id,
                  sourceLayer: layerConfig.sourceLayer,
                  id: hoveredId,
                } as any,
                { hover: false }
            );
            afterMap.current!.setFeatureState(
                {
                  source: layerConfig.id,
                  sourceLayer: layerConfig.sourceLayer,
                  id: hoveredId,
                } as any,
                { hover: false }
            );
          }

          if (e.features[0].id !== undefined) {
            hoveredId = e.features[0].id;
            beforeMap.current!.setFeatureState(
                {
                  source: layerConfig.id,
                  sourceLayer: layerConfig.sourceLayer,
                  id: hoveredId,
                } as any,
                { hover: true }
            );
            beforeMap.current!.getCanvas().style.cursor = "pointer";
            afterMap.current!.setFeatureState(
                {
                  source: layerConfig.id,
                  sourceLayer: layerConfig.sourceLayer,
                  id: hoveredId,
                } as any,
                { hover: true }
            );
            afterMap.current!.getCanvas().style.cursor = "pointer";
          }
          beforeHoverPopup
              .setHTML(hoverStyleString)
              .setLngLat(e.lngLat)
              .addTo(beforeMap.current!);
          afterHoverPopup
              .setHTML(hoverStyleString)
              .setLngLat(e.lngLat)
              .addTo(afterMap.current!);
        }
      } else if (e.type === "mouseleave" && layerConfig.hover) {
        beforeMap.current!.getCanvas().style.cursor = "";
        afterMap.current!.getCanvas().style.cursor = "";
        if (hoveredId) {
          beforeMap.current!.setFeatureState(
              {
                source: layerConfig.id,
                sourceLayer: layerConfig.sourceLayer,
                id: hoveredId,
              },
              { hover: false }
          );
          afterMap.current!.setFeatureState(
              {
                source: layerConfig.id,
                sourceLayer: layerConfig.sourceLayer,
                id: hoveredId,
              },
              { hover: false }
          );
          hoveredId = undefined;
        }
        beforeHoverPopup.remove();
        afterHoverPopup.remove();
      }
    };
  }

  const removeMapLayerBothMaps = (id: string) => {
    removeMapLayer(currBeforeMap, id);
    removeMapLayer(currAfterMap, id);
  };
  const removeMapLayer = (
      map: MutableRefObject<mapboxgl.Map | null>,
      id: string
  ) => {
    if (map === null) return;
    //Remove the layer
    if (map.current!.getLayer(id)) {
      //Retrieve the stored event handlers
      const handler = (map.current as any)._eventHandlers?.[id];

      //Remove event listeners if the handler exists
      if (handler) {
        map.current!.off("mousemove", id, handler);
        map.current!.off("mouseleave", id, handler);
        map.current!.off("click", id, handler);
      }
      //Remove layer and source from map
      map.current!.removeLayer(id);
      map.current!.removeSource(id);
      //Clean up the stored handler
      delete (map.current as any)._eventHandlers[id];
    }
  };

  const addAllMapLayers = () => {
    if (currLayers !== null) {
      let tempLayerOrder: PrismaLayer[] = [];
      currLayers.forEach((x: PrismaLayer) => {
        addMapLayer(currBeforeMap, currAfterMap, x);
        tempLayerOrder.push(x);
      });
      setLayerOrder(tempLayerOrder);
    }
    if (standAloneLayers !== null) {
      console.log("standAloneLayers: ", standAloneLayers);
      standAloneLayers?.forEach((x: PrismaLayer) => {
        addMapLayer(currBeforeMap, currAfterMap, x);
      });
    }
    console.log("layer order");
    console.log(layerOrder);
  };





  // ----------------------------------- FUNCTIONS FOR HTML ELEMENT -----------------------------------

  const beforeLayerFormModalOpen = () => {
    setLayerPanelVisible(false);
    setLayerPopupBefore(popUpVisible); // Store popupVisibile before value to call after modal closes
    setPopUpVisible(false); // Then set popupVisible to false
  };

  const afterLayerFormModalCloseLayers = () => {
    setLayerPanelVisible(true);
    setPopUpVisible(layerPopupBefore); // After modal close set popupVisible to whatever it was before modal call
    getLayerSections();
    getZoomLayers();
  };

  const beforeModalOpen = () => {
    setLayerPanelVisible(false);
    setLayerPopupBefore(popUpVisible); // Store popupVisibile before value to call after modal closes
    setPopUpVisible(false); // Then set popupVisible to false
    setModalOpen(true);
  };

  const afterModalClose = () => {
    setLayerPanelVisible(true);
    setPopUpVisible(layerPopupBefore); // After modal close set popupVisible to whatever it was before modal call
    setModalOpen(false);
  };

  const afterModalCloseMaps = () => {
    afterModalClose();
    getMaps();
  };

  const displayPage = () => {
    if(pageCode === "spring24nitin") {
      sessionStorage.setItem("pageVisible", "true");
      setPageVisible(true);
    }
    else {
      alert("Incorrect code");
    }
  }





  return (
    <div id="app-body-main">
      {/* ---------------------------------------- HEADER ---------------------------------------- */}
      <div className="header" style={{height: "73px"}}>
        <a href="/" className="logo">
          <img
            id="logo-img-wide"
            src="/mapstructor_logo.png"
          />
        </a>

        <div id="header_text" className="headerText">
          <span id="headerTextSuffix" style={{fontSize: "24.3px"}}>| North America - Landowners</span>
        </div>

        <div className="header-right">
          {
            (currAuthToken == null || currAuthToken.length == 0)
            &&
            (<a
              className="encyclopedia" 
              // Changed login structure to now be in the same folder as the page
              href="./login" 
              target="_blank"
            >
              Sign In
              <img
                className="img2"
                height="18"
                src="https://encyclopedia.nahc-mapping.org/sites/default/files/inline-images/external_link_icon.png"
                width="18"
                style={{ marginLeft: "5px" }}
              />
            </a>)
          }
          {
            (currAuthToken != null && currAuthToken.length > 0)
            &&
            (<a 
              className="encyclopedia" 
              onClick={() => setInPreviewMode(!inPreviewMode)} 
              target="_blank"
            >
              {inPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            </a>)
          }
        </div>
      </div>





      {/* --------------------------------------- PASSWORD --------------------------------------- */}
      {!pageVisible && (
          <div
            style={{
              zIndex: "99999",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              textAlign: "center"}}
          >
            <h1>In order to view page, enter the code</h1>
            <input
              id="code-input"
              type="text"
              placeholder="code..."
              onChange={(e) => setPageCode(e.target.value)}
              style={{padding: "10px", fontSize: "16px", marginTop: "10px", border: "2px solid #333"}}
            />
            <button onClick={() => displayPage()} style={{padding: "10px", fontSize: "16px", marginTop: "10px", border: "2px solid #333", backgroundColor: "lightgray"}}>Submit</button>
          </div>
        )
      }





      {/* ---------------------------------------- LAYER PANEL ---------------------------------------- */}
      {pageVisible && (
        <>
          <button
            id="view-hide-layer-panel"
            className={layerPanelVisible ? "" : "translated"}
            onClick={() => {
              if (layerPanelVisible) {
                setLayerPanelVisible(false);
                setLayerPopupBefore(popUpVisible);
                setPopUpVisible(false);
              }
              else {
                setLayerPanelVisible(true);
                setPopUpVisible(layerPopupBefore);
              }
            }}
          >
            {
              layerPanelVisible
              ?
              (<span id="dir-txt" style={{fontSize: '13px'}}>&#9204;</span>)
              :
              (<span id="dir-txt">⏵</span>)
            }
          </button>

          <CSSTransition
            in={popUpVisible}
            timeout={500}
            classNames="popup"
            unmountOnExit
          >
            <SliderPopUp
              layerName={popUp.layerName}
              nid={popUp.nid}
              type={popUp.type}
            />
          </CSSTransition>

          <div id="studioMenu" className={layerPanelVisible ? "open" : "closed"}>
            <FontAwesomeIcon id="mobi-hide-sidebar" icon={faArrowCircleLeft} />
            <p className="title">LAYERS</p>
            <>
              {(currSectionLayers ?? []).map((secLayer, idx) => {
                return (
                  <ExpandableLayerGroupSection
                    key={"section-layer-component-" + idx}
                    inPreviewMode={inPreviewMode}
                    authToken={currAuthToken}
                    activeLayers={activeLayerIds}
                    activeLayerCallback={(newActiveLayers: string[]) => {
                      setActiveLayerIds(newActiveLayers);
                    }}
                    layersHeader={secLayer.label}
                    layer={secLayer}
                    afterSubmit={() => {
                      getLayerSections();
                    }}
                    beforeOpen={beforeLayerFormModalOpen}
                    afterClose={afterLayerFormModalCloseLayers}
                    openWindow={beforeModalOpen}
                    mapZoomCallback={(zoomProps: MapZoomProps) => {
                      if(zoomProps.bounds != null && (zoomProps.zoomToBounds ?? false)) {
                        currBeforeMap.current?.fitBounds(zoomProps.bounds, { bearing: zoomProps.bearing ?? 0});
                      }
                      else if (zoomProps.center) {
                        currBeforeMap.current?.easeTo({
                          center: zoomProps.center,
                          zoom: zoomProps.zoom,
                          bearing: zoomProps.bearing ?? 0,
                          speed: zoomProps.speed,
                          curve: zoomProps.curve,
                          duration: zoomProps.duration,
                          easing(t) {
                            return t;
                          },
                        });
                        if (zoomProps?.zoom != null && zoomProps?.center != null) {
                          router.push(`${pathname}/#${zoomProps.zoom.toFixed(2)}/${zoomProps.center[0].toFixed(6)}/${zoomProps.center[1].toFixed(6)}/${zoomProps.bearing?.toFixed(1) ?? 0}`);
                        }
                      }
                    }}
                    getLayerSectionsCallback={getLayerSections}
                    removeMapLayerCallback={(id: string) => removeMapLayerBothMaps(id)}
                  />
                );
              })}

              {!groupFormOpen && !inPreviewMode && (currAuthToken != null && currAuthToken.length > 0) &&
                (<div
                  style={{
                    paddingTop: "15px",
                    paddingLeft: "15px",
                    paddingRight: "10px",
                    textAlign: "center",
                  }}
                >
                  <button id="post-button" onClick={() => setGroupFormOpen(true)}>
                    <FontAwesomeIcon
                      icon={getFontawesomeIcon(
                        FontAwesomeLayerIcons.PLUS_SQUARE,
                        true
                      )}
                    ></FontAwesomeIcon>{" "}
                    New Group Folder
                  </button>
                </div>)
              }

              {groupFormOpen &&
                (<NewLayerSectionForm
                  authToken={currAuthToken}
                  afterSubmit={() => {
                    setGroupFormOpen(false);
                    getLayerSections();
                  }}
                  afterCancel={() => {
                    setGroupFormOpen(false);
                  }}
                ></NewLayerSectionForm>)
              }

              {!inPreviewMode && (currAuthToken != null && currAuthToken.length > 0) &&
                (<>
                  <p className="title">Layer Ordering</p>
                  <button
                    style={{
                      marginLeft: "100px",
                      marginBottom: "10px",
                      border: "2px solid",
                      padding: "5px",
                      borderRadius: "5px",
                    }}
                    onClick={() => openOrderingMenu()}
                  >
                    Expand/Collapse
                  </button>
                  {showLayerOrdering &&
                    layerOrder.map((row) => (
                      <div
                        className="row"
                        key={row.id}
                        style={{ display: "flex" }}
                      >
                        <FontAwesomeIcon
                          className="decrement-order"
                          title="up"
                          color="black"
                          icon={getFontawesomeIcon(
                            FontAwesomeLayerIcons.UP_ARROW
                          )}
                          onClick={() => moveLayerUp(row)}
                          style={{ paddingLeft: "6px" }}
                        />
                        <FontAwesomeIcon
                          className="increment-order"
                          title="down"
                          color="black"
                          icon={getFontawesomeIcon(
                            FontAwesomeLayerIcons.DOWN_ARROW
                          )}
                          onClick={() => moveLayerDown(row)}
                          style={{ paddingLeft: "6px" }}
                        />
                        <FontAwesomeIcon
                          icon={getFontawesomeIcon(parseFromString(row.iconType))}
                          style={{
                            color: row.iconColor,
                            paddingLeft: "6px",
                          }}
                        />

                        <div style={{ paddingLeft: "6px" }}>{row.label}</div>
                      </div>
                    ))
                  }
                </>)
              }
              <br />
              <p className="title"></p>
            </>
              


              
              
            {/* ---------------------------------------- MAPS PANEL ---------------------------------------- */}
            {beforeMapItem && hasDoneInitialZoom &&
              (<>
                <MapFilterWrapperComponent
                  inPreviewMode={inPreviewMode}
                  authToken={currAuthToken}
                  beforeOpen={beforeModalOpen}
                  zoomToWorld={() => {
                    zoomToWorld(currAfterMap);
                    zoomToWorld(currBeforeMap);
                  }}
                  afterClose={afterModalCloseMaps}
                  beforeMapCallback={(map: MapItem) => {
                    // Set beforeMap to selected map by changing the mapId
                    setMapStyle(currBeforeMap, map.styleId);
                  }}
                  afterMapCallback={(map: MapItem) => {
                    // Set afterMap to selected map by changing the mapId
                    setMapStyle(currAfterMap, map.styleId);
                  }}
                  defaultMap={{
                    ...beforeMapItem,
                    zoom: hashParams?.at(0) != null ? +(hashParams.at(0) ?? beforeMapItem.zoom) : beforeMapItem.zoom,
                    center:
                      [
                        hashParams?.at(1) != null
                        ? +(hashParams.at(1) ?? (beforeMapItem.center ? beforeMapItem.center[0] : 0))
                        : (beforeMapItem.center ? beforeMapItem.center[0] : 0),
                        hashParams?.at(2) != null
                        ? +(hashParams.at(2) ?? (beforeMapItem.center ? beforeMapItem.center[1] : 0))
                        : (beforeMapItem.center ? beforeMapItem.center[1] : 0),
                      ],
                    bearing: hashParams?.at(3) != null ? +(hashParams.at(3) ?? beforeMapItem.bearing) : beforeMapItem.bearing,
                    infoId: ''
                  }}
                  mapGroups={mappedFilterItemGroups}
                  mapZoomCallback={(zoomProps: MapZoomProps) => {
                    if(zoomProps.bounds != null && (zoomProps.zoomToBounds ?? false)) {
                      currBeforeMap.current?.fitBounds(zoomProps.bounds, { bearing: zoomProps.bearing ?? 0 });
                    }
                    else if (zoomProps.center) {
                      currBeforeMap.current?.easeTo({
                        center: zoomProps.center,
                        zoom: zoomProps.zoom,
                        speed: zoomProps.speed,
                        bearing: zoomProps.bearing ?? 0,
                        curve: zoomProps.curve,
                        duration: zoomProps.duration,
                        easing(t) {
                          return t;
                        },
                      });

                      if (zoomProps?.zoom != null && zoomProps?.center != null) {
                        router.push(`${pathname}/#${zoomProps.zoom.toFixed(2)}/${zoomProps.center[0].toFixed(6)}/${zoomProps.center[1].toFixed(6)}/${zoomProps.bearing?.toFixed(1) ?? 0}`);
                      }
                    }
                  }}
                />
                <br />
              </>
            )}
          </div>
        </>
      )}

        
        
        

      {/* ---------------------------------------- MAP ---------------------------------------- */}
      <MapboxCompareWrapper
        comparisonContainerRef={comparisonContainerRef}
        beforeMapContainerRef={beforeMapContainerRef}
        afterMapContainerRef={afterMapContainerRef}
        beforeMapRef={currBeforeMap}
        afterMapRef={currAfterMap}
      ></MapboxCompareWrapper>

      <div id="mobi-view-sidebar">
        <i className="fa fa-bars fa-2x"></i>
      </div>





      {/* ---------------------------------------- TIMELINE ---------------------------------------- */}
      {pageVisible && (
        <>
          <SliderWithDatePanel
            callback={(date: moment.Moment | null) => setCurrDate(date)}
          ></SliderWithDatePanel>

          <div id="loading">
            <i className="fa fa-sync fa-10x fa-spin" id="loading-icon"></i>
          </div>
        </>
      )}
    </div>
  );
}