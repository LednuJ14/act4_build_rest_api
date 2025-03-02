"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.comparePassword = exports.findByEmail = exports.create = exports.findOne = exports.findAll = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
let users = loadUsers();
function loadUsers() {
    try {
        const data = fs_1.default.readFileSync("./users.json", "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        console.log(`Error {error}`);
        return {};
    }
}
function saveUsers() {
    try {
        fs_1.default.writeFileSync("./users.json", JSON.stringify(users), "utf-8");
        console.log(`User saved successfully!`);
    }
    catch (error) {
        console.log(`Error : ${error}`);
    }
}
const findAll = async () => Object.values(users);
exports.findAll = findAll;
const findOne = async (id) => users[id];
exports.findOne = findOne;
const create = async (userData) => {
    let id = (0, uuid_1.v4)();
    let check_user = await (0, exports.findOne)(id);
    while (check_user) {
        id = (0, uuid_1.v4)();
        check_user = await (0, exports.findOne)(id);
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(userData.password, salt);
    const user = {
        id: id,
        username: userData.username,
        email: userData.email,
        password: hashedPassword
    };
    users[id] = user;
    saveUsers();
    return user;
};
exports.create = create;
const findByEmail = async (user_email) => {
    const allUsers = await (0, exports.findAll)();
    const getUser = allUsers.find(result => user_email === result.email);
    if (!getUser) {
        return null;
    }
    return getUser;
};
exports.findByEmail = findByEmail;
const comparePassword = async (email, supplied_password) => {
    const user = await (0, exports.findByEmail)(email);
    const decryptPassword = await bcryptjs_1.default.compare(supplied_password, user.password);
    if (!decryptPassword) {
        return null;
    }
    return user;
};
exports.comparePassword = comparePassword;
const update = async (id, updateValues) => {
    const userExists = await (0, exports.findOne)(id);
    if (!userExists) {
        return null;
    }
    if (updateValues.password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        const newPass = await bcryptjs_1.default.hash(updateValues.password, salt);
        updateValues.password = newPass;
    }
    users[id] = {
        ...userExists,
        ...updateValues
    };
    saveUsers();
    return users[id];
};
exports.update = update;
const remove = async (id) => {
    const user = await (0, exports.findOne)(id);
    if (!user) {
        return null;
    }
    delete users[id];
    saveUsers();
};
exports.remove = remove;
