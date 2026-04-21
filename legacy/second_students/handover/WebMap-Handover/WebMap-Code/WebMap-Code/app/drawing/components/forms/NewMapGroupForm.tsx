import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import {MapGroup} from "@/prisma/generated_schema/Drawing";
import { useState } from "react";

type NewLayerSectionFormProps = {
    afterSubmit: () => void,
    afterCancel: () => void,
    mapGroup?: MapGroup,
    authToken: string
}

const NewLayerSectionForm = (props: NewLayerSectionFormProps) => {
    const [submitType, setSubmitType] = useState<"POST" | "UPDATE" | "DELETE">();
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            groupName: props.mapGroup?.groupName ?? '',
            label: props.mapGroup?.label ?? ''
        },
          
        onSubmit: async (values) => {
            const body = {
              groupName: values.label,
              label: values.label,
            }
            if(values.label?.length > 0) {
                if(submitType === "POST")
                    {
                      try 
                      {
                        await fetch('/api/drawing/MapGroup', {
                          method: 'POST',
                          headers: {
                            'authorization': props.authToken ?? '',
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(body),
                        });
                        alert('Map Group added successfully');
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
                      if(props.mapGroup)
                      {
                        try
                        {
                          await fetch('/api/drawing/MapGroup/' + props.mapGroup.id, {
                            method: 'PUT',
                            headers: {
                                'authorization': props.authToken,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body)
                          });
                          alert(`Map Group Updated`);
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
                      if(props.mapGroup)
                        {
                          try
                          {
                            await fetch('/api/drawing/MapGroup/' + props.mapGroup.id, {
                              method: 'DELETE',
                              headers: {
                                'authorization': props.authToken,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(body)
                            });
                            alert(`Map Group Deleted`);
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
        }
    });

    return (
        <form onSubmit={formik.handleSubmit} style={{ margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px' }}>
                <label htmlFor="label">Name:</label>
                <input
                    type="text"
                    id="label"
                    name="label"
                    onChange={formik.handleChange}
                    value={formik.values.label}
                    style={{ flex: '1', border: '1px solid black', width: '150px' }}
                />
                {props.mapGroup ? (
                    <>
                        <button 
                        style={{ padding: '1px 6px', borderRadius: '5px', backgroundColor: '#007BFF', color: 'white'}}
                        onClick={async (e) => {
                            e.preventDefault();
                            setSubmitType("UPDATE");
                            await formik.submitForm();
                        }}>
                            <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.CHECKMARK, false)}></FontAwesomeIcon>
                        </button>
                        <button 
                        style={{ padding: '1px 6px', borderRadius: '5px', backgroundColor: '#a40000', color: 'white' }}
                        onClick={async (e) => {
                            e.preventDefault();
                            setSubmitType("DELETE");
                            await formik.submitForm();
                        }}>
                            <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.TRASHCAN)}></FontAwesomeIcon>
                        </button>
                    </>
                ) : (
                <>
                    <button 
                    style={{ padding: '1px 6px', borderRadius: '5px', backgroundColor: '#007BFF', color: 'white'}}
                    onClick={async (e) => {
                        e.preventDefault();
                        setSubmitType("POST");
                        await formik.submitForm();
                    }}>
                        <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.CHECKMARK, false)}></FontAwesomeIcon>
                    </button>
                    <button 
                    style={{ padding: '1px 6px', borderRadius: '5px', backgroundColor: '#a40000', color: 'white' }}
                    onClick={() => props.afterCancel()}>
                        <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.XMARK)}></FontAwesomeIcon>
                    </button>
                </>
                )}
            </div>
        </form>
    )
}

export default NewLayerSectionForm;