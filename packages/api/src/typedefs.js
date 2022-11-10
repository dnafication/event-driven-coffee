export default `#graphql
  type Query {
    getCoffees: [Coffee]

    """
    admin only
    """
    getOrderList(date: String, customerId: String): [OrderDetail]
    
    """
    admin only
    """
    getPaymentList(date: String): [PaymentDetail]
    
    """
    admin only
    """
    getFulfilmentList(date: String): [FulfilmentDetail]
  }

  type Mutation {
    createOrder(coffeeId: ID!, customerId: String!, customerName: String!): OrderDetail!
    makePayment(orderId: ID!): PaymentDetail!
    cancelOrder(orderId: ID!): OrderDetail!

    """
    admin only
    """
    rejectFulfilment(fulfilmentId: ID!, note: String): FulfilmentDetail!

    """
    admin only
    """
    completeFulfilment(fulfilmentId: ID!, note: String): FulfilmentDetail!

    """
    used by the notifier lambda
    """
    publishOrderStatus(orderId: ID!): Boolean!
    publishPaymentStatus(paymentId: ID!): Boolean!
    publishFulfilmentStatus(fulfilmentId: ID!): Boolean!
  }

  type Subscription {
    orderUpdated(orderId:String, customerId: String): OrderDetail
    paymentUpdated(paymentId: String, customerId: String): PaymentDetail
    fulfilmentUpdated(fulfilmentId: String, customerId: String): FulfilmentDetail
  }

  type Coffee {
    id: ID!
    name: String!
    description: String!
    price: Int! # in cents
  }

  type OrderDetail {
    id: ID!
    customerId: String!
    customerName: String!
    coffee: Coffee
    status: String!
    note: String
    createdAt: Int! # timestamp in seconds
  }

  type PaymentDetail {
    id: ID!
    orderId: ID!
    status: String!
    paymentIntentId: String
    clientSecret: String
    note: String
    createdAt: Int! # timestamp in seconds
  }

  type FulfilmentDetail {
    id: ID!
    orderId: ID!
    status: String!
    note: String
    createdAt: Int! # timestamp in seconds
  }

`
