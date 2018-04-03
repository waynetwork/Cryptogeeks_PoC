import React from 'react';
import {connect} from 'react-redux';
import { NavLink } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {trackPageView} from '../util/google-analytics';
import TermsAndPolicy from '../components/terms-and-policy';
import InfoBox from '../components/infobox';
import {login} from '../stores/accountStore';
import './reset-password.less';

class ResetPassword extends React.Component {

  constructor(props) {
    super(props);
    const path = this.props.location.pathname;
    trackPageView(path);

    this.state = {
      login: null
    };
    this.changeLogin = this.changeLogin.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  changeLogin(event, login) {
    this.setState({login});
  }

  resetPassword() {
    const {login} = this.state;
    console.log("Reset password for " + login);

    // TODO: call password reset endpoint here
  }

  render() {
    return (
      <div className='resetpw container'>

        <div className='resetpw-header'>
          Reset password
        </div>

        <div className='resetpw-info'>
          Enter your Username or Email address. We will send you a link to reset your password.
        </div>

        <TextField
          floatingLabelText="Username or Email"
          onChange={this.changeLogin}
          fullWidth={true}
        />

        <RaisedButton
          label="Reset Password"
          backgroundColor='#ffd801'
          onClick={this.resetPassword}
          fullWidth={true}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
});
const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
