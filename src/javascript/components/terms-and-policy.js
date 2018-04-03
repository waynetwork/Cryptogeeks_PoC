import React from 'react';
import './terms-and-policy.less';

export default class TermsAndPolicy extends React.Component {
  render() {
    return (
      <div className='terms-and-policy'>
        <p className='terms-and-policy-legal-texts'>
          By proceeding, you agree to our{' '}
          <a href='https://s3.eu-central-1.amazonaws.com/waitlist-assets/Terms_of_Use.pdf'>Terms of Use</a>{' '}&{' '}
          <a href='https://s3.eu-central-1.amazonaws.com/waitlist-assets/Privacy_Policy.pdf'>Privacy Policy</a>
        </p>
      </div>
    );
  }
}
