export default {
  Query: {
    getCoffees: (_, __, { dataSources }) => {
      return dataSources.orderAPI.getCoffees()
    }
  },
  Mutation: {
    createOrder: (parent, args, context, info) => {
      return {
        id: '1',
        coffee: {
          id: '1',
          name: 'Cappuccino',
          description:
            'A cappuccino is an espresso-based coffee drink that originated in Italy, and is traditionally prepared with steamed milk foam.',
          price: 250
        },
        status: 'IN_PROGRESS',
        note: 'Extra hot please',
        milk: {
          id: '1',
          name: 'SOY',
          priceDifference: 0
        },
        size: {
          id: '1',
          name: 'SMALL',
          priceDifference: 0
        },
        finalPrice: 250
      }
    }
  },
  Subscription: {
    orderEvents: {
      subscribe: (parent, args, context, info) => {
        return context.pubsub.asyncIterator('ORDER_STATUS')
      }
    }
  }
}
