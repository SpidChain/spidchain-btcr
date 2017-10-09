import {ApolloClient, createNetworkInterface} from 'apollo-client'

const URL = window.cordova && window.device.platform === 'Android' && process.env.NODE_ENV === 'dev-compiled'
     ? process.env.ROOT_URL_ANDROID + ':' + process.env.PORT
     : process.env.ROOT_URL + ':' + process.env.PORT

const client = new ApolloClient({
  networkInterface: createNetworkInterface({uri: `${URL}/graphql`})
})

export default client
