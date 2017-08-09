const {makeExecutableSchema} = require('graphql-tools')
const {makeMessagingResolvers, messagingTypeDefs} = require('./methods/messaging')
const _ = require('lodash')

const rootTypeDefs = `
type Query {
dummy: String
}
type Mutation {
dummy: String
}
schema {
  query: Query
  mutation: Mutation
}
`
const makeDefaultSchema = async () => {
  const messagingResolvers = await makeMessagingResolvers()
  const typeDefs = [rootTypeDefs, messagingTypeDefs]
 // const resolvers = _.merge(postsResolvers, greetResolver)
  const resolvers = messagingResolvers
  const schema = makeExecutableSchema({typeDefs, resolvers})
  return schema
}

module.exports = makeDefaultSchema
