import { useState, useEffect } from "react";
import Modal from 'react-modal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FontAwesomeLayerIcons } from "@/app/models/font-awesome.model";
import { getFontawesomeIcon } from "@/app/helpers/font-awesome.helper";
import NewStandaloneLayerForm from "./forms/LayerForm";
import Layer from "./layers/layer.component"; // Import the Layer component
import { SectionLayerItem } from "@/app/models/layers/layer.model";

/*
    This is a new button compoent for the "New Standalone Layer" button. 
    This component will be used to create a new standalone layer.
    When clicked it opens the default layer form, and upon submission it will utilize
    the new StandaloneLayer API methods to post a layer with a default Standalone = true.
*/

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
    const [standAloneLayers, setStandAloneLayers] = useState<SectionLayerItem[]>([]); // Add state for standalone layers
    const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]);

    useEffect(() => {
        const isAuthed: boolean = (props.authToken ?? '') != '';
        const inPreviewMode: boolean = props.inPreviewMode ?? false;

        setShowEditorOptions(isAuthed && !inPreviewMode);
    }, [props.authToken, props.inPreviewMode])
    
    const openWindow = () => {
        props.beforeOpen();
        setIsOpen(true);
    }

    const closeWindow = () => {
        props.afterClose();
        setIsOpen(false);
    }

    // Necessary for the Modal to know what to hide
    Modal.setAppElement('#app-body-main');

    return (
        <>
            {
                showEditorOptions && (
                    <div style={{paddingTop: '5px', paddingLeft: '15px', paddingRight: '10px', textAlign: 'center'}}>
                        <button id='post-button' onClick={openWindow}>
                            <FontAwesomeIcon icon={getFontawesomeIcon(FontAwesomeLayerIcons.PLUS_SQUARE, true)}></FontAwesomeIcon> New Standalone Layer
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
                contentLabel='New Standalone Layer'
            >
                <NewStandaloneLayerForm 
                authToken={props.authToken} 
                standalone={true}
                groupName = {props.sectionLayerId} 
                sectionName = {props.sectionLayerId}  
                afterSubmit={closeWindow}
                topLayerClass= {props.sectionLayerId}
                >
                </NewStandaloneLayerForm>
            </Modal>
        </>
    )
}

export default NewStandaloneLayer;
