import { useState, useEffect } from "react";
import Modal from 'react-modal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";
import NewStandaloneLayerForm from "./forms/LayerForm";
import { SectionLayerItem } from "@/app/models/layers/layer.model";

type LayerFormButtonProps = {
    sectionLayerId: string,
    beforeOpen: () => void,
    afterClose: () => void,
    authToken: string,
    inPreviewMode: boolean
}

const NewStandaloneLayer = (props: LayerFormButtonProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showEditorOptions, setShowEditorOptions] = useState<boolean>(false);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);

    useEffect(() => {
        const isAuthed: boolean = (props.authToken ?? '') !== '';
        const inPreviewMode: boolean = props.inPreviewMode ?? false;
        setShowEditorOptions(isAuthed && !inPreviewMode);
    }, [props.authToken, props.inPreviewMode]);

    const openMainModal = () => {
        props.beforeOpen();
        setIsOpen(true);
    }

    const closeAllModals = () => {
        setShowFormModal(false);
        setIsOpen(false);
        props.afterClose();
    }

    const handleImportLayer = () => {
        setIsOpen(false);
        setShowFormModal(true);
    }

    const handleDrawLayer = () => {
        // Placeholder for draw layer logic
        alert("Draw Layer feature not yet implemented.");
    }

    Modal.setAppElement('#app-body-main');

    return (
        <>
            {showEditorOptions && (
                <div style={{ paddingTop: '5px', paddingLeft: '15px', paddingRight: '10px', textAlign: 'center' }}>
                    <button id='post-button' onClick={openMainModal}>
                        <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.PLUS_SQUARE, true)} /> New Standalone Layer
                    </button>
                </div>
            )}

            {/* Main modal with two options */}
            <Modal
                style={{
                    overlay: {
                        zIndex: "1000",
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: darken background
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
                isOpen={isOpen}
                onRequestClose={closeAllModals}
                contentLabel='New Standalone Layer Options'
            >
                <h3 style={{ marginBottom: '20px' }}>Select Layer Type</h3>
                <button
                    onClick={handleImportLayer}
                    style={{
                        display: 'block',
                        width: '100%',
                        marginBottom: '10px',
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                >
                    Add Tileset
                </button>
                <button
                    onClick={handleDrawLayer}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                >
                    Draw Layer
                </button>
            </Modal>


            {/* Import Layer form modal */}
            <Modal
                style={{
                    overlay: { zIndex: "1000" },
                    content: { width: '30%', right: '5px' }
                }}
                isOpen={showFormModal}
                onRequestClose={closeAllModals}
                contentLabel='Import Standalone Layer'
            >
                <NewStandaloneLayerForm
                    authToken={props.authToken}
                    standalone={true}
                    groupName={props.sectionLayerId}
                    sectionName={props.sectionLayerId}
                    afterSubmit={closeAllModals}
                    topLayerClass={props.sectionLayerId}
                />
            </Modal>
        </>
    )
}

export default NewStandaloneLayer;
