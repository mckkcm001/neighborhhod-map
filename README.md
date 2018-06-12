# Final React Project

## Table of Contents

* [About](#about)
* [Usage](#usage)
* [Dependencies/References](#dependencies/references)

## About

This project is required for completion of the Front End Nanodegree Developer program
at [Udacity](udacity.com). This app loads the counties of California from census data
and displays them in a scrollable list. The list can be filtered via a search box.
The list updates as the user changes the search string. The list view moves off screen
for mobile devices and is accessed by touching the hamburger icon. Also, a Google map
loads centered on California with county boundaries shown with a kml layer using
a kml file found online (the file has to be hosted).

When a county in the list is selected, a marker drops onto the map and the map zooms
in to the bounds of the county. Both the marker location and bounds are obtained from
Google geocoding. An information window opens when a marker is clicked. If more than
one marker is placed, the Google map controls can be used to size and pan the map.
To start over, there is a button for clearing the markers and recentering the map.

## Usage

Git clone the repository. `cd neighborhood-map` to move into the new directory.
You will need a [Google API key](https://developers.google.com/maps/documentation/javascript/get-api-key)
and a [US Census API](https://api.census.gov/data/key_signup.html) key. Copy them into
lines 117 and 105 of App.js and save.

The load-google-maps-api must be installed with `npm install --save load-google-maps-api`.
Then execute `npm install` and `npm start` to see the app at [localhost:3000](localhost:3000).

## Dependencies/References

* Must have [node](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/getting-started/installing-node) installed.
* County boundary line overlay from www.no5w.com/OverlayCaliforniaRev4.kml (copy in src folder).
* [Google maps API](https://developers.google.com/maps/documentation/javascript/tutorial)
* [US Census API](https://www.census.gov/data/developers/data-sets/popest-popproj/popest.html)
