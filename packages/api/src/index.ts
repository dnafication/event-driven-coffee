import { createServer } from "http";
import { getYoga } from "./yoga";

const main = async () => {
  const yoga = await getYoga();
  const server = createServer(yoga);
  const PORT = 4000;
  server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}/graphql`);
  });
};

main();
