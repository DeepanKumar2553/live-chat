const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')
const expressAsyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id).select("-password")
            next()
        } catch (err) {
            res.status(StatusCodes.UNAUTHORIZED)
            throw new Error("Not Authorized,Token Failed")
        }
    }

    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED)
        throw new Error("Not Authorized,No Token")
    }
})


module.exports = authMiddleware