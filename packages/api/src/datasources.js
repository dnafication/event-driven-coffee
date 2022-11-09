import { RESTDataSource } from '@apollo/datasource-rest'

export class OrderAPI extends RESTDataSource {
  constructor() {
    super()
    this.memoizeGetRequests = false
    this.baseURL = process.env.ORDER_API_URL
  }

  async getOrders(date) {
    console.log(`getOrders: /orders?date=${date}`)
    return this.get('order?date=' + date)
  }

  async getOrderById(orderId) {
    console.log(`getOrderById: ${orderId}`)
    try {
      const data = await this.get(`order/${orderId}`)
      return data
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async getOrdersForUser(customerId) {
    console.log(`getOrdersForUser: ${customerId}`)
    return this.get(`order?customerId=${customerId}`)
  }

  async getCoffees() {
    console.log(`getCoffees: ${this.baseURL}`)
    return this.get('coffees')
  }

  async createOrder(order) {
    console.log(`createOrder: ${JSON.stringify(order)}`)
    return this.post('order', {
      body: order
    })
  }

  async cancelOrder(orderId, note) {
    return this.patch(`order/${orderId}`, {
      status: 'ORDER_CANCELLED',
      note: note ?? 'Note not provided'
    })
  }
}

export class PaymentAPI extends RESTDataSource {
  constructor() {
    super()
    this.memoizeGetRequests = false
    this.baseURL = process.env.PAYMENT_API_URL
  }

  async getPayments(date) {
    console.log(`getPayments: payment?date=${date}`)
    return this.get(`payment?date=${date}`)
  }

  async getPaymentById(id) {
    console.log(`getPaymentById: ${id}`)
    return this.get(`payment/${id}`)
  }

  async makePayment(orderId) {
    console.log(`makePayment: orderId: ${JSON.stringify(orderId)}`)
    const order = new OrderAPI()
    const orderDetails = await order.getOrderById(orderId)
    return this.post('payment', {
      body: {
        orderId: orderDetails.id,
        customerId: orderDetails.customerId,
        customerName: orderDetails.customerName,
        coffee: orderDetails.coffee
      }
    })
  }
}

export class FulfilmentAPI extends RESTDataSource {
  constructor() {
    super()
    this.memoizeGetRequests = false
    this.baseURL = process.env.FULFILMENT_API_URL
  }

  async getFulfilments(date) {
    console.log(`getFulfilments: fulfilment?date=${date}`)
    return this.get('fulfilment?date=' + date)
  }

  async getFulfilmentById(id) {
    console.log(`getFulfilmentById: ${id}`)
    return this.get(`fulfilment/${id}`)
  }

  async completeFulfilment(fulfilmentId, note) {
    console.log(`completeFulfilment: ${note}`)
    return this.patch(`fulfilment/${fulfilmentId}`, {
      body: {
        status: 'FULFILMENT_COMPLETED',
        note: note ?? 'Note not provided'
      }
    })
  }

  async rejectFulfilment(fulfilmentId, note) {
    console.log(`rejectFulfilment: ${note}`)
    return this.patch(`fulfilment/${fulfilmentId}`, {
      body: {
        status: 'FULFILMENT_REJECTED',
        note: note ?? 'Note not provided'
      }
    })
  }
}
