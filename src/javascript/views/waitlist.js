import React from 'react'
import { connect } from 'react-redux'
import Slider from 'material-ui/Slider'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import { List } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import _ from 'lodash'
import fetch from 'isomorphic-fetch'
import { trackPageView } from '../util/google-analytics'
import UserData from '../components/user-data'
import WaitListItem from '../components/waitlist-item'
import Infobox from '../components/infobox'
import EmptyLocationMessage from '../components/empty-location-message'
import { loadWaitlist } from '../stores/waitlistStore'
import { transformMessages, notifyNewMessage } from '../stores/chatStore'
import { loadUserData, isOnboarded } from '../stores/userStore'
import { initWebSocketStore } from '../stores/webSocketStore'
import { loadPartnerData } from '../stores/partnerStore'
import { requestPermissionForNotifications } from '../util/notification'
import { PARTNER_LOCATIONS } from '../util/constants'
import './waitlist.less'
import { promisify } from 'bluebird'
import { Web3Provider } from 'react-web3'
import Web3Component, { initContract, getWeb3 } from '../components/Web3Component'
import Blockgeeks from '../../abi/Blockgeeks.json'
import { debug } from 'util'

class WaitList extends React.Component {

  constructor (props) {
    super(props)

    const path = this.props.location.pathname
    trackPageView(path)

    const userId = sessionStorage.getItem('userId')
    const locationIdFromPath = _.get(this.props.match, 'params.locationId')

    this.changeDistance = this.changeDistance.bind(this)
    this.changeReputation = this.changeReputation.bind(this)

    if (userId) {

      // redirect to waitlist where the user is signed in
      const locationId = sessionStorage.getItem('locationId')
      if (!locationIdFromPath || locationIdFromPath != locationId) {
        console.log(`redirect to /waitlist/${locationId}`)
        this.props.history.push(`/waitlist/${locationId}`)
      }

      this.props.loadUserData(userId)
      this.props.loadWaitlist(userId)
      if (!this.props.partners.loaded) {
        this.props.loadPartnerData()
      }
    } else {
      if (locationIdFromPath) {
        this.props.history.push(`/signup/${locationIdFromPath}`)
      } else {
        this.props.history.push('/signup')
      }
    }

    this.state = {
      showIncompleteProfileHint: false,
      contractAddress: '0x0ab528157f9a3859ddc54dfac618041b05fdaef0'
    }
    this.openChat = this.openChat.bind(this)

    if (FEATURE_NOTIFICATIONS) {
      requestPermissionForNotifications()
    }

    this.setState({
      distance: 5000,
      reputation: 100,
      contract: null,
    })
  }

  componentDidMount () {
    // initialize so that messages can be delivered, but not acted upon
    // TODO handle the incoming messages and update chat bubbles

    initWebSocketStore(sessionStorage.getItem('userId'),
      (event) => notifyNewMessage(transformMessages([event])[0]))

    const contract = initContract(Blockgeeks, this.state.contractAddress)

    this.setState({contract: contract})

    console.log(contract, this.state.contractAddress)

  }

  getContract () {
    // console.log("Address", this.state.contractAddress)
    // const contract = initContract(Blockgeeks, this.state.contractAddress)
    // this.setState({contract: contract})
  }

  openChat (chatPartnerId) {
    console.log('open chat with: ' + chatPartnerId)
    const locationId = sessionStorage.getItem('locationId')
    this.props.history.push({
      pathname: `/waitlist/${locationId}/chat/${chatPartnerId}`
    })
  }

  changeDistance (event, value) {
    // @TODO: store distance in backend
    const roundedValue = Math.floor(value)
    sessionStorage.setItem('distance', roundedValue)
    const userId = sessionStorage.getItem('userId')
    this.props.loadWaitlist(userId)
    this.setState({
      distance: roundedValue
    })
  }

  changeReputation (event, value) {
    // @TODO: store distance in backend
    const roundedValue = Math.floor(value)
    this.setState({
      reputation: roundedValue
    })
  }

  render () {
    const list = []

    const {isUserOnboarded} = this.props
    const {distance, reputation} = this.state
    _.each(this.props.waitlist.data, (entry, key) => {
      const onClick = isUserOnboarded
        ? () => this.openChat(entry.id)
        : () => this.setState({showIncompleteProfileHint: true})

      const onEndorse = this.state.contract ? this.state.contract.endorse : null

      list.push(
        <WaitListItem
          key={key}
          interests={entry.interests}
          photo={entry.photo}
          name={entry.name}
          timeLeft={entry.timeLeft}
          hasChat={entry.hasChat}
          nonDeliveredChatCount={entry.nonDeliveredChatCount}
          lastContact={entry.lastContact}
          onClick={onClick}
          onEndorse={onEndorse}
          address={entry.address}
          endorsement={entry.endorsement}
          balance={entry.balance}
        />
      )
    })

    const isLoggedInUser = !!this.props.user.data.username
    list.push(
      <EmptyLocationMessage showChallenge={FEATURE_WAITCOIN_CHALLENGE && isLoggedInUser}/>
    )

    return (
      <div>

        <UserData />
        <Infobox
          visible={!isUserOnboarded && this.state.showIncompleteProfileHint}
          text={'Enter your name and interests to start communicating with other passengers'}
        />

        <div>
          <ul className="signup-wait">
            <li className="signup-wait-for-li"><strong className="signup-wait-for">Distance</strong></li>
            <li>
              <div className='signup-slider'>
                <Slider
                  min={100}
                  max={10000}
                  step={10}
                  defaultValue={5000}
                  onChange={this.changeDistance}
                />
              </div>
            </li>
            <li className="title"><p className="signup-wait-for">{distance} meters</p></li>
          </ul>
        </div>

        <div>
          <ul className="signup-wait">
            <li className="signup-wait-for-li"><strong className="signup-wait-for">Reputation</strong></li>
            <li>
              <div className='signup-slider'>
                <Slider
                  min={100}
                  max={10000}
                  step={10}
                  defaultValue={5000}
                  onChange={this.changeReputation}
                />
              </div>
            </li>
            <li className="title"><p className="signup-wait-for">{reputation} GEEK</p></li>
          </ul>
        </div>


          <List>
            {list}
          </List>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  waitlist: state.waitlist,
  user: state.user,
  isUserOnboarded: isOnboarded(state.user),
  partners: state.partners,
})

const mapDispatchToProps = dispatch => ({
  loadWaitlist: (userId) => dispatch(loadWaitlist(userId)),
  loadUserData: (userId) => dispatch(loadUserData(userId)),
  loadPartnerData: () => dispatch(loadPartnerData())
})

export default connect(mapStateToProps, mapDispatchToProps)(WaitList)
