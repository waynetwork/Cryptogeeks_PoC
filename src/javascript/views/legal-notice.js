import React from 'react';
import {trackPageView} from '../util/google-analytics';
import './legal-notice.less';

export default class LegalNotice extends React.Component {

  constructor(props) {
    super(props);
    const path = this.props.location.pathname;
    trackPageView(path);
  }

  render() {
    return (
      <div className='legal-notice'>
        <div className='legal-notice-content'>
          <h2>Legal Notice</h2>

          <h3>Contact</h3>
          Achill Rudolph<br/>
          WaitList c/o hub:raum<br/>
          Winterfeldtstr. 21<br/>
          10781 Berlin<br/>
          Germany

          <h3>Documents</h3>
          <ul>
            <li><a href='https://s3.eu-central-1.amazonaws.com/waitlist-assets/Terms_of_Use.pdf'>Terms of Use</a></li>
            <li><a href='https://s3.eu-central-1.amazonaws.com/waitlist-assets/Privacy_Policy.pdf'>Privacy Policy</a></li>
          </ul>
        </div>
      </div>
    );
  }
}
