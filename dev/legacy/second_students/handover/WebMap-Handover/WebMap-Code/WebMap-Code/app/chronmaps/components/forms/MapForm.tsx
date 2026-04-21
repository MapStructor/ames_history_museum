import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { CSSProperties } from 'react';
import { Map as PrismaMap } from "@/prisma/generated_schema/chronmaps";


type MapFormProps = {
  authToken: string,
  mapConfig?: PrismaMap,
  groupName: string,
  afterSubmit: () => void,
}
const MapForm = (props: MapFormProps) => {
  const [submitType, setSubmitType] = useState<"POST" | "UPDATE" | "DELETE">();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      longitude:                      props.mapConfig?.longitude ?? undefined,
      latitude:                       props.mapConfig?.latitude ?? undefined,
      mapId:                          props.mapConfig?.mapId ?? '',
      mapName:                        props.mapConfig?.mapName ?? '',
      groupId:                        props.groupName,
      zoom:                           props.mapConfig?.zoom ?? 0,
      bearing:                        props.mapConfig?.bearing ?? 0,
      topLeftBoundLatitude:           props.mapConfig?.topLeftBoundLatitude ?? undefined,
      topLeftBoundLongitude:          props.mapConfig?.topLeftBoundLongitude ?? undefined,
      bottomRightBoundLatitude:       props.mapConfig?.bottomRightBoundLatitude ?? undefined,
      bottomRightBoundLongitude:      props.mapConfig?.bottomRightBoundLongitude ?? undefined,
      zoomToBounds:                   props.mapConfig?.zoomToBounds ?? false,
      styleId:                        props.mapConfig?.styleId ?? '',
      infoId:                         props.mapConfig?.infoId ?? '',
    },
    
    onSubmit: async (values) => {
      if(values.mapName?.length > 0) {
        if(submitType === "POST")
            {
              try 
              {
                await fetch('/api/chronmaps/map', {
                  method: 'POST',
                  headers: {
                    'authorization': props.authToken ?? '',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(values),
                });
                alert('Map added successfully');
                formik.resetForm();
                props.afterSubmit();
              } 
              catch (error: any) 
              {
                alert(`Error: ${error.message}`);
              }
            }
            else if(submitType === "UPDATE")
            {
              if(props.mapConfig)
              {
                try
                {
                  await fetch('/api/chronmaps/map/' + props.mapConfig.id, {
                    method: 'PUT',
                    headers: {
                        'authorization': props.authToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values)
                  });
                  alert(`Map Updated`);
                  props.afterSubmit();
                }
                catch (error: any)
                {
                  alert(`Error: ${error.message}`);
                }
              }
              else
              {
                alert(`Error: mapGroup unpopulated`);
              }
            }
            else if(submitType === "DELETE")
            {
              if(props.mapConfig)
                {
                  try
                  {
                    await fetch('/api/chronmaps/map/' + props.mapConfig.id, {
                      method: 'DELETE',
                      headers: {
                        'authorization': props.authToken,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(values)
                    });
                    alert(`Map Deleted`);
                    props.afterSubmit();
                  }
                  catch (error: any)
                  {
                    alert(`Error: ${error.message}`);
                  }
                }
                else
                {
                  alert(`Error: mapGroup unpopulated`);
                }
            }
        }
    },
  });

  const boxStyling: CSSProperties = {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '10px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px'
};

const labelStyling: CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
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

const buttonStyling: CSSProperties = {
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px'
};

const buttonHoverStyling: CSSProperties = {
    backgroundColor: '#0056b3'
};

return (
    <form onSubmit={formik.handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2
          style={{ paddingBottom: "8px", color: "#333", textAlign: "center" }}
        >
          {props.mapConfig ? (
              <strong>Edit {props.mapConfig.mapName}</strong>
            ) : (
              <strong>Add New Map</strong>
            )}
        </h2>
        
        <div style={{ marginBottom: '15px' }}>
            <label htmlFor="mapName" style={labelStyling}>Name:</label>
            <input type="text" id="mapName" name="mapName" onChange={formik.handleChange} value={formik.values.mapName} style={boxStyling} />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={labelStyling}>Zoom Settings</label>
          <p>Longitude/Latitude are used to zoom to center, Bounds are used to zoom to bounds.</p>
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

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="topLeftBoundLatitude" style={labelStyling}>
            West Bound:
          </label>
          <input
            type="number"
            id="topLeftBoundLatitude"
            name="topLeftBoundLatitude"
            onChange={formik.handleChange}
            value={formik.values.topLeftBoundLatitude ?? undefined}
            style={boxStyling}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="topLeftBoundLongitude" style={labelStyling}>
            South Bound:
          </label>
          <input
            type="number"
            id="topLeftBoundLongitude"
            name="topLeftBoundLongitude"
            onChange={formik.handleChange}
            value={formik.values.topLeftBoundLongitude ?? undefined}
            style={boxStyling}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="bottomRightBoundLatitude" style={labelStyling}>
            East Bound:
          </label>
          <input
            type="number"
            id="bottomRightBoundLatitude"
            name="bottomRightBoundLatitude"
            onChange={formik.handleChange}
            value={formik.values.bottomRightBoundLatitude ?? undefined}
            style={boxStyling}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="bottomRightBoundLongitude" style={labelStyling}>
            North Bound:
          </label>
          <input
            type="number"
            id="bottomRightBoundLongitude"
            name="bottomRightBoundLongitude"
            onChange={formik.handleChange}
            value={formik.values.bottomRightBoundLongitude ?? undefined}
            style={boxStyling}
          />
        </div>

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

        <div style={{ marginBottom: '30px' }}>
            <label style={labelStyling}>
                Where Should This Zoom To?
            </label>
            <label htmlFor="zoomToBounds" style={labelStyling}>
            <input type="radio" id="zoomToBounds" name="zoomToBounds" onClick={() => formik.setFieldValue('zoomToBounds', true)} checked={formik.values.zoomToBounds} style={checkboxStyling} />
                Zoom to Bounds
            </label>
            <label htmlFor="zoomToBounds" style={labelStyling}>
                <input type="radio" id="zoomToBounds" name="zoomToBounds" onClick={() => formik.setFieldValue('zoomToBounds', false)} checked={!formik.values.zoomToBounds} style={checkboxStyling} />
                Zoom to Center
            </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
            <label htmlFor="mapId" style={labelStyling}>Map ID:</label>
            <input type="text" id="mapId" name="mapId" onChange={formik.handleChange} value={formik.values.mapId} style={boxStyling} />
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label htmlFor="styleId" style={labelStyling}>StyleId:</label>
            <input type="text" id="styleId" name="styleId" onChange={formik.handleChange} value={formik.values.styleId} style={boxStyling} />
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label htmlFor="infoId" style={labelStyling}>Drupal Info Id:</label>
            <input type="text" id="infoId" name="infoId" onChange={formik.handleChange} value={formik.values.infoId} style={boxStyling} />
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {props.mapConfig ? (
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
            Delete Map
          </button>
        </>
        ) : (
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
        )}
        </div>
    </form>
);
};

export default MapForm;
