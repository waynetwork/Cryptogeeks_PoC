import React from 'react';
import {connect} from 'react-redux';
import { NavLink } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {trackPageView, trackEvent, events} from '../util/google-analytics';
import TermsAndPolicy from '../components/terms-and-policy';
import InfoBox from '../components/infobox';
import {login} from '../stores/accountStore';
import './login.less';

class Login extends React.Component {

  constructor(props) {
    super(props);
    const path = this.props.location.pathname;
    trackPageView(path);

    this.state = {
      loginName: '',
      password: ''
    };

    this.login = this.login.bind(this);
    this.changeLoginName = this.changeLoginName.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  componentWillReceiveProps(props) {
    if(props.account.wasLoginSuccessful && !this.props.account.wasLoginSuccessful) {
      sessionStorage.setItem('userId', props.account.userId);
      trackEvent(events.USER_LOGGED_IN);
      this.props.history.push(`/signup`);
    }
  }

  changeLoginName(event, loginName) {
    this.setState({loginName});
  }
  changePassword(event, password) {
    this.setState({password});
  }

  login() {
    const {loginName, password} = this.state;
    this.props.login(loginName, password);
  }

  render() {

    return (
      <div className='login container'>

        <div className='login-header'>
          Login
        </div>

        <TextField
          floatingLabelText="Username or Email"
          onChange={this.changeLoginName}
          fullWidth={true}
        />

        <TextField
          floatingLabelText="Password"
          type="Password"
          onChange={this.changePassword}
          fullWidth={true}
        />

        <RaisedButton
          label="OK"
          backgroundColor='#ffd801'
          onClick={this.login}
          fullWidth={true}
        />

        <InfoBox text={"Invalid username or password!"} visible={this.props.account.hasLoginFailed}/>

        <div className='login-register'>
          You don't have an account yet? <NavLink to='/register'>Register here!</NavLink>
        </div>
        {/*
        <div className='login-reset-password'>
          Forgot password? <NavLink to='/reset-password'>Reset it!</NavLink>
        </div>
        */}
        <TermsAndPolicy/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  account: state.account
});
const mapDispatchToProps = dispatch => ({
  login: (userLogin, password) => dispatch(login(userLogin, password)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
