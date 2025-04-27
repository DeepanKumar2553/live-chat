const { StatusCodes } = require('http-status-codes')

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
}

const errorHandler = (err, req, res, next) => {
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || 'Something went wrong, try again later',
    }

    return res.status(customError.statusCode).json({ message: customError.message })
}

module.exports = { notFound, errorHandler }