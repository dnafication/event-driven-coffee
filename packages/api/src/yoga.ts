import { createYoga, Plugin, createSchema } from 'graphql-yoga'
import { GraphQLError } from 'graphql'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'
import { loadSchema } from '@graphql-tools/load'
import { join } from 'path'

import resolvers from './resolvers'

// available when handling requests, needs to be provided by the implementor
type ServerContext = {}

// available in GraphQL, during execution/subscription
interface UserContext {
  disableSubscription: boolean
}

export const getYoga = async () => {
  const schema = await loadSchema(join(__dirname, './schema.gql'), {
    loaders: [new GraphQLFileLoader()]
  })

  return createYoga<ServerContext, UserContext>({
    context: {
      disableSubscription: false
    },
    schema: addResolversToSchema({
      schema,
      resolvers
    }),
    plugins: [useDisableSubscription()]
  })
}

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
