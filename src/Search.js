import React, { Component } from 'react'

class Search extends Component {
  /*
   * The state of this component is just the string entered by the user in the
   * search box
   */
  state = {
    query: ''
  }

  /*
   * This function is called when the user enters text in the search box.
   * The Search component filters the list of counties to ones that
   * match the input string and passes the list up to App component to
   * store it in the App state.
   */
  updateCounties = (match) => {
    let matches = Object.keys(this.props.appState.counties).filter(county =>
      county.toLowerCase().includes(match.toLowerCase())
    )
    this.setState({query: match})
    this.props.updateCounties(matches)
  }

  /*
   * This view consists of a text search box above a scrollable list
   * of counties. As each character is entered, the query string is saved
   * and the list updates and is stored in the viewCounties array. The
   * county names from the census include California, so that is stripped away.
   */
  render() {
    return (
      <div className={this.props.appState.searchClass}>
        <div className="search-counties-bar">
          <div className="search-counties-input-wrapper">
            <input
              tabIndex="0"
              contentEditable="true"
              aria-label="search-by-county"
              type="text"
              placeholder="Search by county"
              value={this.state.query}
              onChange={event => this.updateCounties(event.target.value)}
            />
          </div>
        </div>
        <div className="search-counties-results">
          <select
            tabIndex="0"
            aria-label="counties"
            className="counties-grid"
            onChange={this.props.onCountySelect}
            size="10"
          >
          {this.props.appState.counties !== {} && (
            Object.keys(this.props.appState.counties).map(county => (
              this.props.appState.counties[county].showMarker &&
                <option
                  tabIndex="0"
                  key={county}
                >
                  {county}
                </option>
              )
            )
          )}
          </select>
        </div>
        <div className="geocode-wrapper">
          {this.props.appState.selected &&
            <div className="geocode">
              <h4>{this.props.appState.selected}</h4>
              <p><b>Geocode</b></p>
              <p>Latitude: {this.props.appState.counties[this.props.appState.selected].location.lat}</p>
              <p>Longitude: {this.props.appState.counties[this.props.appState.selected].location.lng}</p>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default Search
