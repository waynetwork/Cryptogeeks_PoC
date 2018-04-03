import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import './chat-input.less';

export default class ChatInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      message: ''
    };
    this.changeMessage = this.changeMessage.bind(this);
    this.onKeyPressInTextField = this.onKeyPressInTextField.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  changeMessage(event, message) {
    this.setState({message});
  }

  onKeyPressInTextField(event) {
    if (event.key === 'Enter') {
      this.sendMessage();
      event.preventDefault();
    }
  }

  sendMessage() {
    if(this.state.message.trim().length > 0) {
      this.props.onSend(this.state.message);
      this.setState({message: ''});
    }
  }

  render() {
    return (
      <div className='chat-input container'>
        <div className='chat-input-text'>
          <TextField
            disabled={this.props.disabled}
            hintText="Message"
            fullWidth="true"
            value={this.state.message}
            onChange={this.changeMessage}
            onKeyPress={this.onKeyPressInTextField}
          />
        </div>
        <div className='chat-input-button'>
          <RaisedButton
            disabled={this.props.disabled}
            label="Send"
            backgroundColor='#ffd801'
            onClick={this.saveAndContinue}
            onClick={this.sendMessage}
          />
        </div>
      </div>
    );
  }
}
