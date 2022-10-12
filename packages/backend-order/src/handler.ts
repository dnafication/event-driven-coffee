import {
  PublishCommand,
  PublishCommandInput,
  SNSClient,
} from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: "ap-southeast-2" });

export const processOrder = async (event, context) => {
  const { Records } = event;

  for (const record of Records) {
    const { body, messageId, attributes, messageAttribute } = record;
    const orderPayload = JSON.parse(body);
    console.log("Processing order", orderPayload);
    console.log(
      `Message ID: ${messageId}, Message Attributes: ${JSON.stringify(
        messageAttribute
      )} \n attributes: ${JSON.stringify(attributes)}`
    );

    // process order
  }
};

// test function
export const placeOrder = async () => {
  const params: PublishCommandInput = {
    Message: JSON.stringify({
      orderId: "123",
      orderDate: new Date().toISOString(),
      orderItems: [
        {
          productId: "123",
          quantity: 1,
        },
      ],
    }),
    TopicArn: process.env.ORDERS_SNS_TOPIC_ARN,
    MessageAttributes: {
      orderType: {
        DataType: "String",
        StringValue: "standard",
      },
    },
    Subject: "New Order",
  };

  try {
    const data = await sns.send(new PublishCommand(params));
    console.log("Success", data);
    return data;
  } catch (error) {
    console.log("Error", error);
    return error;
  }
};
