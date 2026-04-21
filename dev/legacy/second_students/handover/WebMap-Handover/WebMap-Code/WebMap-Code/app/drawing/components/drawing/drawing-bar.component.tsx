import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDrawPolygon, faLocationPin, faSlash, faUndo, faRedo } from "@fortawesome/free-solid-svg-icons"; // Import icons for polygon, point, line, undo, and redo

//type DrawingBarComponentProps = {};

const DrawingBarComponent = (props: undefined) => {
    const [selectedColor, setSelectedColor] = useState("#FF0000"); // Default color is red
    const [transparency, setTransparency] = useState(1); // Default transparency is 1 (fully opaque)
    const [showPicker, setShowPicker] = useState(false); // Toggle visibility of the color picker and transparency slider
    const [drawType, setDrawType] = useState("point"); // Default draw type is point
    const colorPickerRef = useRef<HTMLDivElement>(null); // Reference to the color picker container

    // Close the color picker and transparency slider when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowPicker(false); // Hide the color picker and transparency slider
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Define the options with icons and labels
    const drawOptions = [
        { value: "point", label: "Point", icon: faLocationPin },
        { value: "line", label: "Line", icon: faSlash },
        { value: "polygon", label: "Polygon", icon: faDrawPolygon },
    ];

    // Get the selected option
    const selectedOption = drawOptions.find((option) => option.value === drawType);

    return (
        <div
            id="drawingbar"
            style={{
                display: "none",    //display: "flex",
                width: "500px",
                height: "50px",
                backgroundColor: "#fff",
                border: "2px solid #af681d",
                borderRadius: "8px",
                justifyContent: "space-around", // Space out the elements evenly
                alignItems: "center",
                color: "black",
                fontSize: "16px",
                fontWeight: "bold",
            }}
        >
            {/* Undo Button */}
            <button
                onClick={() => console.log("Undo clicked")}
                style={{
                    width: "35px",
                    height: "35px",
                    border: "1px solid #000",
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <FontAwesomeIcon icon={faUndo} style={{ fontSize: "20px" }} />
            </button>

            {/* Redo Button */}
            <button
                onClick={() => console.log("Redo clicked")}
                style={{
                    width: "35px",
                    height: "35px",
                    border: "1px solid #000",
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <FontAwesomeIcon icon={faRedo} style={{ fontSize: "20px" }} />
            </button>

            {/* Color Picker */}
            <div
                ref={colorPickerRef} // Attach the ref to the color picker container
                style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <div
                    onClick={() => setShowPicker(!showPicker)} // Toggle visibility of the picker
                    style={{
                        width: "35px",
                        height: "35px",
                        backgroundColor: `rgba(${parseInt(selectedColor.slice(1, 3), 16)}, ${parseInt(
                            selectedColor.slice(3, 5),
                            16
                        )}, ${parseInt(selectedColor.slice(5, 7), 16)}, ${transparency})`, // Apply transparency
                        border: "1px solid #000",
                        borderRadius: "4px",
                        cursor: "pointer",
                        position: "relative",
                    }}
                >
                    <input
                        id="color-picker"
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            width: "100%",
                            height: "100%",
                            opacity: "0",
                            cursor: "pointer",
                        }}
                    />
                </div>
                {showPicker && (
                    <div
                    style={{
                        position: "absolute",
                        top: "285px", // Position below the color picker
                        left: "0px",   //even tho it doesn't go anywhere need to set this for it to display correctly
                        width: "233px", // Match the width of the color picker
                        height: "30px",
                        backgroundColor: "#fff",
                        border: "1px solid #000",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                    }}
                    >
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={transparency}
                            onChange={(e) => setTransparency(parseFloat(e.target.value))}
                            style={{
                                width: "90%",
                                cursor: "pointer",
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Draw Type Dropdown */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #000",
                    borderRadius: "4px",
                    padding: "5px",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    position: "relative",
                    width: "35px",
                    height: "35px",
                    justifyContent: "center",
                }}
            >
                {selectedOption && (
                    <FontAwesomeIcon
                        icon={selectedOption.icon}
                        style={{ fontSize: "20px" }}
                    />
                )}
                <select
                    id="draw-type"
                    value={drawType}
                    onChange={(e) => setDrawType(e.target.value)}
                    style={{
                        outline: "none",
                        fontSize: "14px",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        appearance: "none", // Hide default dropdown arrow
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        opacity: "0", // Make the native dropdown invisible
                    }}
                >
                    {drawOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default DrawingBarComponent;