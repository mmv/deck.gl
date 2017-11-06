/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import {csv as requestCsv} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoibW12IiwiYSI6ImNqOW42OWNjODIzMDIyd212azFjYzh5MnkifQ.ORXZ0B3ISwLEQ4jt6_2rhw";

// Source data CSV
// const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';  // eslint-disable-line
const DATA_URL = 'IMSI_porHora_porCellID_27Out_Lisboa_2.csv';  // eslint-disable-line


function parseResponse(response) {

  var perDay = {};

  response.forEach(function (d) {
    var count = +d["_c0"];
    var date = d["_c1"];
    var dateValues = perDay[date] || [];

    for (var i = 0; i < Math.sqrt(count * 10) | 0; i++) {
      dateValues.push([
        +d["t2.site_lookup_concelhoscentroide_longitude"],
        +d["t2.site_lookup_concelhoscentroide_latitude"],
      ]);
    }
    perDay[date] = dateValues;
  });
  
  return perDay;
}

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500,
        longitude: -9.184722,
        latitude: 38.713889,
        zoom: 11,
        elevationRange: [0, 50],
      },
      dkey: "5",
      data: null
    };

    requestCsv(DATA_URL, (error, response) => {
      if (error) {
        return;
      }
      const data = parseResponse(response);
      this.setState({data: data});
    });

  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    window.setdkey = newkey => this.setState({dkey: newkey});
    this._resize();

  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const {viewport, data, dkey} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGLOverlay
          viewport={viewport}
          radius={100}
          data={data && data[dkey] || []}
        />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
