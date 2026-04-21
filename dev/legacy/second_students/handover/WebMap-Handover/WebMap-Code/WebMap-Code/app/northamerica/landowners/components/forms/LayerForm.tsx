import { FieldArray, FormikProvider, useFormik } from "formik";
import { CSSProperties, useState } from "react";
import ColorPickerButton from "./color-picker/color-picker-button.component";
import { LayerData as PrismaLayer } from "@/prisma/generated_schema/NorthAmericaLandowners";
import PreviewIcon from "./preview-icon.component";

type LayerType =
    | "symbol"
    | "fill"
    | "line"
    | "circle"
    | "heatmap"
    | "fill-extrusion"
    | "raster"
    | "raster-particle"
    | "hillshade"
    | "model"
    | "background"
    | "sky"
    | "slot"
    | "clip";
type SourceType =
    | "vector"
    | "raster"
    | "raster-dem"
    | "raster-array"
    | "geojson"
    | "video"
    | "image"
    | "model"
    | "batched-model";

type LayerFormProps = {
  groupName: string;
  sectionName: string;
  layerConfig?: PrismaLayer;
  afterSubmit: () => void;
  authToken: string;
  standalone: boolean;
  topLayerClass?: string;
};

type ZoomLevel = { zoom: number; value: number };

export default function LayerForm(props: LayerFormProps) {
  const [submitType, setSubmitType] = useState<"POST" | "UPDATE" | "DELETE">();

  const parsedPaint = props.layerConfig?.paint
      ? JSON.parse(props.layerConfig.paint)
      : {};

  const parsedLayout = props.layerConfig?.layout
      ? JSON.parse(props.layerConfig.layout)
      : {};

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: props.layerConfig?.name ?? "",
      iconColor: props.layerConfig?.iconColor ?? "#000000",
      iconType: props.layerConfig?.iconType ?? "",
      label: props.layerConfig?.label ?? "",
      longitude: props.layerConfig?.longitude
          ? props.layerConfig.longitude
          : null,
      latitude: props.layerConfig?.latitude ? props.layerConfig.latitude : null,
      zoom: props.layerConfig?.zoom,
      bearing: props.layerConfig?.bearing,
      topLeftBoundLatitude: props.layerConfig?.topLeftBoundLatitude ?? null,
      topLeftBoundLongitude: props.layerConfig?.topLeftBoundLongitude ?? null,
      bottomRightBoundLatitude:
          props.layerConfig?.bottomRightBoundLatitude ?? null,
      bottomRightBoundLongitude:
          props.layerConfig?.bottomRightBoundLongitude ?? null,
      zoomToBounds: props.layerConfig?.zoomToBounds ?? false,
      enableByDefault: props.layerConfig?.enableByDefault ?? false,
      topLayerClass: props.topLayerClass ?? props.layerConfig?.topLayerClass ?? "",
      infoId: props.layerConfig?.infoId ?? "",
      type: props.layerConfig?.type ?? ("" as LayerType),
      sourceType: props.layerConfig?.sourceType ?? "",
      sourceUrl: props.layerConfig?.sourceUrl ?? "",
      sourceId: props.layerConfig?.sourceId ?? "",
      paint: props.layerConfig?.paint ?? "",
      sourceLayer: props.layerConfig?.sourceLayer ?? "",
      hover: props.layerConfig?.hover ?? false,
      click: props.layerConfig?.click ?? false,
      time: props.layerConfig?.time ?? false,
      hoverStyle: props.layerConfig?.hoverStyle ?? "",
      clickStyle: props.layerConfig?.clickStyle ?? "",
      clickHeader: props.layerConfig?.clickHeader ?? "",
      hoverContent: props.layerConfig?.hoverContent ?? [
        { label: "", type: "" },
      ],
      fillColor: parsedPaint["fill-color"] ?? "#e3ed58",
      fillOpacity: parsedPaint["fill-opacity"] ?? 0.5,
      fillOutlineColor: parsedPaint["fill-outline-color"] ?? "#FF0000",
      textColor: parsedPaint["text-color"] ?? "#000080",
      textHaloColor: parsedPaint["text-halo-color"] ?? "#ffffff",
      textHaloWidth: parsedPaint["text-halo-width"] ?? 2,
      circleColor: parsedPaint["circle-color"] ?? "#097911", // Default values
      circleOpacity: parsedPaint["circle-opacity"] ?? 1,
      circleRadius: parsedPaint["circle-radius"] ?? 5,
      circleStrokeColor: parsedPaint["circle-stroke-color"] ?? "#0000ee",
      circleStrokeWidth: parsedPaint["circle-stroke-width"] ?? 2,
      lineColor: parsedPaint["line-color"] ?? "#ff9900",
      lineWidth: parsedPaint["line-width"] ?? 5,
      lineBlur: parsedPaint["line-blur"] ?? 0,
      lineOpacity: parsedPaint["line-opacity"] ?? 1.0,
      textSizeDefault: parsedLayout["text-size"] ?? 12,
      useTextSizeZoomStyling: false, // Whether to use zoom-based text size
      useIconSizeZoomStyling: false, // Whether to use zoom-based icon size
      useLineZoomStyling: false,
      useFillZoomStyling: false,
      useCircleZoomStyling: false,

      iconSizeDefault: 0.5, // Default icon size
      zoomLevels: [
        { zoom: 6, value: 0 }, // Fully transparent when zoomed far out
        { zoom: 8, value: 0.3 }, // Partially visible at a moderately zoomed-out level
        { zoom: 12, value: 0.8 }, // Near fully visible when zoomed in
        { zoom: 15, value: 1 }, // Fully opaque at close zoom levels
      ], // Default for interpolation
      textZoomLevels:
          parsedLayout["text-size"] &&
          Array.isArray(parsedLayout["text-size"]) &&
          parsedLayout["text-size"][0] === "interpolate"
              ? parsedLayout["text-size"]
                  .slice(3) // Skip "interpolate", "linear", and "zoom" // Changed from 4 to 3 to include first stop (at index 3)
                  .reduce<ZoomLevel[]>((acc, curr, index, arr) => {
                    if (index % 2 === 0 && arr[index + 1] !== undefined) {
                      acc.push({
                        zoom: curr as number,
                        value: arr[index + 1] as number,
                      });
                    }
                    return acc;
                  }, [])
              : [
                { zoom: 6, value: 0 },
                { zoom: 8, value: 7 },
                { zoom: 15, value: 17 },
                { zoom: 20, value: 25 },
              ],

      circleRadiusZoomLevels:
          parsedPaint["circle-radius"] &&
          Array.isArray(parsedPaint["circle-radius"]) &&
          parsedPaint["circle-radius"][0] === "interpolate"
              ? parsedPaint["circle-radius"]
                  .slice(4)
                  .reduce((acc: any[], curr: any, index: number, arr: any[]) => {
                    if (index % 2 === 0)
                      acc.push({ zoom: curr, value: arr[index + 1] });
                    return acc;
                  }, [])
              : [
                { zoom: 6, value: 0 }, // Circles are invisible when zoomed far out
                { zoom: 10, value: 3 }, // Circles start to appear at a mid-zoom level
                { zoom: 14, value: 7 }, // Circles are medium-sized at higher zoom levels
                { zoom: 18, value: 12 },
              ], // Default for circle-radius interpolation
      lineWidthZoomLevels:
          parsedPaint["line-width"] &&
          Array.isArray(parsedPaint["line-width"]) &&
          parsedPaint["line-width"][0] === "interpolate"
              ? parsedPaint["line-width"]
                  .slice(3) // Changed from 4 to 3 to include the first stop (zoom level)
                  .reduce((acc: any[], curr: any, index: number, arr: any[]) => {
                    if (index % 2 === 0)
                      acc.push({ zoom: curr, value: arr[index + 1] });
                    return acc;
                  }, [])
              : [
                { zoom: 6, value: 0 },
                { zoom: 8, value: 0.5 },
                { zoom: 12, value: 1.5 },
                { zoom: 15, value: 2.5 },
              ],
      layout: {
        "text-field":
            (props.layerConfig?.layout as any)?.["text-field"] ?? "{name}",
        "text-size":
            (props.layerConfig?.layout as any)?.["text-size"] ??
            ((props.layerConfig as any)?.textZoomLevels?.length
                ? [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  ...(props.layerConfig as any).textZoomLevels.flatMap(
                      (level: any) => [level.zoom, level.value]
                  ),
                ]
                : (props.layerConfig as any)?.textSizeDefault ?? 12),
        "text-offset": (props.layerConfig?.layout as any)?.["text-offset"] ?? [
          0, 1,
        ],
        "icon-image": (props.layerConfig as any)?.layout?.["icon-image"] ?? "",
        "icon-size":
            (props.layerConfig as any)?.layout?.["icon-size"] ??
            ((props.layerConfig as any)?.zoomLevels?.length
                ? [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  ...(props.layerConfig as any).zoomLevels.flatMap(
                      (level: any) => [level.zoom, level.value]
                  ),
                ]
                : (props.layerConfig as any)?.iconSizeDefault ?? 0.5),
      },
      
      standalone: props.standalone ?? false,  //assigning the standalone as false default, but true if the form was filled from new standalone layer
    },

    onSubmit: async (values) => {
      console.log("Values before submission:", values);
      console.log("Standalone?", props.standalone);
      const paint: Record<string, any> = {};
      const layout: Record<string, any> = values.layout || {};

      if (values.type === "fill") {
        paint["fill-color"] = values.fillColor ?? "#e3ed58";
        // This was causing some new layers to not appear unless hovered over
        // Revert to the original if Nitin wants you to
        // By changing this, hovering over no longer makes the opacity increase (don't think that matters...)
        // 
        //   paint["fill-opacity"] = [
        //     "interpolate",
        //     ["linear"],
        //     ["zoom"],
        //     ...values.zoomLevels.flatMap((level) => [
        //       level.zoom,
        //       [
        //         "case",
        //         ["boolean", ["feature-state", "hover"], false],
        //         level.value + 0.3 < 1 ? level.value + 0.3 : 1,
        //         level.value,
        //       ],
        //     ]),
        //   ];
        paint["fill-opacity"] = values.fillOpacity ?? 0.5;
        paint["fill-outline-color"] = values.fillOutlineColor ?? "#FF0000";
      } else if (values.type === "symbol") {
        paint["text-color"] = values.textColor ?? "#000080";
        paint["text-halo-color"] = values.textHaloColor ?? "#ffffff";
        paint["text-halo-width"] = values.textHaloWidth ?? 2;

        layout["visibility"] = "visible";
        layout["text-font"] = ["Asap Medium"]; // Adjust font family as needed
        layout["text-field"] = values.layout["text-field"] ?? "{name}"; // Default text field
        layout["text-offset"] = values.layout["text-offset"] ?? [0, 0]; // Default text offset

        layout["text-size"] = values.useTextSizeZoomStyling
            ? [
              "interpolate",
              ["linear"],
              ["zoom"],
              ...values.textZoomLevels
                  .filter(
                      (level) =>
                          level.zoom !== null &&
                          level.zoom !== undefined &&
                          level.value !== null &&
                          level.value !== undefined
                  ) // Filter out invalid entries
                  .sort((a, b) => a.zoom - b.zoom) // Ensure ascending order
                  .flatMap((level) => [level.zoom, level.value]),
            ]
            : values.textSizeDefault ?? 12;

        console.log("Transformed layout['text-size']:", layout["text-size"]);

        layout["icon-image"] = values.layout["icon-image"] || "default-icon"; // Default icon name
        layout["icon-size"] = values.useIconSizeZoomStyling
            ? [
              "interpolate",
              ["linear"],
              ["zoom"],
              ...values.zoomLevels
                  .sort((a, b) => a.zoom - b.zoom) // Sort by ascending zoom levels
                  .flatMap((level) => [level.zoom, level.value]),
            ]
            : values.iconSizeDefault ?? 0.5;
      } else if (values.type === "circle") {
        paint["circle-color"] = values.circleColor ?? "#FF0000";
        paint["circle-opacity"] = [
          "interpolate",
          ["linear"],
          ["zoom"],
          ...values.zoomLevels.flatMap((level) => [
            level.zoom,
            ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 1],
          ]),
        ];
        paint["circle-radius"] = values.useCircleZoomStyling
            ? [
              "interpolate",
              ["linear"],
              ["zoom"],
              ...values.circleRadiusZoomLevels
                  .sort((a, b) => a.zoom - b.zoom) // Sort by ascending zoom levels
                  .flatMap((level) => [level.zoom, level.value]),
            ]
            : values.circleRadius ?? 5;
        paint["circle-stroke-color"] = values.circleStrokeColor ?? "#000000";
        paint["circle-stroke-width"] = values.circleStrokeWidth ?? 1;
        if (values.hover) {
          paint["circle-stroke-opacity"] = [
            "interpolate",
            ["linear"],
            ["zoom"],
            ...values.zoomLevels.flatMap((level) => [
              level.zoom,
              ["case", ["boolean", ["feature-state", "hover"], false], 1, 0],
            ]),
          ];
        } else {
          paint["circle-stroke-opacity"] = values.circleOpacity;
        }

        if (values.layout["icon-image"]) {
          layout["icon-image"] = values.layout["icon-image"]; // Use the user-provided icon key or URL
          layout["icon-size"] = 0.5; // Default icon size, can be dynamic
        }
      } else if (values.type === "line") {
        paint["line-color"] = values.lineColor ?? "#ff9900";
        paint["line-width"] = values.useLineZoomStyling
            ? [
              "interpolate",
              ["linear"],
              ["zoom"],
              ...values.lineWidthZoomLevels
                  .sort((a, b) => a.zoom - b.zoom) // Sort by ascending zoom levels
                  .flatMap((level) => [level.zoom, level.value]),
            ]
            : values.lineWidth ?? 5;
        paint["line-blur"] = values.lineBlur ?? 0;
        paint["line-opacity"] = values.lineOpacity ?? 1.0;
      }

      const source =
          values.sourceType === "geojson"
              ? { type: "geojson", data: values.sourceUrl }
              : { type: values.sourceType, url: values.sourceUrl };

      const layerData = {
        ...values,
        source,
        paint: JSON.stringify(paint),
        layout: JSON.stringify(layout),
      };

      console.log("Final layerData before API call:", layerData);
      /*
        Edits to the exisitng post method to pull 'standalone' from the props. When the New Standalone Layer button
        is selected, the layer standalone field is automatically populated with true. Otherwise false. 
        The edits to the below method allow the endpoint to discern if the layer is of standalone type or not
        and then call the correct post api method for pushing it to the database.
      */
      if (submitType === "POST") {
        try {
          const endpoint = props.standalone ? "/api/northamerica/landowners/StandaloneLayers" : "/api/northamerica/landowners/LayerData"
          await fetch(endpoint, {
            method: "POST",
            headers: {
              authorization: props.authToken ?? "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...layerData }),
          });
          alert("Layer added successfully");
          formik.resetForm();
          props.afterSubmit();
        } catch (error: any) {
          alert(`Error: ${error.message}`);
        }
      } else if (submitType === "UPDATE") {
        console.log("Inital stuff:" , { ...layerData });
        console.log("JSon String: ", JSON.stringify({...layerData}));
        if (props.layerConfig) {
          try {
            const response = await fetch("/api/northamerica/landowners/LayerData/" + props.layerConfig.id, {
              method: "PUT",
              headers: {
                authorization: props.authToken,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ...layerData }),
            });if (!response.ok) {
              let errorData;
              try {
                  errorData = await response.json();
              } catch (jsonError) {
                  console.error("Error parsing JSON response:", jsonError);
                  errorData = { message: "Unknown error occurred" };
              }
              console.error("Error updating layer:", errorData);
              alert(`Error: ${errorData.message}`);
          } else {
              alert(`Layer Updated`);
              props.afterSubmit();
          }
      } catch (error: any) {
            alert(`Error: ${error.message}`);
          }
        } else {
          alert(`Error: layerConfig unpopulated`);
        }
      } else if (submitType === "DELETE") {
        if (props.layerConfig) {
          try {
            await fetch("/api/northamerica/landowners/LayerData/" + props.layerConfig.id, {
              method: "DELETE",
              headers: {
                authorization: props.authToken ?? "",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ...layerData }),
            });
            alert(`Layer Deleted`);
            props.afterSubmit();
          } catch (error: any) {
            alert(`Error: ${error.message}`);
          }
        } else {
          alert(`Error: layerConfig unpopulated`);
        }
      }
    },
  });

  console.log("Initial Values:", formik.initialValues);

  const boxStyling: CSSProperties = {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "10px",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  };

  const checkboxStyling: CSSProperties = {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "20%",
    height: "25px",
    boxSizing: "border-box",
    cursor: "pointer",
  };

  const labelStyling: CSSProperties = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
    minWidth: "70px",
  };

  const buttonStyling: CSSProperties = {
    backgroundColor: "#007BFF",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  };

  const buttonHoverStyling: CSSProperties = {
    backgroundColor: "#0056b3",
  };

  const removeButtonStyle = {
    backgroundColor: "#DC143C",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const addButtonStyle = {
    backgroundColor: "green",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "15px",
  };

  return (
      <FormikProvider value={formik}>
        <form
            onSubmit={formik.handleSubmit}
            style={{ maxWidth: "400px", margin: "0 auto" }}
        >
          <h2
              style={{ paddingBottom: "8px", color: "#333", textAlign: "center" }}
          >
            {props.layerConfig ? (
                <strong>Edit {props.layerConfig.label}</strong>
            ) : (
                <strong>Add New Layer</strong>
            )}
          </h2>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="name" style={labelStyling}>
              Name:
            </label>
            <input
                type="text"
                id="name"
                name="name"
                onChange={formik.handleChange}
                value={formik.values.name}
                style={boxStyling}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="label" style={labelStyling}>
              Label:
            </label>
            <input
                type="text"
                id="label"
                name="label"
                onChange={formik.handleChange}
                value={formik.values.label}
                style={boxStyling}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="enableByDefault" style={labelStyling}>Enable By Default: </label>
            <input
                type="checkbox"
                id="enableByDefault"
                name="enableByDefault"
                onClick={() => formik.setFieldValue("enableByDefault", !formik.values.enableByDefault)}
                checked={formik.values.enableByDefault}
                style={checkboxStyling}
            />
          </div>
          {props.standalone && (
            <>
          {/*TODO: Possibly uncomment, or delete.  Need to confirm with Nitty this isn't needed anymore*/}
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyling}>Zoom Settings:</label>
            {/* <p>
              Longitude/Latitude are used to zoom to center, Bounds are used to
              zoom to bounds.
           </p> */}
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="longitude" style={labelStyling}>
              Longitude:
            </label>
            <input
                type="number"
                id="longitude"
                name="longitude"
                onChange={formik.handleChange}
                value={formik.values.longitude ?? undefined}
                style={boxStyling}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
           <label htmlFor="latitude" style={labelStyling}>
             Latitude:
           </label>
           <input
                type="number"
                id="latitude"
                name="latitude"
               onChange={formik.handleChange}
                value={formik.values.latitude ?? undefined}
                style={boxStyling}
            />
          </div>

          {/*<div style={{ marginBottom: "15px" }}>*/}
          {/*  <label htmlFor="topLeftBoundLatitude" style={labelStyling}>*/}
          {/*    West Bound:*/}
          {/*  </label>*/}
          {/*  <input*/}
          {/*      type="number"*/}
          {/*      id="topLeftBoundLatitude"*/}
          {/*      name="topLeftBoundLatitude"*/}
          {/*      onChange={formik.handleChange}*/}
          {/*      value={formik.values.topLeftBoundLatitude ?? undefined}*/}
          {/*      style={boxStyling}*/}
          {/*  />*/}
          {/*</div>*/}

          {/*<div style={{ marginBottom: "15px" }}>*/}
          {/*  <label htmlFor="topLeftBoundLongitude" style={labelStyling}>*/}
          {/*    South Bound:*/}
          {/*  </label>*/}
          {/*  <input*/}
          {/*      type="number"*/}
          {/*      id="topLeftBoundLongitude"*/}
          {/*      name="topLeftBoundLongitude"*/}
          {/*      onChange={formik.handleChange}*/}
          {/*      value={formik.values.topLeftBoundLongitude ?? undefined}*/}
          {/*      style={boxStyling}*/}
          {/*  />*/}
          {/*</div>*/}

          {/*<div style={{ marginBottom: "15px" }}>*/}
          {/*  <label htmlFor="bottomRightBoundLatitude" style={labelStyling}>*/}
          {/*    East Bound:*/}
          {/*  </label>*/}
          {/*  <input*/}
          {/*      type="number"*/}
          {/*      id="bottomRightBoundLatitude"*/}
          {/*      name="bottomRightBoundLatitude"*/}
          {/*      onChange={formik.handleChange}*/}
          {/*      value={formik.values.bottomRightBoundLatitude ?? undefined}*/}
          {/*      style={boxStyling}*/}
          {/*  />*/}
          {/*</div>*/}

          {/*<div style={{ marginBottom: "15px" }}>*/}
          {/*  <label htmlFor="bottomRightBoundLongitude" style={labelStyling}>*/}
          {/*    North Bound:*/}
          {/*  </label>*/}
          {/*  <input*/}
          {/*      type="number"*/}
          {/*      id="bottomRightBoundLongitude"*/}
          {/*      name="bottomRightBoundLongitude"*/}
          {/*      onChange={formik.handleChange}*/}
          {/*      value={formik.values.bottomRightBoundLongitude ?? undefined}*/}
          {/*      style={boxStyling}*/}
          {/*  />*/}
          {/*</div>*/}

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="zoom" style={labelStyling}>
              Zoom:
            </label>
            <input
                type="number"
                id="zoom"
                name="zoom"
                onChange={formik.handleChange}
                value={formik.values.zoom ?? undefined}
                style={boxStyling}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="bearing" style={labelStyling}>
              Bearing:
            </label>
            <input
                type="number"
                id="bearing"
                name="bearing"
                onChange={formik.handleChange}
                value={formik.values.bearing ?? undefined}
                style={boxStyling}
            />
          </div>

          {/*<div style={{ marginBottom: "30px" }}>*/}
          {/*  <label style={labelStyling}>Where Should This Zoom To?</label>*/}
          {/*  <label htmlFor="zoomToBounds" style={labelStyling}>*/}
          {/*    <input*/}
          {/*        type="radio"*/}
          {/*        id="zoomToBounds"*/}
          {/*        name="zoomToBounds"*/}
          {/*        onClick={() => formik.setFieldValue("zoomToBounds", true)}*/}
          {/*        checked={formik.values.zoomToBounds}*/}
          {/*        style={checkboxStyling}*/}
          {/*    />*/}
          {/*    Zoom to Bounds*/}
          {/*  </label>*/}
          {/*  <label htmlFor="zoomToBounds" style={labelStyling}>*/}
          {/*    <input*/}
          {/*        type="radio"*/}
          {/*        id="zoomToBounds"*/}
          {/*        name="zoomToBounds"*/}
          {/*        onClick={() => formik.setFieldValue("zoomToBounds", false)}*/}
          {/*        checked={!formik.values.zoomToBounds}*/}
          {/*        style={checkboxStyling}*/}
          {/*    />*/}
          {/*    Zoom to Center*/}
          {/*  </label>*/}
          {/*</div>*/}

          {/* Got rid of this cause I don't think we need to show this
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="topLayerClass" style={labelStyling}>Top Layer Class:</label>
        <input disabled type="text" id="topLayerClass" name="topLayerClass" onChange={formik.handleChange} value={formik.values.topLayerClass} style={boxStyling} />
      </div> */}
      </>
      )}

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="infoId" style={labelStyling}>
              Info ID:
            </label>
            <input
                type="text"
                id="infoId"
                name="infoId"
                onChange={formik.handleChange}
                value={formik.values.infoId}
                style={boxStyling}
            />
          </div>

          {/* Dropdown for Type */}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="type" style={labelStyling}>
              Layer Type:
            </label>
            <select
                id="type"
                name="type"
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                value={formik.values.type}
                style={boxStyling}
            >
              <option value="">Select Type</option>
              <option value="symbol">Symbol</option>
              <option value="fill">Fill</option>
              <option value="line">Line</option>
              <option value="circle">Circle</option>
              <option value="heatmap">Heatmap</option>
              <option value="fill-extrusion">Fill-Extrusion</option>
              <option value="raster">Raster</option>
              <option value="raster-particle">Raster-Particle</option>
              <option value="hillshade">Hillshade</option>
              <option value="model">Model</option>
              <option value="background">Background</option>
              <option value="sky">Sky</option>
              <option value="slot">Slot</option>
              <option value="clip">Clip</option>
            </select>
          </div>

          {formik.values.type === "fill" && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="fillColor" style={labelStyling}>
                    Fill Color:
                  </label>
                  <input
                      type="color"
                      id="fillColor"
                      name="fillColor"
                      onChange={formik.handleChange}
                      value={formik.values.fillColor}
                      style={{ ...boxStyling, padding: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="fillOpacity" style={labelStyling}>
                    Fill Opacity:
                  </label>
                  <input
                      type="number"
                      id="fillOpacity"
                      name="fillOpacity"
                      onChange={formik.handleChange}
                      value={formik.values.fillOpacity}
                      min="0"
                      max="1"
                      step="0.1"
                      style={boxStyling}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="fillOutlineColor" style={labelStyling}>
                    Fill Outline Color:
                  </label>
                  <input
                      type="color"
                      id="fillOutlineColor"
                      name="fillOutlineColor"
                      onChange={formik.handleChange}
                      value={formik.values.fillOutlineColor}
                      style={{ ...boxStyling, padding: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyling}>
                    Edit Zoom Levels for Fill Opacity:
                  </label>
                  <input
                      type="checkbox"
                      id="useFillZoomStyling"
                      name="useFillZoomStyling"
                      onChange={formik.handleChange}
                      checked={formik.values.useFillZoomStyling}
                      style={checkboxStyling}
                  />
                </div>
                {/* Zoom Level Inputs for fill-opacity */}
                {formik.values.useFillZoomStyling && (
                    <FieldArray
                        name="zoomLevels"
                        render={(arrayHelpers) => (
                            <div style={{ marginBottom: "15px" }}>
                              <label style={labelStyling}>
                                At Zoom
                                level:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                Fill Opacity is:{" "}
                              </label>
                              {formik.values.zoomLevels.map((zoomLevel, index) => (
                                  <div key={index} style={{ display: "flex", gap: "10px" }}>
                                    <input
                                        type="number"
                                        name={`zoomLevels[${index}].zoom`}
                                        placeholder="Zoom Level"
                                        onChange={formik.handleChange}
                                        value={zoomLevel.zoom}
                                        min="0"
                                        max="22"
                                        style={boxStyling}
                                    />
                                    <input
                                        type="number"
                                        name={`zoomLevels[${index}].value`}
                                        placeholder="Opacity"
                                        onChange={formik.handleChange}
                                        value={zoomLevel.value}
                                        min="0"
                                        style={boxStyling}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => arrayHelpers.remove(index)}
                                        style={{
                                          ...removeButtonStyle,
                                          marginTop: "6px",
                                          position: "relative",
                                          top: "-6px",
                                        }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                              ))}
                              <button
                                  type="button"
                                  onClick={() => arrayHelpers.push({ zoom: 0, value: 0 })}
                                  style={addButtonStyle}
                              >
                                Add New Zoom Level
                              </button>
                            </div>
                        )}
                    />
                )}
              </>
          )}

          {formik.values.type === "symbol" && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="textField" style={labelStyling}>
                    Text Field:
                  </label>
                  <select
                      id="textField"
                      name="layout.text-field"
                      onChange={(e) =>
                          formik.setFieldValue("layout.text-field", e.target.value)
                      }
                      value={formik.values.layout["text-field"]}
                      style={boxStyling}
                  >
                    <option value="{name}">Name</option>
                    <option value="{corr_label}">Corr Label</option>
                    <option value="{label}">Label</option>
                    <option value="{custom}">Custom</option>
                  </select>
                </div>
                {formik.values.layout["text-field"] === "{custom}" && (
                    <div style={{ marginBottom: "15px" }}>
                      <label htmlFor="customTextField" style={labelStyling}>
                        Custom Text Field:
                      </label>
                      <input
                          type="text"
                          id="customTextField"
                          name="layout.text-field"
                          onChange={(e) =>
                              formik.setFieldValue("layout.text-field", e.target.value)
                          }
                          value={formik.values.layout["text-field"]}
                          style={boxStyling}
                      />
                    </div>
                )}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="textColor" style={labelStyling}>
                    Text Color:
                  </label>
                  <input
                      type="color"
                      id="textColor"
                      name="textColor"
                      onChange={formik.handleChange}
                      value={formik.values.textColor}
                      style={{ ...boxStyling, padding: "5px" }}
                  />
                </div>
                {/* Default Text Size */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="textSizeDefault" style={labelStyling}>
                    Text Size:
                  </label>
                  <input
                      type="number"
                      id="textSizeDefault"
                      name="textSizeDefault"
                      onChange={formik.handleChange}
                      value={formik.values.textSizeDefault}
                      min="0"
                      step="0.1"
                      style={boxStyling}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="text-offset" style={labelStyling}>
                    Text Offset:
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="number"
                        name="layout.text-offset[0]"
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => {
                          if (e.target.value === "") e.target.placeholder = "X Value";
                        }}
                        onChange={(e) =>
                            formik.setFieldValue("layout.text-offset", [
                              e.target.value === "" ? "" : parseFloat(e.target.value),
                              formik.values.layout["text-offset"]?.[1] ?? "",
                            ])
                        }
                        value={
                          formik.values.layout["text-offset"]?.[0] === undefined ||
                          formik.values.layout["text-offset"]?.[0] === null
                              ? ""
                              : formik.values.layout["text-offset"]?.[0]
                        }
                        placeholder="X Value"
                        style={boxStyling}
                    />
                    <input
                        type="number"
                        name="layout.text-offset[1]"
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => {
                          if (e.target.value === "") e.target.placeholder = "Y Value";
                        }}
                        onChange={(e) =>
                            formik.setFieldValue("layout.text-offset", [
                              formik.values.layout["text-offset"]?.[0] ?? "",
                              e.target.value === "" ? "" : parseFloat(e.target.value),
                            ])
                        }
                        value={
                          formik.values.layout["text-offset"]?.[1] === undefined ||
                          formik.values.layout["text-offset"]?.[1] === null
                              ? ""
                              : formik.values.layout["text-offset"]?.[1]
                        }
                        placeholder="Y Value"
                        style={boxStyling}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="textHaloColor" style={labelStyling}>
                    Text Halo Color:
                  </label>
                  <input
                      type="color"
                      id="textHaloColor"
                      name="textHaloColor"
                      onChange={formik.handleChange}
                      value={formik.values.textHaloColor}
                      style={{ ...boxStyling, padding: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="textHaloWidth" style={labelStyling}>
                    Text Halo Width:
                  </label>
                  <input
                      type="number"
                      id="textHaloWidth"
                      name="textHaloWidth"
                      onChange={formik.handleChange}
                      value={formik.values.textHaloWidth}
                      min="0"
                      max="10"
                      step="0.5"
                      style={boxStyling}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="iconImage" style={labelStyling}>
                    Icon Image:
                  </label>
                  <select
                      id="iconImage"
                      name="iconImage"
                      onChange={formik.handleChange}
                      // value={formik.values.iconImage}
                      style={boxStyling}
                  >
                    <option value="">Select Icon</option>
                    <option value="info_points_image">Info Points</option>
                    <option value="custom-marker">Custom Marker</option>
                    <option value="another-icon">Another Icon</option>
                    {/* Add more predefined icons as needed */}
                  </select>
                </div>{" "}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="customIconImage" style={labelStyling}>
                    Or Custom Icon URL:
                  </label>
                  <input
                      type="text"
                      id="customIconImage"
                      name="customIconImage"
                      placeholder="Enter custom URL"
                      onChange={
                        (e) => formik.setFieldValue("iconImage", e.target.value) // Override iconImage
                      }
                      style={boxStyling}
                  />
                </div>
                {/* Use Zoom Styling for Text Size */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyling}>Use Zoom Levels for Text Size:</label>
                  <input
                      type="checkbox"
                      id="useTextSizeZoomStyling"
                      name="useTextSizeZoomStyling"
                      onChange={formik.handleChange}
                      checked={formik.values.useTextSizeZoomStyling}
                      style={checkboxStyling}
                  />
                </div>
                {/* Text Size Stops */}
                {formik.values.useTextSizeZoomStyling && (
                    <FieldArray
                        name="textZoomLevels"
                        render={(arrayHelpers) => {
                          console.log(
                              "Current textZoomLevels:",
                              formik.values.textZoomLevels
                          );
                          return (
                              <div style={{ marginBottom: "15px" }}>
                                <label style={labelStyling}>
                                  Zoom
                                  level&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                  Text Size
                                </label>
                                {formik.values.textZoomLevels.map((level, index) => (
                                    <div
                                        key={index}
                                        style={{ display: "flex", gap: "10px" }}
                                    >
                                      <input
                                          type="number"
                                          name={`textZoomLevels[${index}].zoom`}
                                          placeholder="Zoom"
                                          onChange={formik.handleChange}
                                          value={level.zoom ?? ""}
                                          min="0"
                                          max="22"
                                          style={boxStyling}
                                      />
                                      <input
                                          type="number"
                                          name={`textZoomLevels[${index}].value`}
                                          placeholder="Text Size"
                                          onChange={formik.handleChange}
                                          value={level.value ?? ""}
                                          min="0"
                                          step="0.1"
                                          style={boxStyling}
                                      />
                                      <button
                                          type="button"
                                          onClick={() => arrayHelpers.remove(index)}
                                          style={{
                                            ...removeButtonStyle,
                                            marginTop: "6px",
                                            position: "relative",
                                            top: "-6px",
                                          }}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => arrayHelpers.push({ zoom: 0, value: 0 })}
                                    style={addButtonStyle}
                                >
                                  Add New Zoom Level
                                </button>
                              </div>
                          );
                        }}
                    />
                )}
                {/* Use Zoom Styling for Icon Size
            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyling}>
                Use Zoom Levels for Icon Size:
              </label>
              <input
                type="checkbox"
                id="useIconSizeZoomStyling"
                name="useIconSizeZoomStyling"
                onChange={formik.handleChange}
                checked={formik.values.useIconSizeZoomStyling}
                style={checkboxStyling}
              />
            </div> */}
                {/* Default Icon Size
            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="iconSizeDefault" style={labelStyling}>
                Default Icon Size:
              </label>
              <input
                type="number"
                id="iconSizeDefault"
                name="iconSizeDefault"
                onChange={formik.handleChange}
                value={formik.values.iconSizeDefault}
                min="0"
                step="0.1"
                style={boxStyling}
              />
            </div> */}
                {/* Icon Size Stops */}
                {formik.values.useIconSizeZoomStyling && (
                    <FieldArray
                        name="zoomLevels"
                        render={(arrayHelpers) => (
                            <div style={{ marginBottom: "15px" }}>
                              <label style={labelStyling}>Icon Size Stops:</label>
                              {formik.values.zoomLevels.map((level, index) => (
                                  <div key={index} style={{ display: "flex", gap: "10px" }}>
                                    <input
                                        type="number"
                                        name={`zoomLevels[${index}].zoom`}
                                        placeholder="Zoom"
                                        onChange={formik.handleChange}
                                        value={level.zoom}
                                        min="0"
                                        max="22"
                                        style={boxStyling}
                                    />
                                    <input
                                        type="number"
                                        name={`zoomLevels[${index}].value`}
                                        placeholder="Icon Size"
                                        onChange={formik.handleChange}
                                        value={level.value}
                                        min="0"
                                        step="0.1"
                                        style={boxStyling}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => arrayHelpers.remove(index)}
                                        style={removeButtonStyle}
                                    >
                                      Remove
                                    </button>
                                  </div>
                              ))}
                              <button
                                  type="button"
                                  onClick={() => arrayHelpers.push({ zoom: 0, value: 0 })}
                                  style={addButtonStyle}
                              >
                                Add New Zoom Level
                              </button>
                            </div>
                        )}
                    />
                )}
              </>
          )}

          {formik.values.type === "circle" && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="circleRadius" style={labelStyling}>
                    Circle Radius:
                  </label>
                  <input
                      type="number"
                      id="circleRadius"
                      name="circleRadius"
                      onChange={formik.handleChange}
                      value={formik.values.circleRadius}
                      min="0"
                      style={boxStyling}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="circleColor" style={labelStyling}>
                    Circle Color:
                  </label>
                  <input
                      type="color"
                      id="circleColor"
                      name="circleColor"
                      onChange={formik.handleChange}
                      value={formik.values.circleColor}
                      style={{ ...boxStyling, padding: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="circleOpacity" style={labelStyling}>
                    Circle Opacity:
                  </label>
                  <input
                      type="number"
                      id="circleOpacity"
                      name="circleOpacity"
                      onChange={formik.handleChange}
                      value={formik.values.circleOpacity}
                      min="0"
                      max="1"
                      step="0.1"
                      style={boxStyling}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="circleStrokeColor" style={labelStyling}>
                    Circle Stroke Color:
                  </label>
                  <input
                      type="color"
                      id="circleStrokeColor"
                      name="circleStrokeColor"
                      onChange={formik.handleChange}
                      value={formik.values.circleStrokeColor}
                      style={{ ...boxStyling, padding: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="circleStrokeWidth" style={labelStyling}>
                    Circle Stroke Width:
                  </label>
                  <input
                      type="number"
                      id="circleStrokeWidth"
                      name="circleStrokeWidth"
                      onChange={formik.handleChange}
                      value={formik.values.circleStrokeWidth}
                      min="0"
                      style={boxStyling}
                  />
                </div>

                {/* Checkbox to toggle zoom levels */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyling}>
                    Use Zoom Levels for Circle Styling:
                  </label>
                  <input
                      type="checkbox"
                      id="useCircleZoomStyling"
                      name="useCircleZoomStyling"
                      onChange={formik.handleChange}
                      checked={formik.values.useCircleZoomStyling}
                      style={checkboxStyling}
                  />
                </div>

                {/* Conditional rendering based on the checkbox */}
                {formik.values.useCircleZoomStyling && (
                    <>
                      {/* Circle Opacity Zoom Levels */}
                      <div style={{ marginBottom: "15px" }}>
                        <label style={labelStyling}>
                          At Zoom
                          level:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          Circle Opacity is:{" "}
                        </label>
                        <FieldArray
                            name="zoomLevels"
                            render={(arrayHelpers) => (
                                <div>
                                  {formik.values.zoomLevels.map((zoomLevel, index) => (
                                      <div
                                          key={index}
                                          style={{
                                            display: "flex",
                                            gap: "10px",
                                            marginBottom: "10px",
                                          }}
                                      >
                                        <input
                                            type="number"
                                            placeholder="Zoom"
                                            value={zoomLevel.zoom}
                                            onChange={(e) =>
                                                arrayHelpers.replace(index, {
                                                  ...zoomLevel,
                                                  zoom: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            style={{ ...boxStyling, width: "50%" }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Opacity"
                                            value={zoomLevel.value}
                                            onChange={(e) =>
                                                arrayHelpers.replace(index, {
                                                  ...zoomLevel,
                                                  value: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            style={{ ...boxStyling, width: "50%" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => arrayHelpers.remove(index)}
                                            style={{
                                              ...removeButtonStyle,
                                              marginTop: "5px",
                                              position: "relative",
                                              top: "-6px",
                                            }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                  ))}
                                  <button
                                      type="button"
                                      onClick={() =>
                                          arrayHelpers.push({ zoom: 0, value: 0 })
                                      }
                                      style={addButtonStyle}
                                  >
                                    Add New Zoom Level
                                  </button>
                                </div>
                            )}
                        />
                      </div>

                      {/* Circle Radius Zoom Levels */}
                      <div style={{ marginBottom: "15px" }}>
                        <label style={labelStyling}>
                          At Zoom
                          level:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          Circle Radius is:{" "}
                        </label>
                        <FieldArray
                            name="circleRadiusZoomLevels"
                            render={(arrayHelpers) => (
                                <div>
                                  {formik.values.circleRadiusZoomLevels?.map(
                                      (zoomLevel, index) => (
                                          <div
                                              key={index}
                                              style={{
                                                display: "flex",
                                                gap: "10px",
                                                marginBottom: "10px",
                                              }}
                                          >
                                            <input
                                                type="number"
                                                placeholder="Zoom"
                                                value={zoomLevel.zoom}
                                                onChange={(e) =>
                                                    arrayHelpers.replace(index, {
                                                      ...zoomLevel,
                                                      zoom: parseFloat(e.target.value) || 0,
                                                    })
                                                }
                                                style={{ ...boxStyling, width: "50%" }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Radius"
                                                value={zoomLevel.value}
                                                onChange={(e) =>
                                                    arrayHelpers.replace(index, {
                                                      ...zoomLevel,
                                                      value: parseFloat(e.target.value) || 0,
                                                    })
                                                }
                                                style={{ ...boxStyling, width: "50%" }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => arrayHelpers.remove(index)}
                                                style={{
                                                  ...removeButtonStyle,
                                                  marginTop: "5px",
                                                  position: "relative",
                                                  top: "-6px",
                                                }}
                                            >
                                              Remove
                                            </button>
                                          </div>
                                      )
                                  )}
                                  <button
                                      type="button"
                                      onClick={() =>
                                          arrayHelpers.push({ zoom: 0, value: 0 })
                                      }
                                      style={addButtonStyle}
                                  >
                                    Add New Zoom Level
                                  </button>
                                </div>
                            )}
                        />
                      </div>
                    </>
                )}
              </>
          )}

          {formik.values.type === "line" && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="lineColor" style={labelStyling}>
                    Line Color:
                  </label>
                  <input
                      type="color"
                      id="lineColor"
                      name="lineColor"
                      onChange={formik.handleChange}
                      value={formik.values.lineColor}
                      style={{ ...boxStyling, padding: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="lineWidth" style={labelStyling}>
                    Line Width:
                  </label>
                  <input
                      type="number"
                      id="lineWidth"
                      name="lineWidth"
                      onChange={formik.handleChange}
                      value={formik.values.lineWidth}
                      min="0"
                      step="0.1"
                      style={boxStyling}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="lineOpacity" style={labelStyling}>
                    Line Opacity:
                  </label>
                  <input
                      type="number"
                      id="lineOpacity"
                      name="lineOpacity"
                      onChange={formik.handleChange}
                      value={formik.values.lineOpacity}
                      min="0"
                      max="1"
                      step="0.1"
                      style={boxStyling}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="lineBlur" style={labelStyling}>
                    Line Blur:
                  </label>
                  <input
                      type="number"
                      id="lineBlur"
                      name="lineBlur"
                      onChange={formik.handleChange}
                      value={formik.values.lineBlur}
                      min="0"
                      style={boxStyling}
                  />
                </div>

                {/* Checkbox to enable/disable interpolation of zoom level to line width */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyling}>
                    Use Zoom Levels for Line Width:
                  </label>
                  <input
                      type="checkbox"
                      id="useLineZoomStyling"
                      name="useLineZoomStyling"
                      onChange={formik.handleChange}
                      checked={formik.values.useLineZoomStyling} // This will be unchecked when the form is open because the default value is false
                      style={checkboxStyling}
                  />
                </div>

                {/* Zoom Level Inputs for line-width */}
                {formik.values.useLineZoomStyling && (
                    <div style={{ marginBottom: "15px" }}>
                      <label htmlFor="lineWidthZoomLevels" style={labelStyling}>
                        Zoom Level to Line Width in Pixels:
                      </label>
                      <FieldArray
                          name="lineWidthZoomLevels"
                          render={(arrayHelpers) => (
                              <div>
                                {formik.values.lineWidthZoomLevels.map((level, index) => (
                                    <div
                                        key={index}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "10px",
                                          marginBottom: "10px",
                                        }}
                                    >
                                      <input
                                          type="number"
                                          id={`lineWidthZoomLevels.${index}.zoom`}
                                          name={`lineWidthZoomLevels.${index}.zoom`}
                                          onChange={formik.handleChange}
                                          value={level.zoom}
                                          placeholder="Zoom Level"
                                          style={boxStyling}
                                      />
                                      <input
                                          type="number"
                                          id={`lineWidthZoomLevels.${index}.value`}
                                          name={`lineWidthZoomLevels.${index}.value`}
                                          onChange={formik.handleChange}
                                          value={level.value}
                                          placeholder="Line Width"
                                          style={boxStyling}
                                      />
                                      <button
                                          type="button"
                                          onClick={() => arrayHelpers.remove(index)}
                                          style={{
                                            ...removeButtonStyle,
                                            marginTop: "6px",
                                            position: "relative",
                                            top: "-8px",
                                          }}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => arrayHelpers.push({ zoom: 0, value: 0 })}
                                    style={addButtonStyle} // Using shared style
                                >
                                  Add New Zoom Level
                                </button>
                              </div>
                          )}
                      />
                    </div>
                )}
              </>
          )}

          {/* Dropdown for Source Type */}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="sourceType" style={labelStyling}>
              Source Type:
            </label>
            <select
                id="sourceType"
                name="sourceType"
                onChange={formik.handleChange}
                value={formik.values.sourceType}
                style={boxStyling}
            >
              <option value="">Select Source Type</option>
              <option value="vector">Vector</option>
              <option value="raster">Raster</option>
              <option value="raster-dem">Raster-DEM</option>
              <option value="raster-array">Raster-Array</option>
              <option value="geojson">GeoJSON</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="model">Model</option>
              <option value="batched-model">Batched-Model</option>
            </select>
          </div>

          {/* Source URL input (conditionally labeled) */}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="sourceUrl" style={labelStyling}>
              {formik.values.sourceType === "geojson"
                  ? "GeoJSON Data URL:"
                  : "Source URL:"}
            </label>
            <input
                type="text"
                id="sourceUrl"
                name="sourceUrl"
                onChange={formik.handleChange}
                value={formik.values.sourceUrl}
                placeholder={`Enter ${
                    formik.values.sourceType === "geojson"
                        ? "GeoJSON data URL"
                        : "source URL"
                }`}
                style={boxStyling}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="sourceId" style={labelStyling}>
              Source ID:
            </label>
            <input
                type="text"
                id="sourceId"
                name="sourceId"
                onChange={formik.handleChange}
                value={formik.values.sourceId}
                style={boxStyling}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="sourceLayer" style={labelStyling}>
              Source Layer:
            </label>
            <input
                type="text"
                id="sourceLayer"
                name="sourceLayer"
                onChange={formik.handleChange}
                value={formik.values.sourceLayer}
                style={boxStyling}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="iconColor" style={labelStyling}>
              Icon Color:
            </label>
            <div id="iconColor">
              <input
                  type="color"
                  id="iconColor"
                  name="iconColor"
                  onChange={formik.handleChange}
                  value={formik.values.iconColor}
                  style={{ ...boxStyling, padding: "5px" }}
              />
            </div>

            <label htmlFor="iconType" style={labelStyling}>
              Icon Type:
            </label>
            <select
                id="iconType"
                name="iconType"
                onChange={formik.handleChange}
                value={formik.values.iconType}
                style={boxStyling}
            >
              <option value="">Select Icon Type</option>
              <option value="dots">Dots</option>
              <option value="info-circle">Info Circle</option>
              <option value="line">Line</option>
              <option value="square">Square</option>
              <option value="plus-square">Plus Square</option>
              <option value="minus-square">Minus Square</option>
              <option value="circle">Circle</option>
              <option value="play-circle">Play Circle</option>
              <option value="solid-labels">Solid Labels</option>
              <option value="solid-square">Solid Square</option>
            </select>

            {formik.values.iconColor && formik.values.iconType && (
                <>
                  <p>Result: </p>
                  <PreviewIcon
                      iconType={formik.values.iconType}
                      color={formik.values.iconColor}
                  ></PreviewIcon>
                </>
            )}
          </div>

          <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
          >
            <label htmlFor="hover" style={labelStyling}>
              Hover:
            </label>
            <input
                type="checkbox"
                id="hover"
                name="hover"
                onChange={formik.handleChange}
                checked={formik.values.hover}
                style={checkboxStyling}
            />
          </div>

          {formik.values.hover && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="newGroupLabel" style={labelStyling}>
                    Hover Popup Style:
                  </label>
                  <select
                      id="hoverStyle"
                      name="hoverStyle"
                      onChange={formik.handleChange}
                      value={formik.values.hoverStyle}
                      style={boxStyling}
                  >
                    <option value="">Select Color</option>
                    <option value="yellow">Yellow</option>
                    <option value="orange">Orange</option>
                    <option value="light-red">Light Red</option>
                    <option value="red">Red</option>
                    <option value="light-green">Light Green</option>
                    <option value="green">Green</option>
                    <option value="light-blue">Light Blue</option>
                    <option value="blue">Blue</option>
                    <option value="light-purple">Light Purple</option>
                    <option value="purple">Purple</option>
                    <option value="white">White</option>
                    <option value="light-grey">Light Grey</option>
                    <option value="grey">Grey</option>
                  </select>
                </div>
                <FieldArray
                    name="hoverContent"
                    render={(arrayHelpers) => (
                        <div style={{ marginBottom: "15px" }}>
                          {formik.values.hoverContent.map((item, index) => (
                              <div
                                  key={index}
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                  }}
                              >
                                <label
                                    htmlFor={`label${index}`}
                                    style={{
                                      display: "block",
                                      marginBottom: "5px",
                                      fontWeight: "bold",
                                      color: "#333",
                                    }}
                                >
                                  Label:
                                </label>
                                <input
                                    type="text"
                                    id={`hoverContent.${index}.label`}
                                    name={`hoverContent.${index}.label`}
                                    onChange={formik.handleChange}
                                    value={item.label}
                                    style={boxStyling}
                                />

                                <label
                                    htmlFor={`type${index}`}
                                    style={{
                                      display: "block",
                                      marginBottom: "5px",
                                      fontWeight: "bold",
                                      color: "#333",
                                    }}
                                >
                                  Type:
                                </label>
                                <select
                                    id={`hoverContent.${index}.type`}
                                    name={`hoverContent.${index}.type`}
                                    onChange={formik.handleChange}
                                    value={item.type}
                                    style={boxStyling}
                                >
                                  <option value="">Select Type</option>
                                  <option value="NAME">Name</option>
                                  <option value="LOT">Lot</option>
                                  <option value="DATE-START">Start Date</option>
                                  <option value="DATE-END">End Date</option>
                                  <option value="ADDRESS">Address</option>
                                </select>

                                {/* Button to remove this item */}
                                <button
                                    type="button"
                                    onClick={() => arrayHelpers.remove(index)}
                                    style={{
                                      marginBottom: "10px",
                                      padding: "8px",
                                      display: "flex",
                                      backgroundColor: "#e22222",
                                      color: "white",
                                      borderRadius: "4px",
                                      fontSize: "30px",
                                      height: "40px",
                                      width: "40px",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                >
                                  &times;
                                </button>
                              </div>
                          ))}
                          <button
                              type="button"
                              onClick={() => arrayHelpers.push({ label: "", type: "" })}
                              style={{
                                padding: "8px",
                                backgroundColor: "#008000",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                          >
                            New Popup Field
                          </button>
                        </div>
                    )}
                />
              </>
          )}

          <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
          >
            <label htmlFor="click" style={labelStyling}>
              Click:
            </label>
            <input
                type="checkbox"
                id="click"
                name="click"
                onChange={formik.handleChange}
                checked={formik.values.click}
                style={checkboxStyling}
            />
          </div>

          {formik.values.click && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="newGroupLabel" style={labelStyling}>
                    Click Popup Style:
                  </label>
                  <select
                      id="clickStyle"
                      name="clickStyle"
                      onChange={formik.handleChange}
                      value={formik.values.clickStyle}
                      style={boxStyling}
                  >
                    <option value="">Select Color</option>
                    <option value="yellow">Yellow</option>
                    <option value="orange">Orange</option>
                    <option value="light-red">Light Red</option>
                    <option value="red">Red</option>
                    <option value="light-green">Light Green</option>
                    <option value="green">Green</option>
                    <option value="light-blue">Light Blue</option>
                    <option value="blue">Blue</option>
                    <option value="light-purple">Light Purple</option>
                    <option value="purple">Purple</option>
                    <option value="white">White</option>
                    <option value="light-grey">Light Grey</option>
                    <option value="grey">Grey</option>
                  </select>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="newGroupName" style={labelStyling}>
                    Click Popup Header Label:
                  </label>
                  <input
                      type="text"
                      id="clickHeader"
                      name="clickHeader"
                      onChange={formik.handleChange}
                      value={formik.values.clickHeader}
                      style={boxStyling}
                  />
                </div>
              </>
          )}

          <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
          >
            <label htmlFor="time" style={labelStyling}>
              Time:
            </label>
            <input
                type="checkbox"
                id="time"
                name="time"
                onChange={formik.handleChange}
                checked={formik.values.time}
                style={checkboxStyling}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {props.layerConfig ? (
                <>
                  <button
                      style={buttonStyling}
                      onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                              buttonHoverStyling.backgroundColor!)
                      }
                      onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                              buttonStyling.backgroundColor!)
                      }
                      onClick={async (e) => {
                        e.preventDefault();
                        setSubmitType("UPDATE");
                        await formik.submitForm();
                      }}
                  >
                    Update
                  </button>
                  <button
                      style={{
                        backgroundColor: "#a40000",
                        color: "white",
                        padding: "10px 15px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontFamily: "Arial, sans-serif",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#850000")
                      }
                      onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#a40000")
                      }
                      onClick={async (e) => {
                        e.preventDefault();
                        setSubmitType("DELETE");
                        await formik.submitForm();
                      }}
                  >
                    Delete Layer
                  </button>
                </>
            ) : (
                <>
                  <button
                      style={buttonStyling}
                      onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                              buttonHoverStyling.backgroundColor!)
                      }
                      onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                              buttonStyling.backgroundColor!)
                      }
                      onClick={async (e) => {
                        e.preventDefault();
                        setSubmitType("POST");
                        await formik.submitForm();
                      }}
                  >
                    Submit
                  </button>
                </>
            )}
          </div>
        </form>
      </FormikProvider>
  );
}
