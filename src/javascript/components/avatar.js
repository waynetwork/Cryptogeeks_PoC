import React from 'react';
import MaterialUiAvatar from 'material-ui/Avatar';
import './avatar.less';

export default class Avatar extends React.Component {

  render() {
    const {src, onClick, displayPlus} = this.props;
    let plus = null;
    if(displayPlus) {
      plus = (
        <div className='avatar-plus'>
          <img src='assets/avatar-plus.png'/>
        </div>
      );
    }

    return (
      <div className='avatar'>
        <div className='avatar-holder' onClick={onClick}>
          <div className='avatar-image'>
            <MaterialUiAvatar
              size={100}
              src={src}
            />
          </div>
          {plus}
          <div className='avatar-placeholder'/>
        </div>
      </div>
    );
  }
}
