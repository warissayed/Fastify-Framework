const CreateUserSchema = {
  body: {
    type: "object",
    required: ["email", "password", "name"], //if you want to make some fields optional, you can remove them from the required array
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      name: { type: "string" },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};

async function userRouter(fastify, options) {
  await fastify.post(
    "/auth",
    { schema: CreateUserSchema },
    (request, reply) => {
      //validation request
      console.log(request.body);
      reply.code(201);
      return { message: "user Created", id: "123" };
    }
  );
}
export default userRouter;
