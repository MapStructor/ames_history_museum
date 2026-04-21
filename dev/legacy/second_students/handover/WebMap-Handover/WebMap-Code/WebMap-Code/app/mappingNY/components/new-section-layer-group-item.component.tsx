import { useEffect, useRef, useState } from "react";
import Modal from 'react-modal';
import LayerForm from './forms/LayerForm';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useMap } from "@/app/mappingNY/components/context/MapContext";

type LayerFormButtonProps = {
    groupName: string,
    sectionName: string,
    beforeOpen: () => void,
    afterClose: () => void,
    authToken: string,
    inPreviewMode: boolean,
    topLayerClass: string
}

const NewSectionLayerGroupItem = (props: LayerFormButtonProps) => {
    const [showEditorOptions, setShowEditorOptions] = useState<boolean>(false);
    const [showChoiceModal, setShowChoiceModal] = useState<boolean>(false);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [layerData, setLayerData] = useState<any>(null); // State to hold layer data for the form
    const drawRef = useRef<MapboxDraw | null>(null);
    const { beforeMap } = useMap();

    useEffect(() => {
        const isAuthed = (props.authToken ?? '') !== '';
        const inPreviewMode = props.inPreviewMode ?? false;
        setShowEditorOptions(isAuthed && !inPreviewMode);
    }, [props.authToken, props.inPreviewMode]);

    useEffect(() => {
        const map = beforeMap.current;
        if (!map) return;

        if (!drawRef.current) {
            drawRef.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    point: true,
                    line_string: true,
                    polygon: true,
                    trash: true
                }
            });
        }

        if (editMode) {
            if (!map.hasControl(drawRef.current)) {
                map.addControl(drawRef.current, "top-right");

                const savedFeatures = sessionStorage.getItem("drawFeatures");
                if (savedFeatures) {
                    const features = JSON.parse(savedFeatures);
                    drawRef.current.set(features);
                }
            }
        } else {
            if (map.hasControl(drawRef.current)) {
                const features = drawRef.current.getAll();
                if (features.features.length > 0) {
                    sessionStorage.setItem("drawFeatures", JSON.stringify(features));
                }
                map.removeControl(drawRef.current);
            }
        }
    }, [editMode, beforeMap]);

    const openChoiceModal = () => {
        props.beforeOpen();
        setShowChoiceModal(true);
    }

    const closeAllModals = () => {
        setShowChoiceModal(false);
        setShowFormModal(false);
        setEditMode(false);
        props.afterClose();
    }

    const handleImportLayer = () => {
        setShowChoiceModal(false);
        setShowFormModal(true);
    }

    const handleDrawLayer = () => {
        setShowChoiceModal(false);
        setEditMode(true); // Let useEffect handle draw setup
    }

    const handleSubmitDrawnFeatures = () => {
        if (drawRef.current) {
            const features = drawRef.current.getAll();
            console.log("🟢 Submitted GeoJSON features:", JSON.stringify(features));
            
            if (features.features.length === 0) {
                alert("No features to submit!");
                return;
            }

            // Prepare layer data with features as sourceUrl
            const newLayerData = {
                sourceType: "geojson",
                sourceUrl: JSON.stringify(features), // Pre-populate sourceUrl with features 
            };

            setLayerData(newLayerData); // Set the layer data for the form
            setShowFormModal(true); // Open the form modal
        }
    };

    Modal.setAppElement('#app-body-main');

    return (
        <>
            {/* Submit button (bottom-left) */}
            {editMode && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '1rem',
                        left: '1rem',
                        zIndex: 10001,
                    }}
                >
                    <button
                        onClick={handleSubmitDrawnFeatures}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f8f8f8',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        }}
                    >
                        Submit Drawn Features
                    </button>
                </div>
            )}

            {showEditorOptions && (
                <div style={{ paddingTop: '5px', paddingLeft: '15px', paddingRight: '10px', textAlign: 'center' }}>
                    <button id='post-button' onClick={openChoiceModal}>
                        <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.PLUS_SQUARE, true)} /> New Layer
                    </button>
                </div>
            )}

            {/* Choice Modal */}
            <Modal
                isOpen={showChoiceModal}
                onRequestClose={closeAllModals}
                contentLabel='New Layer Options'
                style={{
                    overlay: {
                        zIndex: "1000",
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    content: {
                        position: 'static',
                        inset: 'unset',
                        width: '300px',
                        padding: '20px',
                        borderRadius: '12px',
                        background: '#fff',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }
                }}
            >
                <h3 style={{ marginBottom: '20px' }}>Select Layer Type</h3>
                <button
                    onClick={handleImportLayer}
                    style={modalButtonStyle}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                >
                    Add Tileset
                </button>
                <button
                    onClick={handleDrawLayer}
                    style={modalButtonStyle}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                >
                    Draw Layer
                </button>
            </Modal>

            {/* Form Modal */}
            <Modal
                isOpen={showFormModal}
                onRequestClose={closeAllModals}
                contentLabel='New Layer'
                style={{
                    overlay: {
                        zIndex: "1000"
                    },
                    content: {
                        width: '30%',
                        right: '5px'
                    }
                }}
            >
                <LayerForm
                    authToken={props.authToken}
                    topLayerClass={props.topLayerClass}
                    groupName={props.groupName}
                    standalone={false}
                    sectionName={props.sectionName}
                    afterSubmit={() => {
                        closeAllModals(); // Close the modal
                        if (drawRef.current) {
                         drawRef.current.deleteAll(); // Clear all drawn features
                            }
                         }}
                    initialValues={layerData} 
                />
            </Modal>
        </>
    );
}

const modalButtonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
};

export default NewSectionLayerGroupItem;
