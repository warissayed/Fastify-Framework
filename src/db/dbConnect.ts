import fastifyPlugin from "fastify-plugin";
import fastifyMongo from "@fastify/mongodb";
import { FastifyInstance } from "fastify";
import dotenv from "dotenv";

dotenv.config();

async function dbConnector(fastify: FastifyInstance) {
  try {
    await fastify.register(fastifyMongo, {
      url: process.env.MONGO_URL || "mongodb://localhost:27017/test",
    });

    fastify.after(() => {
      if (!fastify.mongo.db) {
        throw new Error("❌ MongoDB connection is undefined.");
      }
      console.log("✅ MongoDB Connected Successfully");
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

export default fastifyPlugin(dbConnector);
