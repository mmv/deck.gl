/* global window */
import React, {Component} from 'react';
import DeckGL, {HexagonLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  // lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  // 38.3675/-8.6771
  lightsPosition: [-8.6771, 38.3675, 8000, -11.807751, 34.0675, 8000],  
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

// const colorRange = [
//   [1, 152, 189],
//   [73, 227, 206],
//   [216, 254, 181],
//   [254, 237, 177],
//   [254, 173, 84],
//   [209, 55, 78]
// ];

// const colorRange = [
//   [173, 216, 230],
//   [166, 205, 230],
//   [159, 193, 229],
//   [151, 178, 229],
//   [144, 161, 229],
//   [136, 142, 230],
//   [136, 128, 230],
//   [143, 120, 231],
//   [154, 112, 232],
//   [166, 104, 233],
//   [182, 95, 234],
//   [200, 86, 235],
//   [221, 77, 237],
//   [238, 68, 232],
//   [240, 59, 209],
//   [242, 50, 182],
//   [244, 40, 153],
//   [247, 30, 120],
//   [249, 20, 83],
//   [252, 10, 44],
//   [255, 0, 0]
// ]

const colorRangeBlueRed = [
  [173, 216, 230],
  [166, 205, 230],
  [159, 193, 229],
  [151, 178, 229],
  [144, 161, 229],
  [136, 142, 230],
  [136, 128, 230],
  [143, 120, 231],
  [154, 112, 232],
  [166, 104, 233],
  [182, 95, 234],
  [200, 86, 235],
  [221, 77, 237],
  [238, 68, 232],
  [240, 59, 209],
  [242, 50, 182],
  [244, 40, 153],
  [247, 30, 120],
  [249, 20, 83],
  [252, 10, 44],
  [255, 0, 0]
]

const colorRange = [
  [70, 130, 180],
  [67, 151, 184],
  [63, 174, 187],
  [60, 191, 183],
  [56, 195, 162],
  [53, 198, 139],
  [49, 202, 113],
  [46, 206, 85],
  [42, 210, 55],
  [56, 213, 39],
  [85, 217, 35],
  [116, 221, 32],
  [150, 225, 28],
  [186, 228, 25],
  [225, 232, 21],
  [236, 206, 18],
  [240, 170, 14],
  [244, 131, 11],
  [247, 90, 7],
  [251, 46, 4],
  [255, 0, 0]
]

const elevationScale = {min: 1, max: 50};

const defaultProps = {
  radius: 1000,
  upperPercentile: 100,
  coverage: 1
};

export default class DeckGLOverlay extends Component {

  static get defaultColorRange() {
    return colorRange;
  }

  static get defaultViewport() {
    return {
      longitude: -1.4157267858730052,
      latitude: 52.232395363869415,
      zoom: 10.6,
      minZoom: 5,
      maxZoom: 15,
      pitch: 40.5,
      bearing: -27.396674584323023
    };
  }

  constructor(props) {
    super(props);
    this.startAnimationTimer = null;
    this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.min
    };

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);

  }

  componentDidMount() {
    this._animate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
      this._animate();
    }
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _animate() {
    this._stopAnimate();

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }

  render() {
    const {viewport, data, radius, coverage, upperPercentile} = this.props;

    if (!data) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 50],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS,
        onHover: this.props.onHover,
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile
      })
    ];

    return <DeckGL {...viewport} layers={layers} initWebGLParameters />;
  }
}

DeckGLOverlay.displayName = 'DeckGLOverlay';
DeckGLOverlay.defaultProps = defaultProps;
