import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { MapFiltersGroup } from "@/app/models/maps/map-filters.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MapFilterComponent from "./map-filter.component";
import MapFiltersGroupComponent from "./map-filters-group.component";
import { MapItem, MapZoomProps } from "@/app/models/maps/map.model";
import ZoomLabelButton from "../forms/buttons/zoom-label-button.component";
import ButtonLinkForm from "../forms/ButtonLinkForm";
import ButtonLinkButton from "../forms/buttons/button-link-button.component";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/app/models/button-link.model";
import NewMapGroupForm from "../forms/NewMapGroupForm";

export type MapFilterWrapperProps = {
  defaultMap: MapItem;
  mapGroups: MapFiltersGroup[];
  beforeOpen: () => void;
  afterClose: () => void;
  beforeMapCallback: (map: MapItem) => void;
  afterMapCallback: (map: MapItem) => void;
  zoomToWorld: () => void;
  mapZoomCallback: (zoomProps: MapZoomProps) => void;
  authToken: string;
  inPreviewMode: boolean;
};

const MapFilterWrapperComponent = (props: MapFilterWrapperProps) => {
  const [showForm, setShowForm] = useState(false);
  const [buttonLinks, setButtonLinks] = useState<ButtonLink[]>([]);
  const [groupFormOpen, setGroupFormOpen] = useState<boolean>(false);
  const [showEditorOptions, setShowEditorOptions] = useState<boolean>(false);

  useEffect(() => {
      const isAuthed: boolean = (props.authToken ?? '') != '';
      const inPreviewMode: boolean = props.inPreviewMode ?? false;

      setShowEditorOptions(isAuthed && !inPreviewMode);
  }, [props.authToken, props.inPreviewMode])

  // Fetches button links from the backend on page load
  useEffect(() => {
    const fetchButtonLinks = async () => {
      try {
        const response = await fetch("/api/mappingNY/ButtonLink");
        if (!response.ok) {
          throw new Error("Failed to fetch button links");
        }

        const data = await response.json();
        if (data.buttonLinks) {
          setButtonLinks(data.buttonLinks); // Initializes the state with fetched links
        }
      } catch (error) {
        console.error("Error fetching button links:", error);
      }
    };

    fetchButtonLinks();
  }, []);

  const handleAddButtonLink = async (newLink: ButtonLink) => {
    try {
      const response = await fetch("/api/mappingNY/ButtonLink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLink),
      });

      if (!response.ok) {
        throw new Error("Failed to add button link");
      }

      const data = await response.json();

      // Updates the state with the new button link
      setButtonLinks((prev) => [...prev, data.buttonLink]);
    } catch (error) {
      console.error("Error adding button link:", error);
    }
  };

  const handleDeleteButtonLink = async (id: string) => {
    try {
      // Send DELETE request to the backend
      const response = await fetch("/api/mappingNY/ButtonLink", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete button link");
      }
  
      // Update the state to remove the deleted button
      setButtonLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (error) {
      console.error("Error deleting button link:", error);
    }
  };
  

  return (
    <>
      <div>
        <p className="title">MAPS</p>

        <MapFilterComponent
          afterClose={props.afterClose}
          mapZoomCallback={props.mapZoomCallback}
          beforeMapCallback={props.beforeMapCallback}
          afterMapCallback={props.afterMapCallback}
          map={props.defaultMap}
          beforeOpen={props.beforeOpen}
          displayZoomButton
          displayInfoButton
          displayEditButton={false}
          fetchMapCallback={() => {}} // Do nothing
          mapEditFormCallback={() => {}} // Do nothing
          authToken={props.authToken}
          showEditorOptions={showEditorOptions}
        ></MapFilterComponent>

        {/* Group of map filters */}
        <div id="maps-group">
          {/* OLD IMPLEMENTATION -- Just rendered all map filters without the 3D New Amsterdam button
          props.mapGroups.map((m, idx) => (
            <MapFiltersGroupComponent
              inPreviewMode={props.inPreviewMode}
              authToken={props.authToken}
              beforeOpen={props.beforeOpen}
              afterClose={props.afterClose}
              mapZoomCallback={props.mapZoomCallback}
              key={`map-filters-group-${idx}`}
              beforeMapCallback={props.beforeMapCallback}
              afterMapCallback={props.afterMapCallback}
              group={m}
              showEditorOptions={showEditorOptions}
            ></MapFiltersGroupComponent>
          ))*/}

          {/* NEW IMPLEMENTATION -- Add the 3D New Amsterdam button after the Castello Plan map filter */}

          {/* Render 1600 | Castello Plan */}
          {props.mapGroups.length > 0 && (
            <MapFiltersGroupComponent
              inPreviewMode={props.inPreviewMode}
              authToken={props.authToken}
              beforeOpen={props.beforeOpen}
              afterClose={props.afterClose}
              mapZoomCallback={props.mapZoomCallback}
              key={`map-filters-group-0`}
              beforeMapCallback={props.beforeMapCallback}
              afterMapCallback={props.afterMapCallback}
              group={props.mapGroups[0]}
              showEditorOptions={showEditorOptions}
            />
          )}

          {/* Insert the 3D New Amsterdam button */}
          <center
            style={{
              paddingTop: "20px"
            }}
          >
            <a
              href={"https://sandcastle.cesium.com/standalone.html#c=jVJtb9owEP4rJz5UIFUOL2q1drQaCxsKamCloYUqX0xiiMGxg+1Aw9T/PueFrVTdtE+W7567e57nzrJgIDHXYBNF03j4ADgIiFKgBWQilUAFB6wU0crnJQY5gqOQLHHKdK8Ae2JDONyAXyPZMFoMAjqmQ2d6cFoj6iiHTy4C27l0Nsns0R5eIQPahoNNDqLz9jMbxe7etZsXcy+M7rz7zsib6/n6O3Vps+n2e4ex52Ru/2s07k/pnT1Mnk0z13P3I89t5//57J6O19/ao8OmM1pvDm5/coWSUG6n6/XlUwtPPwnRfpqpcNuyqe1EQzqZKD7odWbRYnO1mvu1zz73eSC40rCjZE+kEcPJvjIFPRaxul8Lir8tuMaUE+nXzuGnzwE0kdJEfkixoyGR14D3mB49ReXjnWLQUorYONnLvXXCet4GoJU/jXOfvzYMp5ILUgHhBK2YWBDje6IjjyjdW5lmSlddDV8tU1Lo0DIrWZWCNGXEjDCID0h1+l6Zfk+nddlqNzsXOQuAEx6JpDHVdEcUwmFYr9qXwHJCBT8IEXviLSCHWBb0koRloCMC1RWB0hkjQJdgqskLVfmxHfmTFy2xygVWTItrRGW4mGrqKvsqbaatWU9YLzENODv7RxqZC/8PyPHiH3KqjWJNpcvwm1ip4uRy3rpcVP61Y6Hk1SweAqyDCOpmsUI2/mxSMIKYWFVxAzfg2nmtW0y9zVFfaJwIqSGVrI6QpUmcMKyJshZpsDH8AqXyuq51LOmGdAc0vPngsCFgxmeTWaaMPdAD8Wu3XcvgT8qYwCHlq/GOSIYzA8lpdKPW7V2ZQAh1LfPNh76v1UKwBZZv+ho1kdaJurYshXkYYKWN5pIaCkRsrTBjRGbWLw"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                flexGrow: 1,
                marginTop: "20px"
              }}
            >
              <strong>
                <button
                  style={{
                    borderColor: "grey",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderRadius: "3px",
                    padding: "1px",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    marginRight: "5px",
                    cursor: "pointer",
                    color: "black",
                    fontWeight: "lighter",
                    fontSize: "0.9em",
                    backgroundColor: "#ededed",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dddddd"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ededed"
                  }}
                >
                  <FontAwesomeIcon
                    icon={getFontawesomeIcon(FontAwesomeLayerIcons.GLOBE)}
                    style={{marginLeft: "8px", marginRight: "5px", color: "inherit",  display: "inline"}}
                  />
                  <p style={{display:"inline-block", padding: "0px 8px 0px 8px"}}>3D New Amsterdam</p>
                </button>
              </strong>
            </a>
          </center>

          {/* Render the rest of the map groups */}
          {props.mapGroups.slice(1).map((m, idx) => (
            <MapFiltersGroupComponent
              inPreviewMode={props.inPreviewMode}
              authToken={props.authToken}
              beforeOpen={props.beforeOpen}
              afterClose={props.afterClose}
              mapZoomCallback={props.mapZoomCallback}
              key={`map-filters-group-${idx + 1}`}
              beforeMapCallback={props.beforeMapCallback}
              afterMapCallback={props.afterMapCallback}
              group={m}
              showEditorOptions={showEditorOptions}
            />
          ))}
        </div>

        {/* New Group Folder button */}
        {!groupFormOpen && props.authToken !== "" && (
              <div
                style={{
                  paddingTop: "20px",
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
              </div>
            )}
            {groupFormOpen && (
              <NewMapGroupForm
                authToken={props.authToken}
                afterSubmit={() => {
                  props.afterClose();
                  setGroupFormOpen(false);
                }}
                afterCancel={() => {
                  setGroupFormOpen(false);
                }}
              ></NewMapGroupForm>
            )}

        {/* Zoom to World button */}
        <center
          style={{
            paddingTop: "20px",
          }}
        ><strong>
          <ZoomLabelButton
            inPreviewMode={props.inPreviewMode}
            authToken={props.authToken}
            beforeOpen={props.beforeOpen}
            afterClose={props.afterClose}
          ></ZoomLabelButton>
          <button
            onClick={() => props.zoomToWorld()}
            id="zoom-world"
            style={{
              borderColor: "grey",
              borderWidth: "1px",
              borderStyle: "solid",
              borderRadius: "3px",
              padding: "1px",
              paddingLeft: "5px",
              paddingRight: "5px",
              marginRight: "5px",
              cursor: "pointer",
              color: "black",
              fontWeight: "lighter",
              fontSize: "0.9em",
              backgroundColor: "#ededed",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#dddddd"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ededed"
            }}
          >
            <FontAwesomeIcon
              icon={getFontawesomeIcon(FontAwesomeLayerIcons.GLOBE)}
              style={{marginLeft: "8px", marginRight: "5px", color: "inherit",  display: "inline"}}
            ></FontAwesomeIcon>
            <p style={{display:"inline-block", padding: "0px 8px 0px 8px"}}> Zoom to World</p>
          </button>
          </strong>
        </center>

        {/* Manage Button Links Section */}
        {
          showEditorOptions && (
            <center style={{ paddingTop: "20px" }}>
              <button
                id="button-link"
                onClick={() => setShowForm((prev) => !prev)}
              >
                <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.LINK, true)}></FontAwesomeIcon>
                Add New Button Link
              </button>
            </center>
          )
        }

        {/* Conditionally Render Form */}
        {showForm && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              borderTop: "1px solid #ccc",
            }}
          >
            <ButtonLinkForm cancelCallback={() => {setShowForm(false)}} onSubmit={handleAddButtonLink} />
          </div>
        )}

        {/* Render Button Links */}
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderTop: "1px solid #ccc",
          }}
        >
          {buttonLinks.map((link) => (
            <ButtonLinkButton inPreviewMode={props.inPreviewMode} authToken={props.authToken} key={link.id} buttonLink={link} onDelete={handleDeleteButtonLink} />
          ))}
        </div>
      </div>
    </>
  );
};

export default MapFilterWrapperComponent;