const baseMaps = [
  {
    id: "cmmdxrf57001901qserwbevvc",
    name: "Satellite",
    infoId: "satellite-info",
    lChecked: true,
    rChecked: false,
  },
  {
    id: "cmmlhhgbj00c701s915u3f0nr",
    name: "Streets",
    infoId: "streets-info",
    lChecked: false,
    rChecked: true,
  },
  {
    type: "group",
    label: "Sanborn Maps",
    collapsed: false,
    maps: [
      {
        id: "cmpc050c800am01scdelrhdw8",
        name: "1961 Sanborn Map Downtown",
        infoId: "sanborn-1961-info",
        lChecked: false,
        rChecked: true,
        zoomCenter: [-93.612528, 42.026315],
        zoomLevel: 16.62,
      },
    ],
  },
  // White base map disabled: layers don't move with time slider and all features appear at once
  // {
  //   id: "cmmm8g6g6005n01s81mw20crn",
  //   name: "White",
  //   lChecked: false,
  //   rChecked: false,
  // },
];

const mapConfig = {
  style: "mapbox://styles/nittyjee/cjg705tp9c5xw2rlhsukbq0bs",
  center: [-93.63661, 42.03112],
  zoom: 13.63,
};