"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const database = __importStar(require("./user.database"));
exports.userRouter = express_1.default.Router();
// Get all users
exports.userRouter.get("/users", async (req, res) => {
    try {
        const allUsers = await database.findAll();
        if (!allUsers || allUsers.length === 0) {
            res
                .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                .json({ msg: "No users at this time.." });
            return;
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({ total_user: allUsers.length, allUsers });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An unknown error occurred" });
        }
    }
});
// Register user
exports.userRouter.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json({ error: "Please provide all required parameters." });
            return;
        }
        const existingUser = await database.findByEmail(email);
        if (existingUser) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json({ error: "This email has already been registered." });
            return;
        }
        const newUser = await database.create(req.body);
        res.status(http_status_codes_1.StatusCodes.CREATED).json({ newUser });
    }
    catch (error) {
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: error.message });
    }
});
// Login user
exports.userRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json({ error: "Please provide email and password." });
            return;
        }
        const user = await database.findByEmail(email);
        if (!user) {
            res
                .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                .json({ error: "No user exists with the email provided." });
            return;
        }
        const isPasswordValid = await database.comparePassword(email, password);
        if (!isPasswordValid) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json({ error: "Incorrect password!" });
            return;
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({ user });
    }
    catch (error) {
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: error.message });
    }
});
// Get user by ID
exports.userRouter.get("/user/:id", async (req, res) => {
    try {
        const user = await database.findOne(req.params.id);
        if (!user) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "User not found!" });
            return;
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({ user });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An unknown error occurred" });
        }
    }
});
// Delete user
exports.userRouter.delete("/user/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await database.findOne(id);
        if (!user) {
            res
                .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                .json({ error: "User does not exist." });
            return;
        }
        await database.remove(id);
        res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "User deleted successfully." });
    }
    catch (error) {
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: error.message });
    }
});
