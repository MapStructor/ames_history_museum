import { SectionLayer, SectionLayerGroup, SectionLayerItem } from "@/app/models/layers/layer.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import Layer from "./layer.component";
import { faCrosshairs, faInfoCircle, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { getFontawesomeIcon, parseFromString } from "@/app/helpers/font-awesome.helper";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { IconColors } from "@/app/models/colors.model";
import NewSectionLayerGroupItem from "../new-section-layer-group-item.component";
import { MapZoomProps } from "@/app/models/maps/map.model";
import { LayerData as PrismaLayer } from "@/prisma/generated_schema/NorthAmericaLandowners";
import LayerForm from "../forms/LayerForm";
import Modal from 'react-modal';
import Loader from "../loading/loading.component";

type LayerGroupProps = { // Props for ExpandableLayerGroup
    layersHeader: string,
    sectionName: string,
    group: SectionLayerGroup, // TS model of layer group
    activeLayerCallback: (activeLayers: string[]) => void,
    activeLayers: string[], // Database IDs of active layers
    openWindow: () => void,
    beforeOpen: () => void,
    afterClose: () => void,
    mapZoomCallback:(zoomProps: MapZoomProps) => void,
    editFormVisibleCallback: (isOpen: boolean) => void,
    fetchLayerGroupCallback: (id: string) => void,
    removeMapLayerCallback: (id: string) => void,
    afterSubmit: () => void,
    authToken: string,
    inPreviewMode: boolean,
}

/**
 * SectionLayerGroupComponent is a component that displays a layer group with a checkbox 
 * and a plus/minus icon. If the group has items, it will display the items when the plus 
 * icon is clicked. Below any items, it will display a "New Layer" button.
 */
const ExpandableLayerGroup = (props: LayerGroupProps) => {
    const [layerGroupIsExpanded, setLayerGroupExpanded] = useState<boolean>(false); // Renamed from layerIsOpen to layerGroupIsExpanded for clarity
    // NEW IMPLEMENTATION - The state of the HTML checkbox (checked) is bound to layerGroupIsVisible
    // When the checkbox is toggled, layerGroupIsVisible is set to the opposite of its current value
    // When 
    const [layerGroupIsVisible, setLayerGroupVisible] = useState<boolean>(false); // State to track layer group visibility (false if layer is hidden)
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [layer, setLayer] = useState<PrismaLayer>();
    const [modalHeaderText, setModalHeaderText] = useState<string>('');
    const [modalBodyText, setModalBodyText] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [showEditorOptions, setShowEditorOptions] = useState<boolean>(false);

    /**
     * Closes the info modal by calling the afterClose callback and setting the modal state to closed.
     */
    const closeWindow = () => {
        props.afterClose()
        setModalOpen(false)
    }
    
    useEffect(() => {
        const isAuthed: boolean = (props.authToken ?? '') != '';
        const inPreviewMode: boolean = props.inPreviewMode ?? false;

        // The user must be authorized and not in preview mode to see the edit options
        setShowEditorOptions(isAuthed && !inPreviewMode);
    }, [props.authToken, props.inPreviewMode])

    useEffect(() => {
        if(props.layersHeader === "Long Island"){
            setLayerGroupExpanded(true);
        }
    }, []);

    useEffect(() => {
        // If the group has a valid info ID and the modal header text or body text is empty, fetch the info text
        if(props.group.infoId != null && props.group.infoId.length > 0) {
            if(modalHeaderText == null || modalHeaderText.length == 0 || modalBodyText == null || modalBodyText.length == 0) {
                fetch('https://encyclopedia.nahc-mapping.org/info-text-export', {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    }
                }).then(response => {
                    if(response.ok) {
                        response.json().then((jsonResult: {title: string, id: string, body: string }[]) => {
                            if(jsonResult != null && jsonResult.length > 0) {
                                // NEW IMPLEMENTATION - Replace '&amp;' with '&'
                                let modalHeader: string = jsonResult.find(x => x.id == props.group.infoId)?.title.replace('\u0026amp;', '&') ?? '';
                                // OLD IMPLTEMENTATION - Bug with "Orignial Grants &amp; Farms"
                                // let modalHeader: string = jsonResult.find(x => x.id == props.group.infoId)?.title ?? '';
                                
                                let modalBody: string = jsonResult.find(x => x.id == props.group.infoId)?.body ?? '';
                                setModalHeaderText(modalHeader);
                                setModalBodyText(modalBody);
                            }
                            console.log(jsonResult);
                        })
                    }
                })
            }
        }
    })

    /**
     * Expands or collapses the layer group.
     */
    const toggleGroup = (e: any) => {
        // if(props.group.items.length > 0) {
            setLayerGroupExpanded(!layerGroupIsExpanded)
       // }
        e.stopPropagation();
    }

    /**
     * Closes the edit modal by calling the afterClose callback and resetting the layer state.
     */
    const closeEdit = () => {
        props.afterClose();
        setEditOpen(false);
        setLayer(undefined);
    }

    /**
     * Fetches layer data from the server using the provided ID.
     * Updates the layer state with the retrieved data upon success.
     * 
     * @param id The ID of the layer data to fetch.
     */

    const fetchLayerData = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/northamerica/landowners/LayerData/' + id)
            .then((response) => {
            response.json()?.then(parsed => {
                console.log('get layers')
                setLayer(parsed.layerData);
            })
        });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    /**
     * Moves the layer group up in the section by calling the API endpoint /api/LayerGroup/Rearrange/Down/:id.
     * @param id The ID of the layer group to move up in the section.
     */
    const moveLayerGroupUp = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/northamerica/landowners/LayerGroup/Rearrange/Up/' + id, {
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

    /**
     * Moves the layer group down in the section by calling the API endpoint /api/LayerGroup/Rearrange/Down/:id.
     * @param id The ID of the layer group to move down in the section.
     */
    const moveLayerGroupDown = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch('/api/northamerica/landowners/LayerGroup/Rearrange/Down/' + id, {
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

    /**
     * NEW IMPLEMENTATION
     * Sets the layer group's visibility based on whether any of the active layers are in this group.
     */
    useEffect(() => {
        const someLayersActive = props.group.items.some(item =>
            item.layerId && props.activeLayers.includes(item.layerId)
        );

        setLayerGroupVisible(someLayersActive);
    }, [props.activeLayers, props.group.items])

    /**
     * Toggles the visibility of the layer group by adding or removing the layer group's layers from the active layer list.
     */
    const toggleLayerGroupVisibility = () => { // Renamed from handleCheckboxChange for clarity
        let updatedLayerIds: (string | undefined)[];
        if (layerGroupIsVisible)
        {
            // Remove all of this group's layer IDs from the active layer list
            updatedLayerIds = props.activeLayers.filter(layerId => 
                !props.group.items.some((item) => item.layerId === layerId)
            );
        }
        else
        {
            // Add all of this group's layer IDs to the active layer list
            updatedLayerIds = [...props.activeLayers, ...props.group.items.map(item => item.layerId)];
        }

        props.activeLayerCallback(updatedLayerIds as string[]);
        setLayerGroupVisible(!layerGroupIsVisible);
    }

    useEffect(() => {
        activateDefaultLayerGroup();
    }, []);

    const activateDefaultLayerGroup = () => {
        props.group.items.forEach(item => {
            if (item.enableByDefault) {
                toggleLayerGroupVisibility(); // Removed state change as state is updated in toggle method
            }
        });
    }

    return (
        <>
            <div className="layer-list-row">
                <input
                    id={`section-layer-group-${props.group?.id ?? ""}`}
                    type="checkbox"
                    style={{
                        paddingRight: "5px",
                        marginRight: "5px"
                    }}
                    checked={layerGroupIsVisible}
                    onChange={toggleLayerGroupVisibility}
                />
                <FontAwesomeIcon id={props.group.items.length > 0 ? 'group-layer-plus-minus-icon' : ""} onClick={toggleGroup} icon={layerGroupIsExpanded ? getFontawesomeIcon(FontAwesomeLayerIcons.MINUS_SQUARE, true) : getFontawesomeIcon(FontAwesomeLayerIcons.PLUS_SQUARE, true)}
                style={{color: props.group.items.length > 0 ? IconColors.DARK_GREY : props.group.iconColor, paddingRight: "5px"}}/>
                <label htmlFor={`section-layer-group-${props.group?.id ?? ""}`}>
                {props.group.label}
                <div className="dummy-label-layer-space"></div>
                </label>
                <div className="layer-buttons-block">
                    <div className="layer-buttons-list">
                        {
                            showEditorOptions && (
                                <div className="tooltip-container" data-title="Edit Group">
                                <FontAwesomeIcon
                                    className="edit-button"
                                    color="black"
                                    icon={getFontawesomeIcon(FontAwesomeLayerIcons.PEN_TO_SQUARE)}
                                    onClick={() => {
                                        props.openWindow();
                                        props.fetchLayerGroupCallback(props.group.id ?? '');
                                        props.editFormVisibleCallback(true);
                                    }}
                                    />
                                </div>
                            )
                        }
                        {
                            showEditorOptions && (
                                <div className="tooltip-container" data-title="Move Up">
                                <FontAwesomeIcon
                                    className="decrement-order"
                                    color="black"
                                    icon={getFontawesomeIcon(FontAwesomeLayerIcons.UP_ARROW)}
                                    onClick={async() => {
                                            await moveLayerGroupUp(props.group.id)
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
                                    icon={getFontawesomeIcon(FontAwesomeLayerIcons.DOWN_ARROW)}
                                    onClick={async() => {
                                            await moveLayerGroupDown(props.group.id)
                                            props.afterSubmit()
                                        }}
                                    />
                                </div>
                            )
                        }
                        <div className="tooltip-container" data-title="Zoom to Group">
                                <FontAwesomeIcon
                                className="zoom-to-layer"
                                color="blue"
                                icon={faCrosshairs}
                                onClick={() => {
                                    props.mapZoomCallback({
                                    center: props.group.center ?? [0, 0],
                                    zoom: props.group.zoom ?? 0,
                                    bearing: props.group.bearing ?? 0,
                                    speed: 0.2,
                                    curve: 1,
                                    duration: 2500,
                                })}}
                                />
                        </div>
                        {
                            (modalHeaderText.length > 0 && modalBodyText.length > 0) && (
                                <div className="tooltip-container" data-title="Group Info">
                                    <FontAwesomeIcon
                                    className="layer-info trigger-popup"
                                    color="grey"
                                    icon={faInfoCircle}
                                    onClick={() => setModalOpen(true)} // Edit This to pull up a modal
                                    />
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            {
                layerGroupIsExpanded && props.group.items.map((item, idx) => {
                    return (
                        <>
                            <Layer
                                inPreviewMode={props.inPreviewMode}
                                authToken={props.authToken}
                                key={'seclaygroupitem' + idx}
                                activeLayers={props.activeLayers}
                                activeLayerCallback={props.activeLayerCallback}
                                item={item}
                                openWindow={props.openWindow}
                                editFormVisibleCallback={setEditOpen}
                                mapZoomCallback={props.mapZoomCallback}
                                fetchLayerDataCallback={fetchLayerData}
                                afterSubmit={props.afterSubmit}
                            />
                            
                        </>    
                    )     
                })
            }
             {           
                (layerGroupIsExpanded ) &&
                (
                    <NewSectionLayerGroupItem
                    inPreviewMode={props.inPreviewMode}
                    authToken={props.authToken}
                    beforeOpen={props.beforeOpen}
                    afterClose={props.afterClose}
                    groupName={props.group.id}
                    sectionName={props.sectionName}
                    topLayerClass={props.group.id}>
                    </NewSectionLayerGroupItem>
                )
            }
            {
                editOpen &&
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
                        isOpen={editOpen}
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
                            <LayerForm
                            authToken={props.authToken}
                            standalone={false}  //need to check if this breaks
                            groupName={props.group.id}
                            sectionName={props.sectionName}
                            layerConfig={layer}
                            afterSubmit={() => {
                                props.removeMapLayerCallback(layer?.id ?? '');
                                closeEdit();
                                }}>
                            </LayerForm>
                        )
                    }
                    </Modal>
                )
            }
            {
                modalBodyText.length > 0 && (
                    <Modal
                        style={{
                            overlay: {
                                zIndex: "1000",
                            },
                            content: {
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                padding: '15px',
                                background: 'rgb(255, 255, 255)',
                                opacity: '0.9',
                                border: '1px solid rgb(0, 0, 0)',
                                borderRadius: '4px',
                                width: 'fit-content',
                                maxWidth: '75vw',
                                height: 'fit-content',
                                outline: 'none',
                            },
                        }}
                        isOpen={modalOpen}
                        onRequestClose={closeWindow}
                        contentLabel={modalHeaderText}
                        
                    >
                        <div className="modal-header">
                            <h1>
                                {modalHeaderText}
                            </h1>
                        </div>
                        <div className="modal-content" dangerouslySetInnerHTML={{__html: modalBodyText}}>
                        </div>
                    </Modal>
                )
            }
        </>
    )
}

export default ExpandableLayerGroup;