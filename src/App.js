import React, { Component } from 'react'
import Header from './Header'
import Search from './Search'
import './App.css'
const loadGoogleMapsApi = require('load-google-maps-api')

class App extends Component {
  /*
   * Storage for things needed from one render to the next.
   */
  state = {
    markers: [],
    viewCounties: [],
    allCounties: [],
    searchClass: 'search-counties',
    iconClass: 'icon-text-hidden',
    clearClass: 'clear-text-hidden',
    gmap: '',
  }

  /*
   * This function is called when a marker is made to find the
   * location of the marker and the bounds of the county to
   * size the map.
   */
  getGeocode = (county) => {
    const geocoder = new window.google.maps.Geocoder()
    // make a copy of the state to accept state changes
    let newState = this.state

    geocoder.geocode({address: county+',california'}, (results,status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {

        newState.gmap.fitBounds(results[0].geometry.bounds)
        // find the county picked to get saved population information
        const countProp = this.state.allCounties.filter(c => {
          return c[2].split(',')[0] === county
        })
        // put population information in content
        const content = `<h3>${county}</h3>`+
                        `<p><b>Population:</b> ${Number(countProp[0][0]).toLocaleString()}</p>`+
                        `<p><b>Area (sq mi):</b> ${Number(Math.round(countProp[0][0]/countProp[0][1])).toLocaleString()}</p>`+
                        `<p><b>Density:</b> ${Number(Math.round(countProp[0][1])).toLocaleString()}</p>`+
                        `<h5>2016 US Census Data</h5>`

        const infowindow = new window.google.maps.InfoWindow({
          content: content
        })
        // drop the new marker onto the map
        const marker = new window.google.maps.Marker({
          map: newState.gmap,
          position: results[0].geometry.location,
          animation: window.google.maps.Animation.DROP
        })
        // open infowindow when marker clicked
        marker.addListener('click', function() {
          infowindow.open(newState.gmap, marker);
        })
        // put marker in state so it can be cleared later and reset state
        newState.markers.push(marker)
        this.setState({ newState })
      }
      else {
        alert('Geocoder failure!')
      }
    })
  }

  /*
   * This function is called when the user clicks the clear markers iconClass
   * The button label disappears, the markers are cleared, and the map is
   * recentered on California
   */
  clearMarkers = (event) => {
    let newState = this.state
    newState.clearClass = 'clear-text-hidden'
    newState.markers.map(marker => {
      return marker.setMap(null);
    })
    newState.markers = []
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({address: 'california'}, (results,status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        newState.gmap.fitBounds(results[0].geometry.bounds)
      }
      else {
        alert('Geocoder failure!')
      }
    })
    this.setState({ newState })
  }

  /*
   * This function is called when the user enters text in the search box.
   * The Search component filters the list of counties to ones that
   * match the input string and passes the list up to this function to
   * store it in the app state.
   */
  updateCounties = (matches) => {
    let newState = this.state
    newState.viewCounties = matches
    this.setState({ newState })
  }

  /*
   * This function is called when the user selects a county in the list view.
   * If on a mobile device, the list view will go off screen to allow user
   * interaction with the map.
   */
  onCountySelect = (event) => {
    this.getGeocode(event.target.value)
    let newState = this.state
    newState.searchClass = 'search-counties'
    newState.iconClass = 'icon-text-hidden'
    newState.clearClass = 'clear-text-visible'
    this.setState({ newState })
  }

  /*
   * This function is called when the search icon (hamburger) is clicked.
   * If the menu is off screen, it moves on screen.
   */
  searchToggle = (event) => {
    let newState = this.state
    if (this.state.searchClass === 'search-counties'){
      newState.searchClass = 'search-counties-open'
      newState.iconClass = 'icon-text-visible'
    }
    else {
      newState.searchClass = 'search-counties'
      newState.iconClass = 'icon-text-hidden'
    }
    this.setState({ newState })
  }

  /*
   * Once the app has loaded, it is safe to put a Google map in a div.
   * The census data and the Google API are loaded with Promise.all so that
   * both are available before making a map.
   */
  componentDidMount = () => {
    Promise.all([
      fetch('https://api.census.gov/data/2016/pep/population?get=POP,DENSITY,GEONAME&for=COUNTY:*&in=STATE:06&key=CENSUS_KEY')
      .then(res => res.json()
      )
      .then(data => {
        let newState = this.state
        newState.viewCounties = data.slice(1)
        newState.allCounties = data.slice(1)
        this.setState({ newState })
      })
      .catch(() => {
        alert('County data failed to load')
      }),
      loadGoogleMapsApi({key: 'GOOGLE_KEY',libraries:['geometry']})
      .catch(() => {
        alert('Google maps failed to load')
      })
    ])
    .then(res => {
      const gmap = new window.google.maps.Map(document.getElementById('map'), {
        center: {
          lat: 37,
          lng: -119
        },
      })

      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({address: 'california'}, (results,status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          gmap.fitBounds(results[0].geometry.bounds)
        }
      })

      const src = 'http://www.no5w.com/OverlayCaliforniaRev4.kml';
      new window.google.maps.KmlLayer(src, {
        suppressInfoWindows: true,
        preserveViewport: false,
        map: gmap
      })

      let newState = this.state
      newState.gmap = gmap
      this.setState({ newState })
    })
  }

  /*
   * I tried some of the google map api's and ended up just using the
   * load-google-maps-api. The header component has the search icon to the left
   * and the clear marker icon to the right. The search component appears on
   * the left and has a search box and scrollable list of counties.
   */
  render() {
    return (
      <div className="App" >
        <Header
          appState={this.state}
          searchToggle={this.searchToggle}
          clearMarkers={this.clearMarkers}
        />
        <Search
          appState={this.state}
          updateCounties={this.updateCounties}
          onCountySelect={this.onCountySelect}
        />
        <div
          id="map"
          style={{width:'100%', height:'90vh'}}
          role="application"
        >
        </div>
      </div>
    )
  }
}

export default App
