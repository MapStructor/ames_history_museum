// The div generator for the blue box in the bottom right of the map screen that displays the date of the timeline

// Object structure -- only has 1 property, currDate, which is used for displaying the timeline date (gets the moment for the date)
type DatePanelComponentProps = {
    currDate: moment.Moment | null;
}

// Div portion of the file
const DatePanelComponent = (props: DatePanelComponentProps) => {
    return (
        <div id="datepanel">
            <b><span id="date" style={{fontSize: "31px"}}>{props.currDate ? props.currDate.format("DD MMM YYYY") : ""}</span></b>
        </div>
    )
}

// Return the div
export default DatePanelComponent