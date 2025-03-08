import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface UserRequestBody {
  email: string;
  password: string;
  name?: string; // Optional for login
}

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Schema for creating a user
const CreateUserSchema = {
  body: {
    type: "object",
    required: ["email", "password", "name"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      name: { type: "string" },
    },
  },
};

// Schema for login
const LoginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
};

async function userRouter(fastify: FastifyInstance) {
  // Register a new user
  fastify.post(
    "/register",
    { schema: CreateUserSchema },
    async (
      request: FastifyRequest<{ Body: UserRequestBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { email, password, name } = request.body;
        const userCollection = fastify.mongo.db?.collection("users");

        if (!userCollection) {
          reply.code(500).send({ error: "Database connection error" });
          return;
        }

        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
          reply.code(400).send({ error: "User already exists" });
          return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await userCollection.insertOne({
          name,
          email,
          password: hashedPassword,
        });

        reply.code(201).send({
          message: "User Created",
          id: result.insertedId.toString(),
        });
      } catch (error) {
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  // User login
  fastify.post(
    "/login",
    { schema: LoginSchema },
    async (
      request: FastifyRequest<{ Body: UserRequestBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { email, password } = request.body;
        const userCollection = fastify.mongo.db?.collection("users");

        if (!userCollection) {
          reply.code(500).send({ error: "Database connection error" });
          return;
        }

        const user = await userCollection.findOne({ email });
        if (!user) {
          reply.code(400).send({ error: "Invalid email or password" });
          return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          reply.code(400).send({ error: "Invalid email or password" });
          return;
        }

        const token = jwt.sign(
          { id: user._id, email: user.email },
          JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        reply.code(200).send({ message: "Login successful", token });
      } catch (error) {
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  // Update user
  fastify.put(
    "/update",
    async (
      request: FastifyRequest<{
        Body: { email: string; name?: string; password?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { email, name, password } = request.body;
        const userCollection = fastify.mongo.db?.collection("users");

        if (!userCollection) {
          reply.code(500).send({ error: "Database connection error" });
          return;
        }

        const user = await userCollection.findOne({ email });
        if (!user) {
          reply.code(404).send({ error: "User not found" });
          return;
        }

        const updateFields: any = {};
        if (name) updateFields.name = name;
        if (password) updateFields.password = await bcrypt.hash(password, 10);

        await userCollection.updateOne({ email }, { $set: updateFields });

        reply.code(200).send({ message: "User updated successfully" });
      } catch (error) {
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  // Delete user
  fastify.delete(
    "/delete",
    async (
      request: FastifyRequest<{ Body: { email: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { email } = request.body;
        const userCollection = fastify.mongo.db?.collection("users");

        if (!userCollection) {
          reply.code(500).send({ error: "Database connection error" });
          return;
        }

        const result = await userCollection.deleteOne({ email });
        if (result.deletedCount === 0) {
          reply.code(404).send({ error: "User not found" });
          return;
        }

        reply.code(200).send({ message: "User deleted successfully" });
      } catch (error) {
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );
}

export default userRouter;

//POST	/user/register	Register a new user
//POST	/user/login	Login & receive a JWT token
//PUT	/user/update	Update user details (name/password)
//DELETE	/user/delete	Delete a user
