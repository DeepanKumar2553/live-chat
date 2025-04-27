const UserModel = require('../models/userSchema')
const { StatusCodes } = require('http-status-codes')
const expressAsyncHandler = require("express-async-handler")
const generateToken = require('../config/generateToken')

const signUpController = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json(req.body)
        throw Error("All necessary input fields have not been filled")
    }

    const userExists = await UserModel.findOne({ email })
    if (userExists) {
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("Email Already Exists")
    }

    const nameExists = await UserModel.findOne({ name })
    if (nameExists) {
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("UserName Already Exists")
    }

    const user = await UserModel.create({ name, email, password })
    if (user) {
        res.status(StatusCodes.CREATED).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        })
    } else {
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("Registration Error")
    }
})

const loginController = expressAsyncHandler(async (req, res) => {
    const { name, password } = req.body

    const user = await UserModel.findOne({ name })
    if (user && (await user.matchPassword(password))) {
        res.status(StatusCodes.ACCEPTED).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        })
    } else {
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("Invalid UserName or Password")
    }
})

const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {}

    const users = await UserModel.find(keyword).find({ _id: { $ne: req.user._id } })
    res.status(StatusCodes.OK).send(users)
})

module.exports = {
    loginController,
    signUpController,
    fetchAllUsersController
}