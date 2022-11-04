import * as dotenv from 'dotenv'
dotenv.config()
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import typeDefs from './typedefs.js'
import resolvers from './resolvers.js'
import { OrderAPI } from './datasources.js'

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const { url } = await startStandaloneServer(server, {
  context: () => {
    return {
      dataSources: {
        orderAPI: new OrderAPI()
      }
    }
  },
  listen: {
    port: 4000
  }
})

console.log(`🚀 Server ready at ${url}`)