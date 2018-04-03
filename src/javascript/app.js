import React from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import { Route } from 'react-router-dom';
import { loadUserData } from './stores/userStore';
import { isLoggedIn } from './stores/accountStore';
import Header from './components/header';
import Footer from './components/footer';
import Profile from './views/profile';
import Login from './views/login';
import Registration from './views/registration';
import Signup from './views/signup';
import ResetPassword from './views/reset-password';
import WaitList from './views/waitlist';
import Challenge from './views/challenge';
import Chat from './views/chat';
import InteractionConfirmation from './views/interaction-confirmation';
import Feedback from './views/feedback';
import LegalNotice from './views/legal-notice';
import './app.less';

class App extends React.Component {

  constructor(props) {
    super(props);
    if (isLoggedIn()) {
      const userId = sessionStorage.getItem('userId');
      console.log("App: loadUserData", userId);
      this.props.loadUserData(userId);
    }
  }

  componentWillReceiveProps(props) {
    if (props.account.wasLoginSuccessful) {
      this.props.loadUserData(props.account.userId);
    }
  }

  render() {
    sessionStorage.setItem('path', this.props.location.pathname);
    return (

      <div className='app-container'>
        <Route component={Header} />
        <div className='app-content'>
          <Route exact path="/" component={Signup} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Registration} />
          <Route exact path="/challenge" component={Challenge} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/profile/:username" component={Profile} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/signup/:locationId" component={Signup} />
          <Route exact path="/reset-password" component={ResetPassword} />
          <Route exact path="/waitlist/" component={WaitList} />
          <Route exact path="/waitlist/:locationId" component={WaitList} />
          <Route exact path="/waitlist/:locationId/chat/:chatPartnerId" component={Chat} />
          <Route exact path="/confirm-interaction/:interactionCode" component={InteractionConfirmation} />
          <Route exact path="/feedback" component={Feedback} />
          <Route exact path="/legalnotice" component={LegalNotice} />
        </div>
        <Route component={Footer} />
      </div>

    );
  }
};

const mapStateToProps = (state) => ({
  account: state.account
});

const mapDispatchToProps = dispatch => ({
  loadUserData: (userId) => dispatch(loadUserData(userId))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
