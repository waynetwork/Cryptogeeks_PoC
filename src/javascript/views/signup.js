import React from 'react';
import { connect } from 'react-redux';
import Slider from 'material-ui/Slider';
import RaisedButton from 'material-ui/RaisedButton';
import { NavLink } from 'react-router-dom';
import fetch from 'isomorphic-fetch';
import { Row, Col } from 'react-bootstrap';
import _ from 'lodash';
import TermsAndPolicy from '../components/terms-and-policy';
import { trackPageView, trackEvent, events } from '../util/google-analytics';
import { getAuthHeaders } from '../util/headers';
import { PARTNER_LOCATIONS } from '../util/constants';
import Infobox from '../components/infobox';
import { loadPartnerData } from '../stores/partnerStore';
import './signup.less';

const locationInput = 'signup-location-input';

let circle = false;
let geolocationAvailable = false;
let autocompleteApi = false;

class Signup extends React.Component {

  constructor(props) {
    super(props);

    const path = this.props.location.pathname;
    trackPageView(path);

    const locationIdFromPath = _.get(this.props.match, 'params.locationId');
    // TODO make this validation using partner api
    const isValidLocation = locationIdFromPath && _.includes(PARTNER_LOCATIONS, locationIdFromPath);

    this.changeWaitingTime = this.changeWaitingTime.bind(this);
    this.save = this.save.bind(this);
    this.update = this.update.bind(this);
    this.saveAndContinue = this.saveAndContinue.bind(this);
    this.getGeolocation = this.getGeolocation.bind(this);
    this.buildLocation = this.buildLocation.bind(this);
    this.initAutoComplete = this.initAutoComplete.bind(this);
    this.changeGeolocation = this.changeGeolocation.bind(this);
    this.renderLocationInput = this.renderLocationInput.bind(this);
    this.geocodeLocation = this.geocodeLocation.bind(this);
    this.clearLocation = this.clearLocation.bind(this);
    this.setLocationInputValue = this.setLocationInputValue.bind(this);
    this.setPlace = this.setPlace.bind(this);

    const userId = sessionStorage.getItem('userId');
    const locationId = sessionStorage.getItem('locationId');
    if (userId && !props.user) {
      this.props.history.push(`/waitlist/${locationId}`); // user is onboarded already
    }
    this.props.loadPartnerData();
    this.state = {
      showLocationRequiredHint: false,
      autoSelectedLocaton: undefined,
      geolocation: null,
      airport: isValidLocation ? locationIdFromPath : null,
      waitingTime: 30,
      isSearchBoxVisible: false
    };
  }

  componentDidMount() {
    // this.buildLocation();
  }

  changeGeolocation() {
    const place = autocompleteApi.getPlace();
    this.setPlace(place.place_id, place.geometry.location.lng(), place.geometry.location.lat());
    trackEvent(events.USER_SELECTED_LOCATION, { label: place.place_id });
  }

  setPlace(placeId, lng, lat) {
    this.setState({
      airport: placeId,
      geolocation: {
        longitude: lng,
        latitude: lat
      }
    });
  }

  changeWaitingTime(event, value) {
    const roundedValue = Math.floor(value);
    this.setState({
      waitingTime: roundedValue
    });
    trackEvent(events.USER_CHANGED_WAITING_TIME, { value: roundedValue });
  }

  getGeolocation() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, {});
    });
  }

  async buildLocation() {
    const challengeLocation = sessionStorage.getItem('challengeLocation');
    if (challengeLocation) {
      try {
        this.setPlace(challengeLocation, 0, 0);
        this.setLocationInputValue(challengeLocation);
      } catch (error) {
        console.log(error);
        this.setState({ isSearchBoxVisible: true });
      }
    } else if (navigator.geolocation && !geolocationAvailable) {
      try {
        const location = await this.getGeolocation();
        const geolocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        circle = new google.maps.Circle({
          center: geolocation,
          radius: location.coords.accuracy
        });
        if (autocompleteApi) {
          autocompleteApi.setBounds(circle.getBounds());
        }
        const res = await this.geocodeLocation(geolocation);
        this.setPlace(res.place_id, geolocation.lng, geolocation.lat);
        this.setLocationInputValue(res.name);
      } catch (error) {
        console.log(error);
        this.setState({ isSearchBoxVisible: true });

      }
    }
  }

  geocodeLocation(geolocation) {
    return new Promise(function (resolve, reject) {
      const request = {
        location: geolocation,
        radius: '500'
        //type: ['point_of_interest', 'airport', 'hospital', '']
      };
      const service =
        new google.maps.places.PlacesService(document.getElementById(locationInput));
      service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          if (results[0]) {
            resolve(results[0]);
          } else {
            reject();
          }
        } else {
          reject(status);
        }
      });
    });
  }

  async save(body) {
    console.log("Create user with: " + JSON.stringify(this.state));
    const endpoint = 'api/users';
    const res = await fetch(endpoint, {
      method: 'post',
      body,
      headers: new Headers({
        'content-type': 'application/json'
      }),
    });
    const resJson = await res.json();
    this.setState({
      airport: resJson.location
    });
    sessionStorage.setItem('userId', resJson.id);
    sessionStorage.setItem('token', resJson.token);
    return resJson;
  }

  async update(body) {
    console.log("Update user with: " + JSON.stringify(this.state));
    const userId = sessionStorage.getItem('userId');
    const endpoint = 'api/users/' + userId + '?waiting_started=true';
    const headers = getAuthHeaders();
    headers.append('content-type', 'application/json');
    const res = await fetch(endpoint, {
      method: 'put',
      body,
      headers: headers,
    });
    const resJson = await res.json();
    return resJson;
  }

  async saveAndContinue() {
    await this.buildLocation();

    if (!this.state.airport) {
      this.setState({
        showLocationRequiredHint: true
      });
      return;
    }
    const body = JSON.stringify({
      'location': this.state.airport,
      'geolocation': this.state.geolocation,
      'waiting_time': this.state.waitingTime,
      'address': window.web3 ? window.web3.eth.accounts[0] : null
    });
    // if geolocationAvailable then we have already saved the user then update
    let json = {};
    if (!geolocationAvailable && !sessionStorage.getItem('userId')) {
      json = await this.save(body);
    } else {
      json = await this.update(body);
    }
    const locationId = json.location.toLowerCase();
    sessionStorage.setItem('locationId', locationId);
    this.props.history.push(`/waitlist/${locationId}`);
  }

  clearLocation() {
    this.setLocationInputValue('');
    if (autocompleteApi && circle) {
      autocompleteApi.setBounds(circle.getBounds());
    }
  }

  setLocationInputValue(value) {
    // this primitive trick helps to avoid problems with react and google maps
    // getting in the way of eachother
    document.getElementById(locationInput).value = value;
  }

  initAutoComplete() {
    autocompleteApi = new google.maps.places.Autocomplete(document.getElementById(locationInput));
    autocompleteApi.addListener('place_changed', this.changeGeolocation);
  }

  renderLocationInput() {
    // TODO move this to a component
    const locationList = [];
    _.each(this.props.partners.data, (entry, key) => {
      locationList.push(
        {
          value: entry.uniqueKey,
          label: entry.name
        }
      );
    });

    return (
      <div style={{ paddingBottom: '15px', display: this.state.isSearchBoxVisible ? 'block' : 'none' }}>
      
        <Infobox
          visible={this.state.showLocationRequiredHint}
          text={'Please enter your location first to join the waitlist'}
        />
        <input onFocus={this.clearLocation}
          className="signup-location-input-style" id={locationInput} type="text"
          placeholder="Enter location" />
        {this.initAutoComplete()}
      </div>
    );
  }

  render() {
    const { waitingTime } = this.state;
    return (
      <div className='signup'>


        <div className='onboarding-logo'>
          <img
            className='logo'
            src='assets/bglogo.png'
          />
        </div>

        <h1>
          Find [blockchain] lovers nearby.
        </h1>
        {this.renderLocationInput()}

        <br></br>

        <RaisedButton
          label="Start"
          backgroundColor='#43d676'
          onClick={this.saveAndContinue}
        />

        <RaisedButton
          className="login-btn"
          label="Login"
          backgroundColor='white'

          onClick={() => {
            this.props.history.push('login')
          }}
        />


        <TermsAndPolicy />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    partners: state.partners,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => ({
  loadPartnerData: () => dispatch(loadPartnerData())
});

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
