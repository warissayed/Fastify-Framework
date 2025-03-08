import Fastify from "fastify";
import dbConnect from "./db/dbConnect.js"; // Ensure correct import
import userRouter from "./routes/user.js";

const fastify = Fastify({ logger: true });

// ✅ Register DB Connection First
fastify.register(dbConnect);

// ✅ Register Routes After DB Connection
fastify.register(userRouter, { prefix: "/user" });

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

const start = async () => {
  const PORT = Number(process.env.PORT) || 3000;
  try {
    await fastify.listen({ port: PORT });
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

start();
