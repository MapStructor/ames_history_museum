import { GenericPopUpProps } from "@/app/models/popups/pop-up.model";
import { useState, useEffect } from "react";

const SliderPopUp = (props: GenericPopUpProps) => {
    const [renderedEntities, setRenderedEntities] = useState<{ nid: number | string, content: string }[]>([]);
    const [lastNid, setLastNid] = useState<number | string | null>(null); // Track the last added pop-up

    const nid: number | string | null = props.nid ?? null;

    useEffect(() => {
        if (nid && nid !== lastNid) {  
            fetch(`https://encyclopedia.nahc-mapping.org/rendered-export-single?nid=${nid}`)
                .then((buffer) => buffer.json())
                .then((res) => {
                    const newEntity = { nid, content: res[0].rendered_entity };

                    setRenderedEntities((prevEntities) => {
                        if (props.type === "blue") {
                            // ✅ Fix: When an event is clicked, clear all land grant pop-ups and show only the event
                            return [newEntity];
                        }
                        // ✅ Fix: Insert new land grant pop-ups at the TOP, ensuring no duplicate additions
                        return [newEntity, ...prevEntities.filter(e => e.nid !== nid)];
                    });

                    setLastNid(nid); // Update last added pop-up
                })
                .catch((error) => {
                    console.error("Error fetching pop-up data:", error);
                });
        }
    }, [nid, props.type, lastNid]);

    return (
        <div id="rightInfoBar" className="rightInfoBarBorder">
            {renderedEntities.map((entity) => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(entity.content, 'text/html');

                // Modify links to open in a new tab
                let prefix = "https://encyclopedia.nahc-mapping.org";
                let pattern = /(<a\s+href=")([^"]+)(")/g;
                let modifiedHtmlString = "<h3 id='popupHeader'>" + props.layerName + "</h3><hr><br/>";

                modifiedHtmlString += doc.body.innerHTML
                    .replace(pattern, (_: any, p1: any, p2: any, p3: any) => {
                        if (p2.slice(0, 4) === "http") return p1 + p2 + p3;
                        return p1 + prefix + p2 + p3;
                    })
                    .replace(/(<a\s+[^>]*)(>)/g, (_: any, p1: any, p2: any) => p1 + ' target="_blank"' + p2)
                    .replace(/(<img.*src=")([^"]+)(")/g, (_: any, p1: any, p2: any, p3: any) => {
                        if (p2.slice(0, 4) === "http") return p1 + p2 + p3;
                        return p1 + prefix + p2 + p3;
                    });

                return (
                    <div key={entity.nid} className="popup-container">
                        <div id={props.type + "SliderPopup"} dangerouslySetInnerHTML={{ __html: modifiedHtmlString }} />
                    </div>
                );
            })}
        </div>
    );
};

export default SliderPopUp;
