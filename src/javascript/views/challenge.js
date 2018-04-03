import React from 'react';
import {connect} from 'react-redux';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import {trackPageView} from '../util/google-analytics';
import {loadUserDataWithBonusUrl} from '../stores/userStore';
import QRCode from '../components/qr-code';
import './challenge.less';

class Challenge extends React.Component {

  constructor(props) {
    super(props);
    trackPageView(this.props.location.pathname);

    const userId = sessionStorage.getItem('userId');
    props.loadUserDataForChallenge(userId);
  }

  render() {
    let url = this.props.url;
    let challengeUrl = null;
    let qrcode = null;
    let loadingSpinner = null;

    if(url) {
      url = 'http://'+url;
      challengeUrl = (
        <div className='challenge-url'>
          <a href={url}>{url}</a>
        </div>
      );
      qrcode = <QRCode text={url}/>;
    } else {
      loadingSpinner = (
        <div>
          <RefreshIndicator
           size={40}
           left={0}
           top={20}
           status="loading"
           style={{
             display: 'inline-block',
             position: 'relative',
           }}
         />
       </div>
      );
    }

    return (
      <div className='challenge container'>
        <div className='challenge-header'>
          Start an interaction with a stranger!
        </div>

        <div className='challenge-wayt-symbol'>
          <img src='/assets/waytcoin-symbol.png' />
        </div>

        <div className='challenge-message'>
          Receive your reward by getting the stranger to scan the QR code or opening the link
        </div>

        {loadingSpinner}
        {qrcode}
        {challengeUrl}
      </div>
    );
  }

}

const mapStateToProps = (state) => ({
  user: state.user,
  url: state.user.data.interactionUrl
});
const mapDispatchToProps = dispatch => ({
  loadUserDataForChallenge: (id) => dispatch(loadUserDataWithBonusUrl(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Challenge);
