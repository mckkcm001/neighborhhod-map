import React, { Component } from 'react'
import logo from './logo.svg'

/*
 * This component has the heading and the select icon.
 * The selecticon disappears on larger screens and the
 * list of counties remains on the page
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

        <h1 className="App-title" tabIndex="0">California Counties</h1>

      </header>
    )
  }
}

export default Header
