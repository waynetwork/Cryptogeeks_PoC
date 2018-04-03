import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import RaisedButton from 'material-ui/RaisedButton';
import {trackPageView} from '../util/google-analytics';
import interactionConfirmationStore from '../stores/interactionConfirmationStore';
import _ from 'lodash';
import './interaction-confirmation.less';

class InteractionConfirmation extends React.Component {

  constructor(props) {
    super(props);

    if(this.props.location) {
      const path = this.props.location.pathname;
      trackPageView(path);
    }

    const {initiated} = this.props.confirmInteractionStore;
    if(!initiated) {
      const interactionCode = _.get(this.props.match, 'params.interactionCode');
      const userId = sessionStorage.getItem('userId');
      if(interactionCode) {
        if(userId) {
          this.props.confirmInteraction(interactionCode, userId);
        } else {
          sessionStorage.setItem('interactionCode', interactionCode);
          this.props.history.push('/');
        }
      } else {
        this.props.history.push('/');
      }
    }
  }

  renderSpinner() {
    return (
      <div>
        Checking interaction...
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
     </div>
    );
  }

  render() {
    const {initiated, pending, successful, data} = this.props.confirmInteractionStore;

    let content = null;
    if(!initiated) {

    } else {
      if(pending) {
        content = this.renderSpinner();
      } else {
        if(successful) {
          const location = _.get(data, 'location');
          sessionStorage.setItem('challengeLocation', location);
          content = (
            <div>
              Interaction confirmed!
              <br/><br/>
              <div>
                <NavLink to='/signup'>
                  <RaisedButton
                    backgroundColor='#ffd801'
                    label='Join Chat'
                  />
                </NavLink>
              </div>
            </div>
          );
        } else {
          content = (
            <div>
              Interaction could not be confirmed
              <br/><br/>
              <div>
                <NavLink to=''>
                  <RaisedButton
                    backgroundColor='#ffd801'
                    label='OK'
                  />
                </NavLink>
              </div>
            </div>
          );
        }
      }
    }

    return (
      <div className='interaction-confirmation'>
        {content}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    confirmInteractionStore: state.confirmInteraction
  };
};

const mapDispatchToProps = dispatch => ({
  confirmInteraction: (confirmationCode, confirmorId) => dispatch(
    interactionConfirmationStore.actions.send({
      confirmationCode,
      confirmorId
    })
  )
});

export default connect(mapStateToProps, mapDispatchToProps)(InteractionConfirmation);
