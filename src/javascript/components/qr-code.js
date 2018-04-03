import React from 'react';
import QRCode from 'qrcode';
import './qr-code.less';

export default class QrCode extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const text = this.props.text;
    const canvas = document.getElementById('qrcode-canvas');
    if(text) {
      QRCode.toCanvas(canvas, text, function (error) {
        if (error) console.error(error);
      });
    }
  }

  render() {
    return (
      <div className='qrcode'>
        <canvas id='qrcode-canvas'/>
      </div>
    );
  }
}
