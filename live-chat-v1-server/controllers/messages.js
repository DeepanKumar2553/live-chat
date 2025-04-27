const expressAsyncHandler = require("express-async-handler")
const Message = require("../models/messageSchema")
const Chat = require("../models/chatSchema")

const allMessages = expressAsyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name email")
            .populate("chat")
            .sort({ createdAt: 1 })
        res.json(messages)
    } catch (error) {
        console.error("Error fetching messages:", error)
        res.status(500).json({ error: "Couldn't get messages" })
    }
})

const sendMessage = expressAsyncHandler(async (req, res) => {
    const { content, chatId } = req.body
    const io = req.app.get('io')

    if (!content?.trim() || !chatId) {
        return res.status(400).json({ error: "Invalid message data" })
    }

    const isChat = await Chat.findById(chatId)

    if (!isChat) {
        return res.status(400).json({ error: "Chat Doesn't Exists" })
    }

    try {
        const message = await Message.create({
            sender: req.user._id,
            content: content.trim(),
            chat: chatId
        })

        const fullMessage = await Message.populate(message, [
            { path: "sender", select: "name" },
            {
                path: "chat",
                populate: {
                    path: "users",
                    select: "name email",
                    model: "User"
                }
            }
        ])

        await Chat.findByIdAndUpdate(chatId, { latestMessage: fullMessage })

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { latestMessage: fullMessage },
            { new: true }
        )
            .populate('users', '-password')
            .populate('latestMessage')

        io.to(chatId).emit("message received", fullMessage)
        io.emit('conversation updated', updatedChat)

        res.status(201).json(fullMessage)
    } catch (error) {
        console.error("Error sending message:", error)
        res.status(500).json({ error: "Message sending failed" })
    }
})

module.exports = { allMessages, sendMessage }