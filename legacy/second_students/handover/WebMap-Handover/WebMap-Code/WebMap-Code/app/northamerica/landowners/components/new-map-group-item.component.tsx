import { useContext, useEffect, useState } from "react";
import Modal from 'react-modal';
import LayerForm from './forms/LayerForm';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";
import MapForm from "./forms/MapForm";
type MapFormButtonProps = {
    authToken: string
    groupId: string,
    groupName: string,
    beforeOpen: () => void,
    afterClose: () => void,
    inPreviewMode: boolean
}

const NewMapGroupItem = (props: MapFormButtonProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showEditorOptions, setShowEditorOptions] = useState<boolean>(false);

    useEffect(() => {
        const isAuthed: boolean = (props.authToken ?? '') != '';
        const inPreviewMode: boolean = props.inPreviewMode ?? false;

        setShowEditorOptions(isAuthed && !inPreviewMode);
    }, [props.authToken, props.inPreviewMode])
    
    const openWindow = () => {
        props.beforeOpen()
        setIsOpen(true)
    }

    const closeWindow = () => {
        props.afterClose()
        setIsOpen(false)
    }

    // Necessary for the Modal to know what to hide
    Modal.setAppElement('#app-body-main');

    return (
        <>
            {
                showEditorOptions && (
                    <div style={{paddingTop: '5px', paddingLeft: '15px', paddingRight: '10px', textAlign: 'center'}}>
                        <button id='post-button' onClick={openWindow}>
                            <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.PLUS_SQUARE, true)}></FontAwesomeIcon> New Map
                        </button>
                    </div>
                )
            }
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
                isOpen={isOpen}
                onRequestClose={closeWindow}
                contentLabel='New Map'
            >
                <MapForm 
                    authToken={props.authToken} 
                    groupName={props.groupName} 
                    afterSubmit={() => {
                        props.afterClose();
                        setIsOpen(false);
                        }}>
                </MapForm>
            </Modal>
        </>
    )
}

export default NewMapGroupItem;