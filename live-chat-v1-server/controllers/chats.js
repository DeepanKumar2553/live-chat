const expressAsyncHandler = require("express-async-handler")
const Chat = require("../models/chatSchema")
const User = require("../models/userSchema")
const Message = require("../models/messageSchema")

const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body
    const io = req.app.get('io')

    if (!userId) {
        console.log("UserId param not sent with request")
        return res.sendStatus(400)
    }

    try {
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage")

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name email",
        })

        if (isChat.length > 0) {
            const chatData = isChat[0].toObject()
            return res.status(200).json(chatData)
        }

        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        }

        const createdChat = await Chat.create(chatData)
        const populatedChat = await Chat.findById(createdChat._id)
            .populate("users", "-password")
            .populate("latestMessage")
            .lean()

        populatedChat.users.forEach(user => {
            io.to(user._id.toString()).emit('new conversation', populatedChat)
        })

        res.status(200).json(populatedChat)

    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const fetchChats = expressAsyncHandler(async (req, res) => {
    try {
        Chat.find({ users: req.user._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name email",
                })
                res.status(200).json(results)
            })
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const fetchGroups = expressAsyncHandler(async (req, res) => {
    try {
        const allGroups = await Chat.where("isGroupChat").equals(true)
        res.status(200).json(allGroups)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const joinGroup = expressAsyncHandler(async (req, res) => {
    try {
        const group = await Chat.findById(req.params.groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found', code: 'GROUP_NOT_FOUND' });
        }

        if (group.users.includes(req.user._id)) {
            return res.status(200).json({
                message: 'User already in group',
                code: 'ALREADY_MEMBER',
                chat: group
            });
        }

        group.users.push(req.user._id);
        const updatedGroup = await group.save();

        res.status(200).json({ message: 'Joined group successfully', chat: updatedGroup });
    } catch (error) {
        res.status(500).json({ message: error.message, code: 'SERVER_ERROR' });
    }
})

const createGroupChat = expressAsyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({ message: "Data is insufficient" });
    }

    var users = req.user

    try {
        const verifyGroup = await Chat.findOne({ chatName: req.body.name })

        if (verifyGroup) {
            return res.status(400).json({ message: "Group Already Exists" })
        }

        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        })

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const groupExit = expressAsyncHandler(async (req, res) => {
    const { chatId } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.users.includes(userId)) {
        return res.status(403).json({ message: "User not in group" });
    }

    if (chat.groupAdmin.equals(userId)) {
        return res.status(400).json({ message: "Admin cannot exit group" });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    res.status(200).json(updatedChat);
});

const fetchChatDetails = expressAsyncHandler(async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

const deleteGroupChat = expressAsyncHandler(async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId);

        if (!chat.groupAdmin.equals(req.user._id)) {
            return res.status(403).json({ message: "Only admin can delete group" });
        }

        await Message.deleteMany({ chat: chatId });

        await Chat.findByIdAndDelete(chatId);

        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    accessChat,
    fetchChats,
    fetchGroups,
    createGroupChat,
    joinGroup,
    groupExit,
    fetchChatDetails,
    deleteGroupChat
};