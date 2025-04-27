const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
})
const dotenv = require('dotenv')
const cors = require('cors')
const mongoose = require('mongoose')

const userRoutes = require('./routes/userRoute')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')

const { notFound, errorHandler } = require("./middleware/errorMiddleware")

dotenv.config()
const PORT = process.env.PORT || 5000


const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to MongoDB")
    } catch (err) {
        console.error("MongoDB connection error:", err.message)
        process.exit(1)
    }
}
connectDb()

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}))
app.use(express.json())

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/chats", chatRoutes)
app.use("/api/v1/message", messageRoutes)

io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('setup', (userData) => {
        if (userData?._id) {
            socket.join(userData._id)
            console.log(`User ${userData._id} connected`)
        }
    })

    socket.on('join chat', (chatId) => {
        socket.join(chatId)
        console.log(`User joined chat: ${chatId}`)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
})

app.use(notFound)
app.use(errorHandler)

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

app.set('io', io)