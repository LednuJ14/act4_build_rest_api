import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./users/users.routes"; // Removed `.js` to match TypeScript module resolution

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7000; // Default to 3000 if PORT is not set

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Register routes
app.use("/api", userRouter); // Changed '/' to '/api' for better structure

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
