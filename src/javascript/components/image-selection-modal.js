import React from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import $ from 'jquery';
import {trackEvent, events} from '../util/google-analytics';
import {showModal, setImage, uploadImage} from '../stores/profileImageStore';
import './image-selection-modal.less';

const isValidFileName = filename => {
  return filename.endsWith('.jpg') || filename.endsWith('.png');
};

const exifDataToAngle = {
  "1": 0,
  "8": -90,
  "3": -180,
  "6": 90
};

// src: https://stackoverflow.com/questions/19032406/convert-html5-canvas-into-file-to-be-uploaded
const canvas2Blob = canvas => {
  const canvasData = canvas.toDataURL();
  var blobBin = atob(canvasData.split(',')[1]);
  var array = [];
  for(var i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: 'image/png'});
};

class ImageSelection extends React.Component {

  constructor(props) {
    super(props);
    this.selectFile = this.selectFile.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.onChangeFile = this.onChangeFile.bind(this);
    this.renderImage = this.renderImage.bind(this);
    this.rotate = this.rotate.bind(this);
    this.adjustRotation = this.adjustRotation.bind(this);
    this.getOrientation = this.getOrientation.bind(this);

    this.state = {
      invalidFile: false,
      hasSelectedFile: false
    };

    const that = this;
    $(document).ready(function() {
      that.selectFile();
    });
  }

  rotate() {
    this.renderImage(90);
  }

  selectFile() {
    this.fileInput.click();
  }

  uploadImage() {
    this.props.uploadImage({fileName: this.props.isImageSelected, data: this.props.data});
    trackEvent(events.USER_UPLOADED_PROFILE_PHOTO);
    this.props.onUpload ? this.props.onUpload() : null;
    this.props.close();
    this.setState({
      invalidFile: false,
      hasSelectedFile: false
    });
  }

  onChangeFile() {
    if(isValidFileName(this.fileInput.value)) {
      this.setState({invalidFile:false});
      const that = this;
      let data = this.fileInput.files[0];
      const fileName = data.name;
      const previewImage = document.getElementById('img-preview');
      this.adjustRotation(data);
      const filereader = new FileReader();
      filereader.onload = function (event) {
        previewImage.onload = function (event) {
          that.renderImage();
        };
        previewImage.src = event.target.result;
      };
      filereader.readAsDataURL(data);
    } else {
      this.setState({invalidFile: true});
    }
  }

  async adjustRotation(file) {
    const orientation = await this.getOrientation(file);
    console.log(orientation);
    this.renderImage(exifDataToAngle[orientation]);
  }

  /**
   * experimental
   * @param {*} file
   * @param {*} callback
   */
  getOrientation(file, callback) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8) return resolve(-2);
        const length = view.byteLength;
        let offset = 2;
        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker == 0xFFE1) {
            if (view.getUint32(offset += 2, false) != 0x45786966) return resolve(-1);
            const little = view.getUint16(offset += 6, false) == 0x4949;
            offset += view.getUint32(offset + 4, little);
            const tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++)
              if (view.getUint16(offset + (i * 12), little) == 0x0112)
                return resolve(view.getUint16(offset + (i * 12) + 8, little));
          }
          else if ((marker & 0xFF00) != 0xFF00) break;
          else offset += view.getUint16(offset, false);
        }
        return resolve(-1);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  renderImage(angle=0) {
    const previewImage = document.getElementById('img-preview');
    const canvas = document.getElementById('img-preview-canvas');
    const ctx = canvas.getContext("2d");
    let sx, sy, sw, sh;
    const smallerSideLength = Math.min(previewImage.width, previewImage.height);
    if(previewImage.width === smallerSideLength) {
      sx = 0;
      sw = previewImage.width;
      sy = 0.5 * (previewImage.height - previewImage.width);
      sh = previewImage.width;
    } else {
      sx = 0.5 * (previewImage.width - previewImage.height);
      sw = previewImage.height;
      sy = 0;
      sh = previewImage.height;
    }

    ctx.translate(50, 50);
    ctx.rotate(angle * Math.PI/180);
    ctx.translate(-50, -50);

    ctx.drawImage(previewImage, sx, sy, sw, sh, 0, 0, 100, 100);

    const file = canvas2Blob(canvas);
    this.props.setImage({fileName: 'profile-image', data: file});
    this.setState({hasSelectedFile: true});
  }

  render() {
    const {invalidFile} = this.state;
    const okButton = (
      <div className='image-selection-button image-selection-button-ok'>
        <RaisedButton
          onClick={this.uploadImage}
          backgroundColor='#ffd801'
          label='OK'
        />
      </div>
    );

    const rotateButton = (
      <div className='image-selection-button'>
        <RaisedButton
          onClick={this.rotate}
          backgroundColor='#ffd801'
          label='Rotate'
        />
      </div>
    );

    const errorMessage = invalidFile ? 'Please select an image file!' : null;
    const style = {
      content: {
        marginLeft: '-125px',
        marginTop: '40px',
        width: '250px',
        height: '350px',
        textAlign: 'center',
        left: '50%'
      }
    };

    const previewVisibleClass = this.state.hasSelectedFile ? '' : 'image-selection-pic-invisible';
    const oldPicVisibleClass = (this.state.hasSelectedFile || !this.props.user.data.photo)? 'image-selection-pic-invisible' : '';

    return (
      <div className='image-selection'>
        <Modal
          isOpen={true}
          contentLabel="Modal"
          style={style}
        >
          <div>
            <h4>Upload your profile photo</h4>
            <input
              type='file'
              ref={(input) => this.fileInput=input}
              style={{display: 'none'}}
              onChange={this.onChangeFile}
            />
            <div className='image-selection-button'>
              <RaisedButton
                onClick={this.selectFile}
                backgroundColor='#ffd801'
                label='Select file'
                style={{overflow: 'hidden'}}
              />
            </div>

            <div className={'image-selection-preview ' + previewVisibleClass}>
              <img id='img-preview'/>
              <canvas width='100' height='100' id='img-preview-canvas' className='image-selection-canvas'/>
            </div>
            <div className={'image-selection-old-pic ' + oldPicVisibleClass}>
              <img id='img-old' src={this.props.user.data.photo}/>
            </div>

            {errorMessage}

            {this.state.hasSelectedFile ? okButton : null}

            <div className='image-selection-button image-selection-button-cancel'>
              <RaisedButton
                onClick={this.props.close}
                backgroundColor='#ffd801'
                label='Cancel'
              />
            </div>

          </div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isImageSelected: state.profileImage.fileName,
  data: state.profileImage.data,
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  close: () => {
    dispatch(showModal(false));
    dispatch(setImage(null, null)); // unset image
  },
  setImage: (fileName, data) => dispatch(setImage(fileName, data)),
  uploadImage: (fileName, data) => dispatch(uploadImage(fileName, data))
});

export default connect(mapStateToProps, mapDispatchToProps)(ImageSelection);
