import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import {Card} from 'material-ui/Card';
import MaterialUiAvatar from 'material-ui/Avatar';
import {PAGES_WITH_HEADER} from '../util/constants';
import {isLoggedIn} from '../stores/accountStore';
import './location-header.less';

class LocationHeader extends React.Component {
  render() {
    
  }
}

export const extractLocationName = (state) => {
  const locationKey = _.get(state.user, 'data.location');
  if(locationKey && state.partners.loaded) {
    const locationNumber = _.findKey(state.partners.data, (loc) => {
      return (loc.uniqueKey === locationKey.toUpperCase() || loc.location === locationKey.toUpperCase());
    });
    if(locationNumber) {
      return state.partners.data[locationNumber].name;
    }
  }
  return null;
};

const mapStateToProps = (state) => ({
  username: _.get(state.user, 'data.username'),
  photo: _.get(state.user, 'data.photo', 'assets/avatar-placeholder.png'),
  locationName: extractLocationName(state)
});

export default connect(mapStateToProps)(LocationHeader);
