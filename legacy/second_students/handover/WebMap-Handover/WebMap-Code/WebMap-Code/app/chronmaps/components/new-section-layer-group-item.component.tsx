import { useEffect, useState } from "react";
import Modal from 'react-modal';
import LayerForm from './forms/LayerForm';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";

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

    useEffect(() => {
        const isAuthed: boolean = (props.authToken ?? '') !== '';
        const inPreviewMode: boolean = props.inPreviewMode ?? false;
        setShowEditorOptions(isAuthed && !inPreviewMode);
    }, [props.authToken, props.inPreviewMode]);

    const openChoiceModal = () => {
        props.beforeOpen();
        setShowChoiceModal(true);
    }

    const closeAllModals = () => {
        setShowChoiceModal(false);
        setShowFormModal(false);
        props.afterClose();
    }

    const handleImportLayer = () => {
        setShowChoiceModal(false);
        setShowFormModal(true);
    }

    const handleDrawLayer = () => {
        alert("Draw Layer is not implemented yet.");
    }

    Modal.setAppElement('#app-body-main');

    return (
        <>
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

            {/* Actual Form Modal */}
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
                    afterSubmit={closeAllModals}
                />
            </Modal>
        </>
    );
}

export default NewSectionLayerGroupItem;
