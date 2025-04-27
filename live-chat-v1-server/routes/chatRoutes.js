const express = require("express")
const {
    accessChat,
    fetchChats,
    createGroupChat,
    joinGroup,
    groupExit,
    fetchGroups,
    fetchChatDetails,
    deleteGroupChat
} = require("../controllers/chats")
const authMiddleware = require("../middleware/authMiddleware")

const Router = express.Router()

Router.route("/").post(authMiddleware, accessChat)
Router.route("/").get(authMiddleware, fetchChats)
Router.route("/createGroup").post(authMiddleware, createGroupChat)
Router.route("/fetchGroups").get(authMiddleware, fetchGroups)
Router.route("/groupExit").post(authMiddleware, groupExit)
Router.route("/joinGroup/:groupId").put(authMiddleware, joinGroup)
Router.route("/:chatId").get(authMiddleware, fetchChatDetails)
Router.route("/:chatId").delete(authMiddleware, deleteGroupChat)

module.exports = Router