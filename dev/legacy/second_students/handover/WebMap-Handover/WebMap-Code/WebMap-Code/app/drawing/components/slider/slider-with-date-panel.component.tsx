// Import various things from React
import React, { useState, useRef, useEffect } from "react"; 
// Import moment for date manipulation
import moment from "moment";
// Import the stuff for the blue box in the bottom right of the map screen that displays the date
import DatePanelComponent from "./date-panel/date-panel.component";
// Import CSS
import "@/app/slider-timeline-date.css";

// Custom debounce definition
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Define the type with one field -- callback, which is a function that takes a moment.Moment or null and returns void
type SliderWithDatePanelProps = {
  callback: (date: moment.Moment | null) => void;
};

// ---------------------------------------- Main Function ----------------------------------------

// props is the parameter that is passed with a type of SliderWithDatePanelProps
const SliderWithDatePanel: React.FC<SliderWithDatePanelProps> = (props) => {

  // ---------------------------------------- useState variables ----------------------------------------

  // Variable for tracking the date set by the user -- default
  const [currDate, setCurrDate] = useState<moment.Moment | null>(moment("1900-01-01", "YYYY-MM-DD"));
  // Essentially a numerical value for where the slider button is
  const [sliderValue, setSliderValue] = useState<number>(0);
  // Whether the user is dragging the slider button or not
  const [isDragging, setIsDragging] = useState<boolean>(false);
  // The time slider shows "TIME SLIDE" until the user moves it
  const [showTimeSlideText, setShowTimeSlideText] = useState<boolean>(true);
  // The slider button starts off as gray
  const [sliderColor, setSliderColor] = useState<string>("#555555");
  // The color starts off as a more pale blue, but on hover changes to a darker blue
  const [timelineColor, setTimelineColor] = useState<string>("rgb(209, 236, 255)");
  // Construct the div element for the slider button
  const sliderRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------- static variables ----------------------------------------

  // Static variables for dates (based on the original MENY site)
  const minYear = 1850;
  const maxYear = 1950;
  const totalYears = maxYear - minYear + 1;
  const totalDaysInYear = 365; 

  // Static variable for moving the slider button
  const totalSliderSteps = totalYears * totalDaysInYear;

  // Form a date-like value based on the position of the slider button
  const calculateSliderPosition = (date: moment.Moment) => {
    const year = date.year();
    const dayOfYear = date.dayOfYear();
    const yearOffset = year - minYear; 
    return (yearOffset * totalDaysInYear) + dayOfYear;
  };

  // Set the original slider position to the very middle of the timeline
  const middleYear = Math.floor((minYear + maxYear) / 2);
  const middleDate = moment(`${middleYear}-01-01`, "YYYY-MM-DD"); 
  const middleSliderPosition = calculateSliderPosition(middleDate);

  // Variables for calculating the timeline labels
  var sliderStart: number = moment("1850-01-01", "YYYY-MM-DD").unix();
  var sliderEnd: number = moment("1950-01-01", "YYYY-MM-DD").unix();
    
  var ruler_step: number = (sliderEnd - sliderStart) / 10,
  date_ruler1: number = sliderStart + ruler_step,
  date_ruler2: number = sliderStart + ruler_step * 3,
  date_ruler3: number = sliderStart + ruler_step * 5,
  date_ruler4: number = sliderStart + ruler_step * 7,
  date_ruler5: number = sliderStart + ruler_step * 9; 

  // ---------------------------------------- DATE function variables ----------------------------------------

  // Parse the position of the slider button to get the date
  const updateDate = (position: number) => {
    // Adding day of year doesn't change the year itself
    const yearOffset = position / totalDaysInYear;
    // Given the offset, calculate the actual year value
    const newYear = minYear + Math.floor(yearOffset);
    const dayOfYear = Math.round((yearOffset % 1) * totalDaysInYear);
    
    // Check if the date is the max date or not
    const newDate = newYear === maxYear 
      ? moment("1950-01-01", "YYYY-MM-DD") 
      : moment().year(newYear).dayOfYear(Math.min(dayOfYear, totalDaysInYear));

    // Set the current data and trigger a callback
    setCurrDate(newDate);
    props.callback(newDate);
  };

  // ---------------------------------------- TIMELINE CLICK function variables ----------------------------------------

  // When the timeline is clicked and just released, move the slider button to that position
  const handleTimelineClick = (e: React.MouseEvent) => {
    // Basically if "TIME SLIDE" is showing, hide it
    if(showTimeSlideText) {
      setShowTimeSlideText(false);
    }

    // Move the slider based on that click
    const slider = sliderRef.current;
    if (slider) {
      const rect = slider.getBoundingClientRect();

      // first param is x position of mouse, second is width of slider
      moveSlider(e.clientX - rect.left, rect.width);
    }
  };

  // ---------------------------------------- SLIDER DRAGGED function variables ----------------------------------------

  // Move the slider button based on the position of it
  const moveSlider = (positionX: number, sliderWidth: number) => {
    let position: number = Math.min((positionX / sliderWidth) * totalSliderSteps, totalSliderSteps - 1);
    position = Math.max(position, 0);

    // After calculating position, update it
    setSliderValue(position);

    // Using the position, update the date
    updateDate(position); 
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Basically if "TIME SLIDE" is showing, hide it
    if(showTimeSlideText) {
      setShowTimeSlideText(false);
    }

    // If the button is down, the slider button is being dragged (most liekely, but behavior is same regardless)
    setIsDragging(true);

    // Move the slider based on the initial click
    const slider = sliderRef.current;
    if (slider) {
      const rect = slider.getBoundingClientRect();

      // first param is x position of mouse, second is width of slider
      moveSlider(e.clientX - rect.left, rect.width);
    }
  };

  // Controls the update of the date via dragging the slider (updates every 6ms)
  const throttledMoveSlider = debounce((e: MouseEvent) => {

    // Move the slider based on the mouse dragging
    if (isDragging && sliderRef.current) {
      const slider = sliderRef.current;
      const rect = slider.getBoundingClientRect();
      moveSlider(e.clientX - rect.left, rect.width);
    }
  }, 6); 

  // When the mouse is released, the slider button is no longer being dragged
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ---------------------------------------- useEffects ----------------------------------------

  // When the mouse is being dragged, you need to have listeners for it being moved or the mouse being released
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", throttledMoveSlider);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", throttledMoveSlider);
    };
  }, [isDragging]);

  // Whenever the slider position has changed, update the necessary values
  useEffect(() => {
    setSliderValue(middleSliderPosition); 
    updateDate(middleSliderPosition); 
  }, [middleSliderPosition]);

  // ---------------------------------------- CSS event variables ----------------------------------------

  // The 4 functions below deal with the CSS of the timline and slider button when hovered over
  const hoverTimeline = () => {
    setTimelineColor("rgb(186, 221, 249)");
    setSliderColor("red");
  };

  const offHoverTimeline = () => {
    setTimelineColor("rgb(209, 236, 255)");
    setSliderColor("#555555");
  };

  const hoverSlider = () => {
    setTimelineColor("rgb(209, 236, 255)");
    setSliderColor(isDragging ? "#f58400" : "#087CA4");
  };

  const offHoverSlider = () => {
    setTimelineColor(isDragging ? "rgb(209, 236, 255)" : "rgb(186, 221, 249)");
    setSliderColor(isDragging ? "#f58400" : "red");
  };

  // ---------------------------------------- Return Statement ----------------------------------------

  return (
    <div>
      {/* The blue box in the bottom right of the map screen that displays the date */}
      <DatePanelComponent currDate={currDate} />

      {/* The whole bottom part -- the timeline */}
      <div id="footer"
        onMouseEnter={hoverTimeline}
        onMouseLeave={offHoverTimeline}
      >
        <div id="slider"
          style={{
            backgroundColor: timelineColor 
          }}
        >
          <div className="timeline" onClick={handleTimelineClick}>
            {/* Tick #1 */}
            <div className="year">
              <span id="ruler-date1">{ moment.unix(date_ruler1).year() ?? '...' }</span>
              <span className="timeline-ruler"></span>
            </div>
            {/* Tick #2 */}
            <div className="year">
              <span id="ruler-date2">{ moment.unix(date_ruler2).year() ?? '...' }</span>
              <span className="timeline-ruler"></span>
            </div>
            {
              showTimeSlideText ? 
              (
                <div className="year">
                  <span id="ruler-date3">&nbsp;  ⇦ &nbsp; TIME &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; SLIDE &nbsp; ⇨ &nbsp; &nbsp; &nbsp; &nbsp;</span>
                  <span className="timeline-ruler"></span>
                </div>
              )
              : // If the time slider has been moved, "TIME SLIDE" text will be hidden and replaced with the middle year
              (
                <div className="year">
                  <span id="ruler-date3">{ moment.unix(date_ruler3).year() ?? '...' }</span>
                  <span className="timeline-ruler"></span>
                </div>
              )
            }
            {/* Tick #4 */}
            <div className="year">
              <span id="ruler-date4">{ moment.unix(date_ruler4).year() ?? '...' }</span>
              <span className="timeline-ruler"></span>
            </div>
            {/* Tick #5 */}
            <div className="year">
              <span id="ruler-date5">{ moment.unix(date_ruler5).year() ?? '...' }</span>
              <span className="timeline-ruler"></span>
            </div>
          </div>
        </div>

        {/* The slider button itself */}
        <div
          id="horizontal-slider"
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          className="slider-container-horizontal"
        >
          {/* I believe this is not utilized, therefore useless */}
          {/* <div className="slider-track-horizontal"></div> */}

          {/* The style of the button slider */}
          <div
            className="slider-handle-horizontal"
            style={{ 
              left: `${(sliderValue / totalSliderSteps) * 100}%`, 
              backgroundColor: sliderColor 
            }} 
            onMouseEnter={hoverSlider} 
            onMouseLeave={offHoverSlider} 
          ></div>
        </div>
      </div>
    </div>
  );
};

// Return the div element
export default SliderWithDatePanel;