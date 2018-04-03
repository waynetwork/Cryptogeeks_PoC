import React from 'react';
import './infobox.less';

export default class Infobox extends React.Component {
  render() {
    if(this.props.visible) {
      return (
        <div className='infobox' onClick={this.hide}>
          {this.props.text}
        </div>
      );
    } else {
      return null;
    }
  }
}
