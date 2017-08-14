import {ApolloClient, createNetworkInterface} from 'react-apollo'

const ROOT_URL = process.env.ROOT_URL
const PORT = process.env.PORT

const client = new ApolloClient({
  networkInterface: createNetworkInterface({uri: `${ROOT_URL}:${PORT}/graphql`})
})

export default client