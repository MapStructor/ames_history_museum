import { SectionLayer, SectionLayerGroup, SectionLayerItem } from "@/app/models/layers/layer.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState, useContext, useEffect } from "react";
import { faMinusSquare, faPlusSquare, faPlayCircle } from "@fortawesome/free-regular-svg-icons";
import ExpandableLayerGroup from "./layer-group.component";
import NewSectionLayerGroup from "../new-section-layer-group.component";
import NewStandaloneLayer from '../new-section-layer-stand-alone-component'
import { MapZoomProps } from "@/app/models/maps/map.model";
import NewLayerGroupForm from "../forms/LayerGroupForm";
import Modal from 'react-modal';
import { LayerGroup as PrismaLayerGroup, LayerData as PrismaLayer } from "@/prisma/generated_schema/chronmaps";
import Loader from "../loading/loading.component";
import { getFontawesomeIcon, parseFromString } from "@/app/helpers/font-awesome.helper";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import NewLayerSectionForm from "../forms/NewLayerSectionForm";
import { IconColors } from "@/app/models/colors.model";
import {CSSTransition} from 'react-transition-group';
import Layer from "../layers/layer.component";
import LayerForm from "../forms/LayerForm";

type LayerGroupSectionProps = { // Props for ExpandableLayerGroupSection
    layersHeader: string,
    layer: SectionLayer,
    activeLayerCallback: (activeLayers: string[]) => void,
    activeLayers: string[],
    openWindow: () => void,
    beforeOpen: () => void,
    afterClose: () => void,
    mapZoomCallback:(zoomProps: MapZoomProps) => void,
    getLayerSectionsCallback: () => void,
    removeMapLayerCallback: (id: string) => void,
    afterSubmit: () => void,
    authToken: string,
    inPreviewMode: boolean,
}

// Renamed from SectionLayerComponent to ExpandableLayerGroupSection for clarity
const ExpandableLayerGroupSection = (props: LayerGroupSectionProps) => {
    // NEW IMPLEMENTATION - Have Manhattan layer expanded by default
    // List of layers that should be expanded by default
    const defaultOpenLayerNames = ["Manhattan"];
    const [layerIsOpen, setLayerIsOpen] = useState(
        defaultOpenLayerNames.includes(props.layer.label) // Ensure `label` holds the correct layer name
    );
    // OLD IMPLEMENTATION - All layers closed by default
    // const [layerIsOpen, setLayerIsOpen] = useState<boolean>(true);

    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [editSectionOpen, setEditSectionOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [layerGroup, setLayerGroup] = useState<PrismaLayerGroup>();
    const [layerSection, setLayerSection] = useState<PrismaLayerGroup>();
    const [standAloneLayers, setStandaloneLayers] = useState<PrismaLayer[]>([]);
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const [showEditorOptions, setShowEditorOptions] = useState<boolean>(false);
    const [layerEditOpen, setLayerEditOpen] = useState<boolean>(false);
    const [currentLayer, setCurrentLayer] = useState<PrismaLayer>();

    useEffect(() => {
        const isAuthed: boolean = (props.authToken ?? '') != '';
        const inPreviewMode: boolean = props.inPreviewMode ?? false;
        

        setShowEditorOptions(isAuthed && !inPreviewMode);
    }, [props.authToken, props.inPreviewMode])

    const closeEdit = () => {
        props.afterClose();
        setEditOpen(false);
        setLayerGroup(undefined);
    };

    const closeLayerEdit = () => {
        props.afterClose();
        setLayerEditOpen(false);
        setCurrentLayer(undefined);
    };

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

    /*
        This new method (not yet called) was added to bring the standalone layers into the layer group component.
        Allowing them to be displayed in the menu as their own section, independent of the groups present in the 
        menu as of current.
    */
        useEffect(() => {
            getStandaloneLayers();
        }, []);
    
        const getStandaloneLayers = () => {
            fetch("/api/chronmaps/StandaloneLayers", {
                method: "GET",
                headers: {
                    authorization: props.authToken ?? '',
                    "Content-Type": "application/json",
                },
            }).then((response) => {
                response.json()?.then((parsed) => {
                    if (!!parsed && !!parsed.standaloneLayers && parsed.standaloneLayers.length > 0) {
                        setStandaloneLayers(parsed.standaloneLayers);
                    }
                });
            });
        };

        const enableStandAloneLayers = () => {
            standAloneLayers.forEach(layer => {
                if (layer.id && layer.enableByDefault && !props.activeLayers.includes(layer.id))
                    {
                        props.activeLayerCallback([...props.activeLayers, layer.id]);
                    }
            })
        }


    useEffect(() => { //TODO: Temp fix.  Investigate further issue with page lifecycle
        setTimeout(() => {
            enableStandAloneLayers();
        }, 900); // Wait for rendering
    }, [standAloneLayers]);


        const toggleStandaloneLayerVisibility = (layerId: string) => {
            let updatedLayerIds: string[];
            if (props.activeLayers.includes(layerId)) {
                // Remove the layer ID from the active layer list
                updatedLayerIds = props.activeLayers.filter(id => id !== layerId);
            } else {
                // Add the layer ID to the active layer list
                updatedLayerIds = [...props.activeLayers, layerId];
            }
            props.activeLayerCallback(updatedLayerIds);
        };

    const fetchLayerSection = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/chronmaps/LayerSection/' + id) 
            .then((response) => {
            response.json()?.then(parsed => {
                setLayerSection(parsed.layerSection);
            })
        });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
          setIsLoading(false);
        }
    };

    const fetchLayerGroup = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/chronmaps/LayerGroup/' + id) 
            .then((response) => {
            response.json()?.then(parsed => {
                console.log('ERERERER', parsed);
                setLayerGroup(parsed.layerGroup);
            })
        });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const UpLayerSection = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/chronmaps/LayerSection/Rearrange/Up/' + id, {
                method: 'PUT',
                headers: {
                    authorization: props.authToken,
                    "Content-Type": "application/json",
                  },
            });
        }
        catch(err) {
            console.log(err)
        }
        finally {
            setIsLoading(false);
        }
    }

    const DownLayerSection = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/chronmaps/LayerSection/Rearrange/Down/' + id, {
                method: 'PUT',
                headers: {
                    authorization: props.authToken,
                    "Content-Type": "application/json",
                  },
            });
        }
        catch(err) {
            console.log(err)
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <center style={{paddingTop: "20px"}}>
                {editSectionOpen ? (
                    <>
                        {isLoading ? (
                            <Loader
                            center={false}/>
                        ) : (
                            <NewLayerSectionForm
                                authToken={props.authToken}
                                afterSubmit={() => {
                                    setEditSectionOpen(false);
                                    setLayerSection(undefined);
                                    props.getLayerSectionsCallback();
                                }}
                                layerSection={layerSection}
                                afterCancel={() => {}}>
                            </NewLayerSectionForm>
                        )}
                    </>
                ) : (
                    <>
                        <FontAwesomeIcon onClick={() => setLayerIsOpen(!layerIsOpen)} color={IconColors.DARK_GREY} icon={layerIsOpen ? getFontawesomeIcon(FontAwesomeLayerIcons.MINUS_SQUARE, true) : getFontawesomeIcon(FontAwesomeLayerIcons.PLUS_SQUARE, true)}
                        id="folder-plus-minus-icon" />
                        <b>
                        {props.layersHeader ?? "" /* Possibly need a different "DisplayName" prop to be used for this if not formatted correctly */}
                        </b>
                        <div className="layer-buttons-block">
                            <div className="layer-buttons-list">
                                {
                                    showEditorOptions && (
                                        <div className="tooltip-container" data-title="Edit Folder">
                                            <FontAwesomeIcon
                                                className="edit-button"
                                                color="black"
                                                icon={getFontawesomeIcon(FontAwesomeLayerIcons.PEN_TO_SQUARE)}
                                                onClick={() => {
                                                    console.log("edit group");
                                                    setEditSectionOpen(true);
                                                    fetchLayerSection(props.layer.id);
                                                }}
                                                style={{
                                                    paddingLeft: "10px"
                                                }}/>
                                        </div>
                                    )
                                }
                                {
                                    showEditorOptions && (
                                        <div className="tooltip-container" data-title="Move Up">
                                            <FontAwesomeIcon 
                                                className="decrement-order"
                                                color="black"
                                                style={{
                                                    paddingLeft: "6px"
                                                }}
                                                icon={getFontawesomeIcon(FontAwesomeLayerIcons.UP_ARROW)}
                                                onClick={async() => {
                                                    await UpLayerSection(props.layer.id)
                                                    // fetchLayerSection(props.layer.id)
                                                    props.afterSubmit()
                                                }}
                                            />
                                        </div>
                                    )
                                }
                                {
                                    showEditorOptions && (
                                        <div className="tooltip-container" data-title="Move Down">   
                                        <FontAwesomeIcon 
                                        className="increment-order"
                                            color="black"
                                            style={{
                                                paddingLeft: "6px"
                                            }}
                                            icon={getFontawesomeIcon(FontAwesomeLayerIcons.DOWN_ARROW)}
                                            onClick={async() => {
                                                await DownLayerSection(props.layer.id)
                                                props.afterSubmit()
                                            }}
                                        />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </>
                )}
            </center>
            <CSSTransition
                in={layerIsOpen}
                timeout={500}
                classNames="layersection"
                unmountOnExit
                nodeRef={nodeRef}
                onEnter={handleEnter}
                onEntering={handleEntering}
                onEntered={handleEntered}
                onExit={handleExit}
                onExiting={handleExiting}
                onExited={handleExited}>
                <div ref={nodeRef} className="layersection">
                    {
                        props.layer.groups.map((grp, idx) => (
                            <ExpandableLayerGroup
                                inPreviewMode={props.inPreviewMode}
                                authToken={props.authToken}
                                key={`section-layer-component-${idx}`}
                                activeLayers={props.activeLayers}
                                activeLayerCallback={props.activeLayerCallback}
                                layersHeader={props.layersHeader}
                                group={grp}
                                openWindow={props.openWindow}
                                beforeOpen={props.beforeOpen}
                                afterClose={props.afterClose}
                                sectionName={props.layer.id}
                                mapZoomCallback={props.mapZoomCallback}
                                fetchLayerGroupCallback={fetchLayerGroup}
                                editFormVisibleCallback={setEditOpen}
                                removeMapLayerCallback={props.removeMapLayerCallback}
                                afterSubmit={props.afterSubmit}
                                />
                        ))
                    }
                    
                    {
     standAloneLayers.filter(layer => layer.topLayerClass === props.layer.id).map((layer, idx) => {    //hardcoding manhattan only for the time being
        const isLayerActive = props.activeLayers.includes(layer.id);
        return (
            <div key={"standalone-layer-component-" + idx} className="layer-list-row">
                <input
                    id={`standalone-layer-${layer.id}`}
                    type="checkbox"
                    style={{
                        paddingRight: "5px",
                        marginRight: "5px"
                    }}
                    checked={isLayerActive}
                    onChange={() => toggleStandaloneLayerVisibility(layer.id)}
                />
                <Layer
                    item={{ ...layer, 
                        layerId: layer.id,
                        isSolid: false, 
                        iconType: parseFromString(layer.iconType), 
                        zoom: layer.zoom ?? 0, 
                        bearing: layer.bearing ?? 0,
                        zoomToBounds: layer.zoomToBounds ?? false,
                        center: layer.longitude != null && layer.latitude != null ? [layer.longitude, layer.latitude] : undefined,
                        enableByDefault: layer.enableByDefault ?? false,
                        bounds: layer.topLeftBoundLongitude && layer.topLeftBoundLatitude && layer.bottomRightBoundLongitude && layer.bottomRightBoundLatitude
                        ? [
                            [layer.topLeftBoundLongitude, layer.topLeftBoundLatitude],
                            [layer.bottomRightBoundLongitude, layer.bottomRightBoundLatitude],
                            ]
                        : undefined,
                        standalone: true,
                        layerSectionId: layer.layerSection ?? undefined,
                    }}
                    activeLayers={props.activeLayers}
                    activeLayerCallback={props.activeLayerCallback}
                    openWindow={props.openWindow}
                    editFormVisibleCallback={(isOpen) => {
                        setLayerEditOpen(isOpen);
                        setCurrentLayer(layer);
                    }}
                    mapZoomCallback={props.mapZoomCallback}
                    fetchLayerDataCallback={() => {}}
                    afterSubmit={props.afterSubmit}
                    authToken={props.authToken}
                    inPreviewMode={props.inPreviewMode}
                />
            </div>
        );
    })
}
                    <NewSectionLayerGroup
                        inPreviewMode={props.inPreviewMode}
                        authToken={props.authToken}
                        beforeOpen={props.beforeOpen}
                        afterClose={props.afterClose}
                        sectionLayerId={props.layer.id}
                    ></NewSectionLayerGroup>
                    {/* Added the new standalone layer button component, which allows users to add a new 
                    section of type standalone into the menu display. */}
                    <NewStandaloneLayer
                        inPreviewMode={props.inPreviewMode}
                        authToken={props.authToken}
                        beforeOpen={props.beforeOpen}
                        afterClose={props.afterClose}
                        sectionLayerId={props.layer.id}
                    />
                    {
                        editOpen &&  (
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
                                isOpen={editOpen}
                                onRequestClose={() => {closeEdit();}}
                                contentLabel='Edit Layer Group'
                            >
                                {isLoading ? (
                                    <Loader
                                    center={true}/>
                                    ) : (
                                    <NewLayerGroupForm authToken={props.authToken} sectionLayerId={props.layer.id} layerGroup={layerGroup} afterSubmit={closeEdit}></NewLayerGroupForm>
                                    )
                                }
                            </Modal>
                        )
                    }
                    {
                        layerEditOpen && (
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
                                isOpen={layerEditOpen}
                                onRequestClose={closeLayerEdit}
                                contentLabel='Edit Layer'
                            >
                                {isLoading ? (
                                    <Loader center={true}/>
                                ) : (
                                    <LayerForm
                                        authToken={props.authToken}
                                        standalone={true}
                                        layerConfig={currentLayer}
                                        groupName={props.layer.label}
                                        sectionName={props.layer.id}
                                        afterSubmit={() => {
                                            props.removeMapLayerCallback(currentLayer?.id ?? '');
                                            closeLayerEdit();
                                            getStandaloneLayers();
                                        }}
                                    />
                                )}
                            </Modal>
                        )
                    }
                </div>
            </CSSTransition>
        </>
    )
}

export default ExpandableLayerGroupSection;