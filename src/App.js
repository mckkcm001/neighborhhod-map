import React, { Component } from 'react'
import Header from './Header'
import Search from './Search'
import './App.css'
import geocodes from './geocodes'

const loadGoogleMapsApi = require('load-google-maps-api')

class App extends Component {
  /*
   * Storage for things needed from one render to the next.
   * selected--stores county selected from list for updating geocode window
   * counties--stores info about counties (more detail below)
   * searchClass and iconClass--for controlling presence of list view and button
   * gmap--keep track of map as changes are madeto it
   */
  state = {
    selected: '',
    counties: {},
    searchClass: 'search-counties',
    iconClass: 'icon-text-hidden',
    gmap: '',
  }

  /*
   * This function closes infowindows and stops marker animations
   */
  clearDisplay = () => {
    let newState = this.state
    Object.keys(newState.counties).forEach(county => {
      newState.counties[county].marker.setAnimation(null)
      newState.counties[county].infoWindow.close()
    })
    this.setState({ newState })
  }
  /*
   * This function is called when the user enters text in the search box.
   * The Search component filters the list of counties to ones that
   * match the input string and passes the list up to this function to
   * store it in the app state. Only the matching map markers are set
   * to the map. The Search component will only show the counties with
   * showMarker set to true.
   */
  updateCounties = (matches) => {
    let newState = this.state
    this.clearDisplay()

    Object.keys(newState.counties).forEach(county => {
      if (newState.counties[county].marker) {

        if (!matches.includes(county)){
          newState.counties[county].showMarker = false
          newState.counties[county].marker.setMap(null)
        }
        else {
          newState.counties[county].showMarker = true
          newState.counties[county].marker.setMap(newState.gmap)
        }
      }
    })
    if (!matches.includes(newState.selected)){
      newState.selected = ''
    }
    this.setState({ newState })
  }

  /*
   * This function is called when the user selects a county in the list view.
   * If on a mobile device, the list view will go off screen to allow user
   * interaction with the map. Selecting a county displays geocode information
   * below the list view and animates the corresponding marker.
   */
  onCountySelect = (event) => {
    const county = event.target.value
    let newState = this.state
    this.clearDisplay()

    if (newState.counties[county].marker) {
      newState.counties[county].marker.setAnimation(window.google.maps.Animation.BOUNCE)
      newState.selected = county
    }

    newState.searchClass = 'search-counties'
    newState.iconClass = 'icon-text-hidden'
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
   * Function to alert API failure
   */
  gm_authFailure(){
    window.alert("Authentication error. Check API keys");
  }

  /*
   * Once the app has loaded, it is safe to put a Google map in a div.
   * The census data and the Google API are loaded with Promise.all so that
   * both are available before making map markers and infowindows.
   */
  componentDidMount = () => {
    // mount failure function to global object
    window.gm_authFailure = this.gm_authFailure;

    Promise.all([
      // get census data
      fetch('https://api.census.gov/data/2016/pep/population?get=POP,DENSITY,GEONAME&for=COUNTY:*&in=STATE:06&key=bf8c2ecb91514d76a405e220207ebad3d9f6ca3a')
      .then(result => {
        return result.json()
      })
      .then(data => {
        let newState = this.state
        data.slice(1).forEach(county => {
          let name = county[2].split(',')[0]
          // Structure of county object. Empty strings will be changed later.
          newState.counties[name] = {
            population: parseInt(county[0],10),
            density: Math.round(parseFloat(county[1])),
            area: Math.round(parseInt(county[0],10)/parseFloat(county[1])),
            showMarker: true,
            marker: '',
            infoWindow: '',
            location:'',
            bounds: '',
          }
        })
        this.setState({ newState })
        return 'Census data loaded'
      })
      .catch(() => {
        alert('Census data failed to load')
        return 'Census data failed to load'
      }),
      // load google maps at same time
      loadGoogleMapsApi({key: 'AIzaSyArLMO3f47kZl8kHPU_oHLHAuSXzob6_eI',libraries:['geometry']})
      .then(result => {
        return 'Google maps loaded'
      })
      .catch(() => {
        alert('Google maps failed to load')
        return 'Google maps failed to load'
      })
    ]) // end of Promise.all--census data and google maps are loaded
    .then(result => {
      //set up geocoder
      return new window.google.maps.Geocoder()
    })
    // Now get geocodes for California
    .then(geocoder => {
      return new Promise((resolve,reject) => {
        geocoder.geocode({address: 'california'}, (results,status) => {
          if (status === window.google.maps.GeocoderStatus.OK) {
            resolve( results[0] )
          }
          else {
            reject('Geocoder failure!')
          }
        })
      })
    })
    // Now make map centered on california and add a kml layer of county lines
    .then(result => {
      let newState = this.state

      const gmap = new window.google.maps.Map(document.getElementById('map'), {
        center: result.geometry.location
      })
      gmap.fitBounds(result.geometry.bounds)

      const src = 'http://www.no5w.com/OverlayCaliforniaRev4.kml';
      new window.google.maps.KmlLayer(src, {
        suppressInfoWindows: true,
        preserveViewport: false,
        map: gmap
      })

      newState.gmap = gmap
      this.setState({ newState })
    })
    // Now get geocodes. Using the geocoder didn't work unless there was at least
    // 500 ms between requests, so switched to fetching, but for some reason, it usually
    // fails (only) on San Francisco.
    .then(result => {
      let newState = this.state
      let promises = Object.keys(this.state.counties).map(county => {
        return fetch('https://maps.googleapis.com/maps/api/geocode/json?address='+county+',california&key=AIzaSyArLMO3f47kZl8kHPU_oHLHAuSXzob6_eI')
        .then(result => {
          return result.json()
        })
        .then(geocode => {
          newState.counties[geocode.results[0].address_components[0].short_name].location = geocode.results[0].geometry.location
          newState.counties[geocode.results[0].address_components[0].short_name].bounds = geocode.results[0].geometry.bounds
          return geocode.results[0]
        })
        .catch(() => {
          return county+': geocode failed to load'
        })
      })
      this.setState({ newState })
      return Promise.all(promises)
    })
    // For somw reason, San Francisco did not load all the time so I made a json
    // backup file to fill in any counties that didn't get a geocode. :)
    .then(results => {
      let newState = this.state
      results.forEach(result => {
        if (typeof result ==='string'){
          console.log(geocodes[result.split(':')[0]])
          newState.counties[result.split(':')[0]] = geocodes[result.split(':')[0]]
        }
      })

      //used this to make a data file since Google geocoder was unreliable--just copied screen to geocodes.js file
      //document.write(JSON.stringify(newState.counties))

      // now set up markers and infowindows
      let that = this  // need reference to App in click function
      Object.keys(newState.counties).forEach(county => {
        if (newState.counties[county].location) {
          newState.counties[county].marker = new window.google.maps.Marker({
            map: newState.gmap,
            position: newState.counties[county].location,
          })
          const content = `<h3>${county}</h3>`+
                          `<p><b>Population:</b> ${Number(newState.counties[county].population).toLocaleString()}</p>`+
                          `<p><b>Area (sq mi):</b> ${Number(newState.counties[county].area).toLocaleString()}</p>`+
                          `<p><b>Density:</b> ${Number(newState.counties[county].density).toLocaleString()}</p>`+
                          `<h5>2016 US Census Data</h5>`

          newState.counties[county].infoWindow = new window.google.maps.InfoWindow({
            content: content
          })
          newState.counties[county].infoWindow.setZIndex(1000)  //tried to get infowindow on top of map elements
          newState.counties[county].marker.addListener('click', function() {
            that.clearDisplay()
            newState.counties[county].infoWindow.open(newState.gmap, newState.counties[county].marker)
          })
        }
      })
      this.setState({ newState })
    })
  }

  /*
   * I tried some of the google map api's and ended up just using the
   * load-google-maps-api. The header component has the search icon to the left
   * and the clear marker icon to the right. The search component appears on
   * the left and has a search box and scrollable list of counties. When user
   * clicks on a county in the list, geocode information appears at the bottom
   * of the list and the corresponding marker bounces. As user searches in
   * the textbox, the list and markers update. Clicking on a marker displays an
   * infowindow with census data.
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
