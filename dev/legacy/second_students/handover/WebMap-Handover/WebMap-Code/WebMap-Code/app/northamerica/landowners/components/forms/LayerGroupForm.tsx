import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LayerGroup } from "@/prisma/generated_schema/NorthAmericaLandowners";
import { useFormik } from "formik";
import { CSSProperties, useEffect, useState } from "react";

type NewLayerGroupFormProps = {
    sectionLayerId: string;
    layerGroup?: LayerGroup;
    afterSubmit: () => void;
    authToken: string
}

const boxStyling: CSSProperties = {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '10px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  };

  const labelStyling: CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333',
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
    fontSize: '14px',
  };

  const buttonHoverStyling: CSSProperties = {
    backgroundColor: '#0056b3',
  };

const NewLayerGroupForm = (props: NewLayerGroupFormProps) => {
    const [submitType, setSubmitType] = useState<"POST" | "UPDATE" | "DELETE">();
    console.log('AHHHH', props.layerGroup);

  //need to add a check in here to verify lat, long, bearing, and zoom are non null before allowing submission
  //find submit button and set as deactivated until necessary fields are filled and have correct value types
  
  /* 
    The following new method is used to validate input into the layerGroupForm when it pops up in the frontend.
    It restricts the user to guarantee that necessary fields (Name, Lat, Long, Zoom, and Bearing) are populated.
    Without these fields populated, there were problems with posting new groups to the database.
  */
  const validate = (values:any) => {
    const errors: Record<string, string> = {};

    if (!values.name) {
      errors.name = "Name is required.";
    }

    if (values.longitude === null || values.longitude === undefined || isNaN(values.longitude)) {
      errors.longitude = "Longitude must be a valid number.";
    }

    if (values.latitude === null || values.latitude === undefined || isNaN(values.latitude)) {
      errors.latitude = "Latitude must be a valid number.";
    }

    if (values.zoom === null || values.zoom === undefined || isNaN(values.zoom)) {
      errors.zoom = "Zoom must be a valid number";
    }

    if (values.bearing === null || values.bearing === undefined || isNaN(values.bearing)) {
      errors.bearing = "Bearing must be a valid number.";
    }
    return errors;
  } 

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: props.layerGroup?.name ?? '',
            longitude: props.layerGroup?.longitude ?? null,
            latitude: props.layerGroup?.latitude ?? null,
            zoom: props.layerGroup?.zoom ?? null,
            bearing: props.layerGroup?.bearing ?? null,
            topLeftBoundLatitude: props.layerGroup?.topLeftBoundLatitude ?? null,
            topLeftBoundLongitude: props.layerGroup?.topLeftBoundLongitude ?? null,
            bottomRightBoundLatitude: props.layerGroup?.bottomRightBoundLatitude ?? null,
            bottomRightBoundLongitude: props.layerGroup?.bottomRightBoundLongitude ?? null,
            zoomToBounds: props.layerGroup?.zoomToBounds ?? false,
            infoId: props.layerGroup?.infoId ?? ''
        },
        validate,
        onSubmit: async (values) => {
          console.log(values);
            if(values.name?.length > 0) {
                const resultingLayerGroup = {
                    name: values.name,
                    layerSectionId: props.sectionLayerId,
                    longitude: values.longitude + '',
                    latitude: values.latitude + '',
                    topLeftBoundLatitude: values.topLeftBoundLatitude,
                    topLeftBoundLongitude: values.topLeftBoundLongitude,
                    bottomRightBoundLatitude: values.bottomRightBoundLatitude,
                    bottomRightBoundLongitude: values.bottomRightBoundLongitude,
                    zoomToBounds: values.zoomToBounds ?? false,
                    zoom: values.zoom as number,
                    bearing: values.bearing as number,
                    infoId: values.infoId
                }
                console.log(resultingLayerGroup);
                if(submitType === "POST")
                    {
                      try 
                      {
                        await fetch('/api/northamerica/landowners/LayerGroup', {
                          method: 'POST',
                          headers: {
                            'authorization': props.authToken,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(resultingLayerGroup),
                        });
                        alert('Layer Group added successfully');
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
                      if(props.layerGroup)
                      {
                        try
                        {
                          await fetch('/api/northamerica/landowners/LayerGroup/' + props.layerGroup.id, {
                            method: 'PUT',
                            headers: {
                                'authorization': props.authToken,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(resultingLayerGroup)
                          });
                          alert(`Layer Group Updated`);
                          props.afterSubmit();
                        }
                        catch (error: any)
                        {
                          alert(`Error: ${error.message}`);
                        }
                      }
                      else
                      {
                        alert(`Error: layerGroup unpopulated`);
                      }
                    }
                    else if(submitType === "DELETE")
                    {
                      if(props.layerGroup)
                        {
                          try
                          {
                            await fetch('/api/northamerica/landowners/LayerGroup/' + props.layerGroup.id, {
                              method: 'DELETE',
                              headers: {
                                'authorization': props.authToken,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(resultingLayerGroup)
                            });
                            alert(`Layer Group Deleted`);
                            props.afterSubmit();
                          }
                          catch (error: any)
                          {
                            alert(`Error: ${error.message}`);
                          }
                        }
                        else
                        {
                          alert(`Error: layerGroup unpopulated`);
                        }
                    }
            }
        }
    });
    /* 
    Added lines to utilize the validate function previously built in this file. This way the submit button
    is disabled until all fields are populated, and the correct data types are used.
  */
    return (
        <form onSubmit={formik.handleSubmit} style={{ margin: '0 auto' }}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="name" style={labelStyling}>Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    style={boxStyling}
                />
                 {formik.errors.name && <div style={{ color: "red" }}>{formik.errors.name}</div>}
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
          {formik.errors.longitude && <div style={{ color: "red" }}>{formik.errors.longitude}</div>}
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
          {formik.errors.latitude && <div style={{ color: "red" }}>{formik.errors.latitude}</div>}
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
          {formik.errors.zoom && <div style={{ color: "red" }}>{formik.errors.zoom}</div>}
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
          {formik.errors.bearing && <div style={{ color: "red" }}>{formik.errors.bearing}</div>}
        </div>

        <div style={{ marginBottom: '30px' }}>
            <label style={labelStyling}>
                Where Should This Zoom To?
            </label>
            <label htmlFor="zoomToBounds" style={labelStyling}>
            <input type="radio" id="zoomToBounds" name="zoomToBounds" onClick={() => formik.setFieldValue('zoomToBounds', true)}  onChange={() => {}} checked={formik.values.zoomToBounds} style={checkboxStyling} />
                Zoom to Bounds
            </label>
            <label htmlFor="zoomToBounds" style={labelStyling}>
                <input type="radio" id="zoomToBounds" name="zoomToBounds" onClick={() => formik.setFieldValue('zoomToBounds', false)} onChange={() => {}} checked={!formik.values.zoomToBounds} style={checkboxStyling} />
                Zoom to Center
            </label>
        </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="infoId" style={labelStyling}>Drupal Info Id:</label>
                <input
                    type="text"
                    id="infoId"
                    name="infoId"
                    onChange={formik.handleChange}
                    value={formik.values.infoId}
                    style={boxStyling}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: "center"}}>
          {props.layerGroup ? (
            <>
              <button
                style={buttonStyling}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHoverStyling.backgroundColor!)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonStyling.backgroundColor!)}
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
                  backgroundColor: '#a40000',
                  color: 'white',
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '14px'}}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#850000')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a40000')}
                onClick={async (e) => {
                  e.preventDefault();
                  setSubmitType("DELETE");
                  await formik.submitForm();
                }}
              >
                Delete Group
              </button>
            </>
          ) : (
            <>
              <button
                style={{...buttonStyling, backgroundColor: !formik.isValid || !formik.dirty ? 'grey' : buttonStyling.backgroundColor,
                  cursor: !formik.isValid || !formik.dirty ? 'not-allowed' : 'pointer'
              }}
                disabled={!formik.isValid || !formik.dirty}
                onMouseEnter={(e) => {
                  if (formik.isValid && formik.dirty) {
                  (e.currentTarget.style.backgroundColor = buttonHoverStyling.backgroundColor!)}
                }}
                onMouseLeave={(e) => {
                  if (formik.isValid && formik.dirty) {
                  (e.currentTarget.style.backgroundColor = buttonStyling.backgroundColor!)}
                  else {e.currentTarget.style.backgroundColor = 'grey';}
                }}
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
    )
}

export default NewLayerGroupForm;