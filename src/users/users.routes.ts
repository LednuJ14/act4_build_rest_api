import express, { Request, Response } from "express";
import { UnitUser } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

// Get all users
userRouter.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers: UnitUser[] = await database.findAll();
    if (!allUsers || allUsers.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No users at this time.." });
      return;
    }
    res.status(StatusCodes.OK).json({ total_user: allUsers.length, allUsers });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || error });
  }
});

// Register user
userRouter.post(
  "/register",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Please provide all required parameters." });
        return;
      }

      const existingUser = await database.findByEmail(email);
      if (existingUser) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "This email has already been registered." });
        return;
      }

      const newUser = await database.create(req.body);
      res.status(StatusCodes.CREATED).json({ newUser });
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
);

// Login user
userRouter.post(
  "/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Please provide email and password." });
        return;
      }

      const user = await database.findByEmail(email);
      if (!user) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "No user exists with the email provided." });
        return;
      }

      const isPasswordValid = await database.comparePassword(email, password);
      if (!isPasswordValid) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Incorrect password!" });
        return;
      }

      res.status(StatusCodes.OK).json({ user });
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
);

// Get user by ID
userRouter.get(
  "/user/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user: UnitUser | null = await database.findOne(req.params.id);
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "User not found!" });
        return;
      }
      res.status(StatusCodes.OK).json({ user });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || error });
    }
  }
);

// Delete user
userRouter.delete(
  "/user/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const user: UnitUser | null = await database.findOne(id);
      if (!user) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "User does not exist." });
        return;
      }

      await database.remove(id);
      res.status(StatusCodes.OK).json({ msg: "User deleted successfully." });
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
);