import * as dotenv from 'dotenv'
dotenv.config()
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import cors from 'cors'
import bp from 'body-parser'
import express from 'express'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'

import http from 'http'

import typeDefs from './typedefs.js'
import resolvers from './resolvers.js'
import { OrderAPI, PaymentAPI, FulfilmentAPI } from './datasources.js'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const app = express()
const httpServer = http.createServer(app)

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            console.log('Draining WebSocket server...')
            await serverCleanup.dispose()
          }
        }
      }
    }
  ]
})

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: '/'
})

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer(
  {
    schema
  },
  wsServer
)

// Note you must call `server.start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
await server.start()

// Specify the path where we'd like to mount our server
app.use(
  '/',
  cors(),
  bp.json(),
  expressMiddleware(server, {
    context: () => {
      return {
        dataSources: {
          orderAPI: new OrderAPI(),
          paymentAPI: new PaymentAPI(),
          fulfilmentAPI: new FulfilmentAPI()
        }
      }
    }
  })
)

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve))
console.log(`🚀 Server ready at http://localhost:4000/`)
