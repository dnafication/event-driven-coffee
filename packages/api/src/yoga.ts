import { createYoga, Plugin, createSchema } from 'graphql-yoga'
import { GraphQLError } from 'graphql'
import { setTimeout } from 'timers/promises'

// available when handling requests, needs to be provided by the implementor
type ServerContext = {}

// available in GraphQL, during execution/subscription
interface UserContext {
  disableSubscription: boolean
}

export const yoga = createYoga<ServerContext, UserContext>({
  context: {
    disableSubscription: true
  },
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
      type Subscription {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () =>
          'This is the `greetings` field of the root `Query` type'
      },
      Subscription: {
        greetings: {
          async *subscribe() {
            const greetings = [
              'Hello',
              'Bonjour',
              'Hola',
              'Hallo',
              'Ciao',
              'Hej'
            ]
            for (const greeting of greetings) {
              await setTimeout(1000)
              yield { greetings: greeting }
            }
          }
        }
      }
    }
  }),
  plugins: []
})

// context only relevant to the plugin
type DisableSubscriptionPluginContext = {}

function useDisableSubscription(): Plugin<
  DisableSubscriptionPluginContext,
  ServerContext,
  UserContext
> {
  return {
    onSubscribe({ args }) {
      if (args.contextValue.disableSubscription) {
        throw new GraphQLError('Subscriptions have been disabled', {
          extensions: {
            http: {
              status: 400 // report error with a 400
            }
          }
        })
      }
    }
  }
}
