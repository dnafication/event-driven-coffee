import { setTimeout } from "timers/promises";

const resolvers = {
  Query: {
    // greetings: () => 'Hey there!'
  },
  Subscription: {
    // greetings: {
    //   async *subscribe() {
    //     const greetings = ['Hello', 'Bonjour', 'Hola', 'Hallo', 'Ciao', 'Hej']
    //     for (const greeting of greetings) {
    //       await setTimeout(10000)
    //       yield { greetings: greeting }
    //     }
    //   }
    // }
  },
};

export default resolvers;
