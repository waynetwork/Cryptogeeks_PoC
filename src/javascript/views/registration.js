import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { checkUsernameAvailability, registerAccount } from '../stores/accountStore';
import interactionConfirmationStore from '../stores/interactionConfirmationStore';
import { trackPageView, trackEvent, events } from '../util/google-analytics';
import TermsAndPolicy from '../components/terms-and-policy';
import InfoBox from '../components/infobox';
import './registration.less';

const validateUsername = (username) => {
  if (username && username.trim().length > 2) {
    // TODO: implement real validation
    return true;
  }
  return false;
};

const validateEmailAddress = (email) => {
  if (email && email.trim().length > 4) {
    // src: https://stackoverflow.com/questions/46155/how-to-validate-email-address-in-javascript
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email.toLowerCase());
  }
  return false;
};

const validatePassword = (password) => {
  if (password && password.trim().length > 3) {
    // TODO: implement real validation
    return true;
  }
  return false;
};

class Onboarding extends React.Component {

  constructor(props) {
    super(props);
    const path = this.props.location.pathname;
    trackPageView(path);

    this.state = {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      errorText: null
    };

    this.register = this.register.bind(this);
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.changePasswordConfirm = this.changePasswordConfirm.bind(this);
    this.changeUsername = this.changeUsername.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.account.wasRegistrationSuccessful && !this.props.account.wasRegistrationSuccessful) {
      sessionStorage.setItem('userId', props.account.userId);
      trackEvent(events.USER_REGISTERED_ACCOUNT);

      // confirm interaction (for users who joined via waytcoin challenge)
      const interactionCode = sessionStorage.getItem('interactionCode');
      if (interactionCode) {
        this.props.confirmInteraction(interactionCode, props.account.userId);
      }

      this.props.history.push(`/signup`);
    }
  }

  changeEmail(event, email) {
    this.setState({ email });
  }
  changePassword(event, password) {
    this.setState({ password });
  }
  changePasswordConfirm(event, passwordConfirm) {
    this.setState({ passwordConfirm });
  }
  changeUsername(event, username) {
    this.setState({ username });
    this.props.checkUsernameAvailability(username);
  }

  register() {
    const { username, email, password, passwordConfirm } = this.state;
    const { isAvailable } = this.props.account;

    if (!validateUsername(username)) {
      this.setState({
        errorText: 'Please enter a valid user name!'
      });
    } else if (!validateEmailAddress(email)) {
      this.setState({
        errorText: 'Please enter a valid eMail address!'
      });
    } else if (!validatePassword(password) || (password !== passwordConfirm)) {
      this.setState({
        errorText: 'Please enter a valid password!'
      });
    } else {
      this.setState({
        errorText: null
      });
      if (isAvailable) {
        const data = {
          user_id: sessionStorage.getItem('userId'),
          username,
          email,
          password
        };
        this.props.registerAccount(data);
      }
    }
  }

  render() {
    const { errorText, username } = this.state;
    const { isCheckingAvailability, isAvailable, isRegisteringAccount } = this.props.account;
    const { name } = this.props;
    console.log("errorText", errorText);
    const isUsernameTaken = !!username && isAvailable == false;
    const isRegistrationButtonDisabled = isRegisteringAccount;

    return (
      <div className='registration container'>

        <div className='registration-header'>
          Create a new account
        </div>

        <TextField
          floatingLabelText="Username"
          defaultValue={name}
          onChange={this.changeUsername}
          fullWidth={true}
        />

        <InfoBox visible={isUsernameTaken} text='The selected username is already taken!' />

        <TextField
          floatingLabelText="Email"
          onChange={this.changeEmail}
          fullWidth={true}
        />

        <TextField
          floatingLabelText="Password"
          type="Password"
          onChange={this.changePassword}
          fullWidth={true}
        />

        <TextField
          floatingLabelText="Password confirmation"
          type="Password"
          onChange={this.changePasswordConfirm}
          fullWidth={true}
        />

        <RaisedButton
          label="OK"
          backgroundColor='#ffd801'
          onClick={this.register}
          fullWidth={true}
          disabled={isRegistrationButtonDisabled}
        />

        <InfoBox text={errorText} visible={!!errorText} />
        <TermsAndPolicy />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  account: state.account,
  name: state.user.data.name
});

const mapDispatchToProps = dispatch => ({
  checkUsernameAvailability: (username) => dispatch(checkUsernameAvailability(username)),
  registerAccount: (data) => dispatch(registerAccount(data)),
  confirmInteraction: (confirmationCode, confirmorId) => dispatch(
    interactionConfirmationStore.actions.send({
      confirmationCode,
      confirmorId
    })
  )
});

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
