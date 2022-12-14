import { PubSub, withFilter } from 'graphql-subscriptions'

const pubsub = new PubSub()

export default {
  Query: {
    getCoffees: (_, __, { dataSources }) => {
      return dataSources.orderAPI.getCoffees()
    },
    getOrderList: async (_, { date, customerId }, { dataSources }) => {
      let orderList
      if (customerId) {
        orderList = await dataSources.orderAPI.getOrdersForUser(customerId)
      } else {
        orderList = await dataSources.orderAPI.getOrders(date)
      }
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
      _,
      { coffeeId, customerId, customerName },
      { dataSources }
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
    },
    makePayment: async (_, { orderId }, { dataSources }) => {
      const payment = await dataSources.paymentAPI.makePayment(orderId)
      return {
        id: payment.id,
        orderId: payment.orderId,
        status: payment.paymentStatus,
        paymentIntentId: payment.paymentIntentId,
        clientSecret: payment.clientSecret,
        note: payment.paymentNote,
        createdAt: Math.round(payment.createdAt / 1000)
      }
    },
    cancelOrder: async (_, { orderId }, { dataSources }) => {
      const order = await dataSources.orderAPI.cancelOrder(orderId)
      return {
        id: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        coffee: order.coffee,
        status: order.orderStatus,
        note: order.orderNote,
        createdAt: Math.round(order.createdAt / 1000)
      }
    },
    rejectFulfilment: async (_, { fulfilmentId, note }, { dataSources }) => {
      const fulfilment = await dataSources.fulfilmentAPI.rejectFulfilment(
        fulfilmentId,
        note
      )
      return {
        id: fulfilment.id,
        orderId: fulfilment.orderId,
        status: fulfilment.fulfilmentStatus,
        note: fulfilment.fulfilmentNote,
        createdAt: Math.round(fulfilment.createdAt / 1000)
      }
    },
    completeFulfilment: async (_, { fulfilmentId, note }, { dataSources }) => {
      const fulfilment = await dataSources.fulfilmentAPI.completeFulfilment(
        fulfilmentId,
        note
      )
      return {
        id: fulfilment.id,
        orderId: fulfilment.orderId,
        status: fulfilment.fulfilmentStatus,
        note: fulfilment.fulfilmentNote,
        createdAt: Math.round(fulfilment.createdAt / 1000)
      }
    },
    publishOrderStatus: async (_, { orderId }, { dataSources }) => {
      // fetch the latest order status
      const order = await dataSources.orderAPI.getOrderById(orderId)
      if (!order) {
        throw new Error('Invalid order ID')
      }
      console.log('publishing order status', order.orderStatus)
      pubsub.publish('ORDER_STATUS', {
        orderUpdated: {
          ...order,
          status: order.orderStatus,
          note: order.orderNote,
          createdAt: Math.round(order.createdAt / 1000)
        }
      })
      return true
    },
    publishPaymentStatus: async (_, { paymentId }, { dataSources }) => {
      // fetch the latest payment status
      const payment = await dataSources.paymentAPI.getPaymentById(paymentId)
      if (!payment) {
        throw new Error('Invalid payment ID')
      }
      console.log('publishing payment status', payment.paymentStatus)
      pubsub.publish('PAYMENT_STATUS', {
        paymentUpdated: {
          ...payment,
          status: payment.paymentStatus,
          note: payment.paymentNote,
          createdAt: Math.round(payment.createdAt / 1000)
        }
      })
      return true
    },
    publishFulfilmentStatus: async (_, { fulfilmentId }, { dataSources }) => {
      // fetch the latest fulfilment status
      const fulfilment = await dataSources.fulfilmentAPI.getFulfilmentById(
        fulfilmentId
      )
      if (!fulfilment) {
        throw new Error('Invalid fulfilment ID')
      }
      console.log('publishing fulfilment status', fulfilment.fulfilmentStatus)
      pubsub.publish('FULFILMENT_STATUS', {
        fulfilmentUpdated: {
          ...fulfilment,
          status: fulfilment.fulfilmentStatus,
          note: fulfilment.fulfilmentNote,
          createdAt: Math.round(fulfilment.createdAt / 1000)
        }
      })
      return true
    }
  },
  Subscription: {
    orderUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['ORDER_STATUS']),
        (payload, variables) => {
          if (variables.orderId) {
            return payload.orderUpdated.id == variables.orderId
          }
          if (variables.customerId) {
            return payload.orderUpdated.customerId == variables.customerId
          }
          return true
        }
      )
    },

    paymentUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['PAYMENT_STATUS']),
        (payload, variables) => {
          if (variables.paymentId) {
            return payload.paymentUpdated.id == variables.paymentId
          }
          if (variables.customerId) {
            return payload.paymentUpdated.customerId == variables.customerId
          }
          return true
        }
      )
    },
    fulfilmentUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['FULFILMENT_STATUS']),
        (payload, variables) => {
          if (variables.fulfilmentId) {
            return payload.fulfilmentUpdated.id == variables.fulfilmentId
          }
          if (variables.customerId) {
            return payload.fulfilmentUpdated.customerId == variables.customerId
          }
          return true
        }
      )
    }
  }
}
