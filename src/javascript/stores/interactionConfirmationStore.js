import buildStore from '../util/store-builder';

export default buildStore({
  name: 'interactionConfirmation',
  route: payload => `api/interactions/${payload.confirmationCode}`
});
