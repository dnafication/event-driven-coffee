export default {
  Query: {
    getCoffees: (_, __, { dataSources }) => {
      return dataSources.orderAPI.getCoffees()
    },
    getOrderList: async (_, __, { dataSources }) => {
      const orderList = await dataSources.orderAPI.getOrders()
      return orderList.map((order) => ({
        id: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        coffee: order.coffee,
        status: order.orderStatus,
        note: order.orderNote,
        createdAt: Math.round(order.createdAt / 1000)
      }))
    },
    getPaymentList: async (_, { date }, { dataSources }) => {
      const paymentList = await dataSources.paymentAPI.getPayments(date)
      return paymentList.map((payment) => ({
        id: payment.id,
        orderId: payment.orderId,
        status: payment.paymentStatus,
        paymentIntentId: payment.paymentIntentId,
        clientSecret: payment.clientSecret,
        note: payment.paymentNote,
        createdAt: Math.round(payment.createdAt / 1000)
      }))
    },
    getFulfilmentList: async (_, { date }, { dataSources }) => {
      const fulfilmentList = await dataSources.fulfilmentAPI.getFulfilments(
        date
      )
      return fulfilmentList.map((fulfilment) => ({
        id: fulfilment.id,
        orderId: fulfilment.orderId,
        status: fulfilment.fulfilmentStatus,
        note: fulfilment.fulfilmentNote,
        createdAt: Math.round(fulfilment.createdAt / 1000)
      }))
    }
  },
  Mutation: {
    createOrder: async (
      parent,
      { coffeeId, customerId, customerName },
      { dataSources },
      info
    ) => {
      const coffees = await dataSources.orderAPI.getCoffees()
      const coffee = coffees.find((coffee) => coffee.id == coffeeId)
      if (!coffee) {
        throw new Error('Invalid coffee ID')
      }
      const order = await dataSources.orderAPI.createOrder({
        coffee,
        customerId,
        customerName
      })
      return {
        id: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        coffee: order.coffee,
        status: order.orderStatus,
        note: order.orderNote,
        createdAt: Math.round(order.createdAt / 1000)
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
