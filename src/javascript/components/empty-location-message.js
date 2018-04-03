import React from 'react';
import {NavLink} from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import './empty-location-message.less';

export default class ChatInput extends React.Component {
  render() {
    const {showChallenge} = this.props;
    if(showChallenge) {

      return (
        <Paper style={{'background-color':'#f5f5fb'}} rounded='true' className='empty-location-message' zDepth={1} >
          <div className='empty-location-message-header'>
            Earn some WAYTcoin
          </div>
          <div className='empty-location-message-body'>
            Start an interaction with a stranger
          </div>
          <div className='empty-message-wayt-symbol'>
            <img src='/assets/waytcoin-symbol.png' />
          </div>
          <NavLink to='/challenge'>
            <RaisedButton
              className='empty-location-message-button'
              label="Accept Challenge"
              backgroundColor='#ffd801'
            />
          </NavLink>
        </Paper>
      );

    } else {

      return (
        <div className='empty-location-message'>
          <div className='empty-location-message-header'>
            No one here yet.
          </div>
          <div className='empty-location-message-body'>
            Go up to a stranger who looks like someone you would want to meet and tell them about WaitList.
          </div>
        </div>
      );

    }
  }
}
