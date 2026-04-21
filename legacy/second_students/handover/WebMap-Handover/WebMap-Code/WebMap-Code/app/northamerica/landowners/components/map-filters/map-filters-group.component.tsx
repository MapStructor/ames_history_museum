import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { MapFiltersGroup } from "@/app/models/maps/map-filters.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import MapFilterComponent from "./map-filter.component";
import { IconColors } from "@/app/models/colors.model";
import { MapItem, MapZoomProps } from "@/app/models/maps/map.model";
import NewMapGroupItem from "../new-map-group-item.component";
import {CSSTransition} from 'react-transition-group';
import { Map as PrismaMap } from "@/prisma/generated_schema/NorthAmericaLandowners";
import { MapGroup as PrismaMapGroup } from "@/prisma/generated_schema/NorthAmericaLandowners"; 
import Loader from "../loading/loading.component";
import NewMapGroupForm from "../forms/NewMapGroupForm";
import MapForm from "../forms/MapForm"
import Modal from 'react-modal';


type MapFiltersGroupComponentProps = {
    group: MapFiltersGroup,
    beforeMapCallback: (map: MapItem) => void,
    afterMapCallback: (map: MapItem) => void,
    mapZoomCallback: (zoomProps: MapZoomProps) => void
    beforeOpen: () => void,
    afterClose: () => void,
    authToken: string,
    inPreviewMode: boolean,
    showEditorOptions: boolean,
}

const MapFiltersGroupComponent = (props: MapFiltersGroupComponentProps) => {
    // NEW IMPLEMENTATION - Have Manhattan layer expanded by default
    // List of layers that should be open by default
    const defaultOpenLayerNames = ["1600 | Castello Plan"];
    const [layerIsOpen, setLayerIsOpen] = useState(
        defaultOpenLayerNames.includes(props.group.label) // Ensure `label` holds the correct layer name
    );
    // OLD IMPLEMENTATION - All layers closed by default
    //const [layerIsOpen, setLayerIsOpen] = useState<boolean>(false);

    const nodeRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mapGroup, setMapGroup] = useState<PrismaMapGroup>();
    const [editGroupOpen, setEditGroupOpen] = useState<boolean>(false);
    const [map, setMap] = useState<PrismaMap>();
    const [editMap, setEditMap] = useState<boolean>(false);

    //handle functions for animation
    const handleEnter = () => {
        if (nodeRef.current) {
        nodeRef.current.style.height = "0px";
        }
    };

    const handleEntering = () => {
        if (nodeRef.current) {
        nodeRef.current.style.height = `${nodeRef.current.scrollHeight}px`;
        }
    };

    const handleEntered = () => {
        if (nodeRef.current) {
        nodeRef.current.style.height = "auto";
        }
    };

    const handleExit = () => {
        if (nodeRef.current) {
        nodeRef.current.style.height = `${nodeRef.current.scrollHeight}px`;
        nodeRef.current.style.overflow = "hidden";
        }
    };

    const handleExiting = () => {
        if (nodeRef.current) {
        nodeRef.current.style.height = "0px";
        }
    };

    const handleExited = () => {
        if (nodeRef.current) {
        nodeRef.current.style.height = "0px";
        }
    };

    const fetchMapGroup = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/northamerica/landowners/MapGroup/' + id) 
            .then((response) => {
            response.json()?.then(parsed => {
                setMapGroup(parsed.MapGroup);
            })
        });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
          setIsLoading(false);
        }
    };

    const fetchMap = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/northamerica/landowners/map/' + id) 
            .then((response) => {
            response.json()?.then(parsed => {
                setMap(parsed.maps);
            })
        });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
          setIsLoading(false);
        }
    };

    const closeEdit = () => {
        setEditMap(false);
        setMap(undefined);
        props.afterClose();
    }

    return (
        <>
            <center style={{paddingTop: "20px"}}>
                {editGroupOpen ? (
                    <>
                        {isLoading ? (
                            <Loader
                            center={false}/>
                        ) : (
                            <NewMapGroupForm
                                authToken={props.authToken}
                                afterSubmit={() => {
                                    setEditGroupOpen(false);
                                    setMapGroup(undefined);
                                    props.afterClose();
                                }}
                                mapGroup={mapGroup}
                                afterCancel={() => {}}>
                            </NewMapGroupForm>
                        )}
                    </>
                ) : (
                    <>
                        <b>
                        <FontAwesomeIcon onClick={() => setLayerIsOpen(!layerIsOpen)} color={IconColors.DARK_GREY} icon={layerIsOpen ? getFontawesomeIcon(FontAwesomeLayerIcons.MINUS_SQUARE, true) : getFontawesomeIcon(FontAwesomeLayerIcons.PLUS_SQUARE, true)}
                        id="folder-plus-minus-icon"/>
                        {props.group.label ?? "" /* Possibly need a different "DisplayName" prop to be used for this if not formatted correctly */}</b>
                        <div className="layer-buttons-block">
                            <div className="layer-buttons-list">
                                {
                                    props.showEditorOptions && (
                                        <div className="tooltip-container" data-title="Edit Folder">
                                            <FontAwesomeIcon
                                                className="edit-button"
                                                color="black"
                                                icon={getFontawesomeIcon(FontAwesomeLayerIcons.PEN_TO_SQUARE)}
                                                onClick={() => {
                                                    setEditGroupOpen(true);
                                                    fetchMapGroup(props.group.id);
                                                }}
                                                style={{
                                                    paddingRight: "42px"
                                                }}/>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </>
                    )
                }
                
            </center>
            <CSSTransition
                in={layerIsOpen}
                timeout={500}
                classNames="mapgroup"
                unmountOnExit
                nodeRef={nodeRef}
                onEnter={handleEnter}
                onEntering={handleEntering}
                onEntered={handleEntered}
                onExit={handleExit}
                onExiting={handleExiting}
                onExited={handleExited}>
                <div ref={nodeRef}>
                    {
                        props.group.maps.map((map, idx) => (
                            <MapFilterComponent 
                                beforeMapCallback={props.beforeMapCallback} 
                                afterMapCallback={props.afterMapCallback} 
                                mapZoomCallback={props.mapZoomCallback} 
                                key={`map-filter-component-${idx}`} 
                                map={map} 
                                displayInfoButton 
                                displayZoomButton 
                                displayEditButton
                                beforeOpen={props.beforeOpen}
                                afterClose={props.afterClose}
                                mapEditFormCallback={setEditMap}
                                fetchMapCallback={fetchMap}
                                authToken={props.authToken}
                                showEditorOptions={props.showEditorOptions}/>
                        ))
                        
                    }
                    {
                        // <NewSectionLayerGroupItem beforeOpen={props.beforeOpen} afterClose={props.afterClose} groupName={props.group.id} sectionName={props.sectionName}></NewSectionLayerGroupItem>
                        <NewMapGroupItem inPreviewMode={props.inPreviewMode} authToken={props.authToken} beforeOpen={props.beforeOpen} afterClose={props.afterClose} groupId={""} groupName={props.group.id}></NewMapGroupItem>
                    }
                </div>
            </CSSTransition>
            {
                editMap && 
                (
                    <Modal
                        style={{
                            overlay: {
                                zIndex: "1000",
                            },
                            content: {
                                width: '30%',
                                right: '5px'
                            }
                        }}
                        isOpen={editMap}
                        onRequestClose={() => {
                            closeEdit();
                        }}
                        contentLabel='Edit Layer'
                    >
                    {
                        isLoading ? (
                            <Loader
                            center={true}/>
                        ) : (
                            <MapForm
                            authToken={props.authToken}
                            groupName={props.group.id}
                            mapConfig={map} 
                            afterSubmit={() => {
                                closeEdit();
                                }}>
                            </MapForm>
                        )
                    }
                    </Modal> 
                )
            }
        </>
    )
}

export default MapFiltersGroupComponent