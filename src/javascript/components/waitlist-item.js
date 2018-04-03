import React from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import CommunicationChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import Avatar from 'material-ui/Avatar';
import './waitlist-item.less';

export default class WaitListItem extends React.Component {
  render() {
    let {
      interests,
      name,
      photo,
      timeLeft,
      hasChat,
      nonDeliveredChatCount,
      lastContact,
      onClick,
      onEndorse,
      address,
      endorsement,
      balance
    } = this.props;

    const isActionVisible = this.props.isActionVisible === false ? false : true;

    if (interests.trim() === '') {
      interests = "Just waiting";
    }
    if (name.trim() === '') {
      name = 'No name specified';
    }
    if (!photo) {
      photo = 'assets/avatar-placeholder.png';
    }

    const onClickHelper = (event) => {
      event.name = name;
      event.photo = photo;
      this.props.onClick(event);
    }

    // "timeLeft === undefined" means: this is the profile card
    let timeLeftText = '';
    let arrowClass = 'waitlist-item-invisible';
    if (timeLeft !== undefined) {
      if (timeLeft > 0) {
        timeLeftText = `${timeLeft} min`;
      }
      arrowClass = '';
    }
    let alreadyContactedClass = '';
    if (lastContact > 0) {
      alreadyContactedClass = 'waitlist-item-already-contacted';
    }
    const hasUnreadMessagesClass = nonDeliveredChatCount > 0 ? '' : 'waitlist-item-invisible';

    return (
      <div className={'waitlist-item-parent'}>
        <div className={'waitlist-item ' + alreadyContactedClass} >

          <div className='waitlist-item-avatar'>
            <Avatar
              size={50}
              src={photo}
            />
          </div>

          <div className='waitlist-item-data'>
            <p className='waitlist-item-data-name'>
              {name}
            </p>
            <p className="waitlist-item-data-address">{address}</p>
            <p className="waitlist-item-data-backing">
              Backing <strong>{endorsement} GEEK</strong>
            </p>

          </div>

          {isActionVisible && <ul className='waitlist-item-actions'>
            <li><button onClick={onClickHelper} className='waitlist-item-button blue'> Meet </button></li>
            <li><button className='waitlist-item-button green' onClick={() => {
              try {
                console.log("To", address)
                console.log("From", window.web3.eth.accounts ? window.web3.eth.accounts[0] : null,)

                onEndorse(address, {
                  from: window.web3.eth.accounts ? window.web3.eth.accounts[0] : null,
                  gas: 300000,
                  value: web3.toWei(0, 'ether')
                }, (error, result) => {
                  console.log(result)
                  console.log(error)
                });
              } catch (error) {
                alert("Metamask is not connected")
              }
            }}> Endorse </button></li>
          </ul>}
        </div>

        <p className='waitlist-item-data-interests'>
          {interests}
        </p>

      </div>
    );
  }
}
