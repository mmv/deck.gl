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
    var dateValues = perDay[date] || {};

    var lat = d["t2.site_lookup_concelhoscentroide_latitude"];
    var lng = d["t2.site_lookup_concelhoscentroide_longitude"];
    var skey = `${lng},${lat}`;

    dateValues[skey] = {
      count: count,
      coord: [lng, lat],
    }

    perDay[date] = dateValues;
  });
  
  return perDay;
}

function buildDay(perDay, dkey) {
  var dayData = perDay[dkey];
  return Object.keys(dayData).map(key => {
    var cellData = dayData[key];
    var ccount = cellData.count;
    var r = new Array(ccount);
    for (var c = 0; c < ccount; c++) {
      r[c] = cellData.coord;
    }
    return r;
  }).reduce((a,b) => a.concat(b), []);
}

function betweenDays(perDay, dk1, dk2, pc) {
  var dayData = perDay[dk2];
  var prevDayData = perDay[dk1];
  return Object.keys(dayData).map(key => {
    var cellData = dayData[key];
    var pcellData = prevDayData[key];
    var ccount = cellData.count;
    ccount = (ccount - (ccount - (pcellData && pcellData.count || 0)) * (1 - pc)) | 0;
    var r = new Array(ccount);
    for (var c = 0; c < ccount; c++) {
      r[c] = cellData.coord;
    }
    return r;
  }).reduce((a,b) => a.concat(b), []);
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
      dkey: "0",
      fullData: null,
      curData: null,
    };

    requestCsv(DATA_URL, (error, response) => {
      if (error) {
        return;
      }
      const data = parseResponse(response);
      this.setState({fullData: data, curData: buildDay(data, this.state.dkey)});
    });

  }

  transitionDay(newDay) {
    var pc = 0;
    var iterate = () => {
      console.log(pc, this.state.curData.length);
      pc += 0.1;
      if (pc < 1) {
        this.setState({curData: betweenDays(this.state.fullData, this.state.dkey, newDay, pc)})
        setTimeout(iterate, 100);
      } else {
        pc = 1;
        this.setState({curData: buildDay(this.state.fullData, newDay), dkey: newDay});
      }
    }
    iterate();
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    // window.setdkey = newkey => this.setState({dkey: newkey});
    window.ctransition = newkey => this.transitionDay(newkey);
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
    const {viewport, curData, dkey} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGLOverlay
          viewport={viewport}
          radius={200}
          data={curData || []}
        />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
