import Fastify from "fastify";
import userRouter from "./routes/user.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(userRouter, { prefix: "/user" });

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

const start = async () => {
  const PORT = Number(process.env.PORT) || 3000;
  try {
    await fastify.listen({ port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
