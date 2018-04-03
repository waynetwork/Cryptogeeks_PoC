import React from 'react';
import {NavLink} from 'react-router-dom';
import {Card} from 'material-ui/Card';
import MaterialUiAvatar from 'material-ui/Avatar';
import {PAGES_WITH_HEADER} from '../util/constants';
import {isLoggedIn} from '../stores/accountStore';
import './header.less';

const createBackButton = (to) => {
  return (
    <NavLink to={to}>
      <span className="glyphicon glyphicon glyphicon-chevron-left"/>
    </NavLink>
  );
};

export default class ChatHeader extends React.Component {
  render() {
    let backButton = createBackButton('/waitlist');
    let photo = 'assets/avatar-placeholder.png';
    
    const {chatPartner} = this.props;
    const profileIcon = (
      <div className='header-chat-partner-icon'>
        <MaterialUiAvatar
            size={35}
            src={chatPartner.photo || photo}
        />
        <span className='header-chat-partner-username'>
            {chatPartner.name}
        </span>
      </div>
    );


    return (
      <Card className='header'>
        <div className='header-back-button'>
          {backButton}
        </div>
        {profileIcon}
      </Card>
    );
  }
}
