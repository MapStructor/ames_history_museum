import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper"
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model"
import { MapItem, MapZoomProps } from "@/app/models/maps/map.model"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import Modal from 'react-modal';


type MapFilterComponentProps = {
    map: MapItem,
    displayZoomButton: boolean,
    displayInfoButton: boolean,
    displayEditButton: boolean,
    beforeMapCallback: (map: MapItem) => void,
    afterMapCallback: (map: MapItem) => void,
    mapZoomCallback: (zoomProps: MapZoomProps) => void,
    beforeOpen: () => void,
    afterClose: () => void,
    mapEditFormCallback: (visible: boolean) => void,
    fetchMapCallback: (id: string) => void,
    authToken: string,
    showEditorOptions: boolean,
}

const MapFilterComponent = (props: MapFilterComponentProps) => {
    const [modalHeaderText, setModalHeaderText] = useState<string>('');
    const [modalBodyText, setModalBodyText] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const closeWindow = () => {
        props.afterClose()
        setModalOpen(false)
    }

    useEffect(() => {
        if(props.map.infoId != null && props.map.infoId.length > 0) {
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
                                let modalHeader: string = jsonResult.find(x => x.id == props.map.infoId)?.title.replace('\u0026amp;', '&') ?? '';
                                // OLD IMPLTEMENTATION - Bug with "Orignial Grants &amp; Farms, Stokes 1914-1916"
                                //let modalHeader: string = jsonResult.find(x => x.id == props.map.infoId)?.title ?? '';

                                let modalBody: string = jsonResult.find(x => x.id == props.map.infoId)?.body ?? '';
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

    useEffect(() => {
        console.log(modalHeaderText, modalBodyText)
    }, [modalBodyText, modalHeaderText])

    return (
        <>
            <div className="layer-list-row">
                <input
                    className={props.map.mapId}
                    type="radio"
                    name="ltoggle"
                    onClick={() => props.beforeMapCallback(props.map)}
                    value={props.map.mapId}
                    style={{
                        margin: "2px",
                        marginRight: "8px",
                    }}
                />
                <input
                    className={props.map.mapId}
                    type="radio"
                    name="rtoggle"
                    onClick={() => props.afterMapCallback(props.map)}
                    value={props.map.mapId}
                />
                &nbsp; &nbsp;
                <label htmlFor={props.map.mapId}>
                    { props.map.name }
                    <div className="dummy-label-layer-space"></div></label>
                <div className="layer-buttons-block">
                    <div className="layer-buttons-list">
                            {
                                props.showEditorOptions && props.displayEditButton && (
                                    <div className="tooltip-container" data-title="Edit Map">
                                        <FontAwesomeIcon
                                            className="edit-button"
                                            color="black"
                                            icon={getFontawesomeIcon(FontAwesomeLayerIcons.PEN_TO_SQUARE)}
                                            onClick={() => {
                                                props.beforeOpen();
                                                props.fetchMapCallback(props.map.id ?? "");
                                                props.mapEditFormCallback(true);
                                            }}
                                            style={{
                                                paddingLeft: "10px"
                                            }}/>
                                        </div>
                                    )
                                }
                            {
                            props.displayZoomButton &&
                            (
                                <div className="tooltip-container" data-title="Zoom to Map">
                                    <FontAwesomeIcon
                                    className="zoom-to-layer"
                                    title="Zoom to Layer"
                                    color="blue"
                                    icon={getFontawesomeIcon(FontAwesomeLayerIcons.CROSSHAIRS)}
                                    onClick={() => {
                                        props.mapZoomCallback({
                                            center: props.map.center ?? undefined,
                                            zoom: props.map.zoom,
                                            speed: 0.2,
                                            bearing: props.map.bearing ?? 0,
                                            curve: 1,
                                            duration: 2500,
                                        })
                                    }}
                                    />
                                </div>
                            )
                        }
                        {
                            !props.displayZoomButton &&
                            (
                                <i style={{width: "16px"}}></i>
                            )
                        }
                        {
                            (modalHeaderText.length > 0 && modalBodyText.length > 0) &&
                            (
                                <div className="tooltip-container" data-title="Map Info">
                                    <FontAwesomeIcon
                                    className="layer-info trigger-popup"
                                    color="grey"
                                    icon={getFontawesomeIcon(FontAwesomeLayerIcons.INFO_CIRCLE)}
                                    onClick={() => setModalOpen(true)} // Edit This to pull up a modal
                                    />
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
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
                                maxWidth: '90vw',
                                height: 'fit-content',
                                maxHeight: '75vh',
                                outline: 'none',
                            }
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

export default MapFilterComponent