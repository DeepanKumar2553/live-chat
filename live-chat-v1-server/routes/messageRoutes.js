const express = require("express")
const { allMessages, sendMessage, } = require("../controllers/messages")
const authMiddleware = require("../middleware/authMiddleware")

const Router = express.Router()

Router.route("/:chatId").get(authMiddleware, allMessages)
Router.route("/").post(authMiddleware, sendMessage)

module.exports = Router