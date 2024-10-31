const { createServer } = require("http")
const { Server } = require("socket.io")
const { PrismaClient } = require("@prisma/client")

const httpServer = createServer()

const prisma = new PrismaClient()

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log("user connected", socket.id)

  socket.on("message", (msg) => {
    if (msg) {
      const createMessage = async () => {
        const newMessage = await prisma.message.create({
          data: {
            user: {
              connect: { id: msg.fromUserId },
            },
            fromUserId: msg.fromUserId,
            toUserId: msg.toUserId,
            message: msg.message,
          },
        })

        //send msg to back to client
        socket.emit("message", newMessage)

        //for realtime chat
        //send msg to all users which in this connection
        io.emit("message", newMessage)
      }
      createMessage()
    }

    //SEND MESSAGES WITHOUT USING DATABASE
    //send msg to back to client
    // socket.emit('message', msg)

    //for realtime chat
    //send msg to all users which in this connection
    // io.emit('message', msg)
  })

  socket.on("disconnect", () => {
    console.log("user disconected", socket.id)
  })
})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log("listen port")
})
