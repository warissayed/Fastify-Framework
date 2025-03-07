import fastifyMongodb from "@fastify/mongodb";
import Fastify from "fastify";

const fastify = Fastify({
  logger: true, // this will enable the logger for all the routes
});

fastify.register(fastifyMongodb),
  {
    focusClose: true,
    url: process.env.MONGO_URL,
  };
