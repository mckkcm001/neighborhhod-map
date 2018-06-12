import React, { Component } from 'react'
import logo from './logo.svg'
import logo1 from './logo1.svg'

/*
 * This component has the heading and the select and clear icons.
 */
class Header extends Component {
  render() {
    return (
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          alt="search button"
          onClick={this.props.searchToggle}
        />
        <span className={this.props.appState.iconClass}>Click to close</span>
        <h1 className="App-title">California Counties</h1>
        <span className={this.props.appState.clearClass}>Clear markers</span>
        <img
          src={logo1}
          className="App-logo1"
          alt="clear button"
          onClick={this.props.clearMarkers}
        />
      </header>
    )
  }
}

export default Header
