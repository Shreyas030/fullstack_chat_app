import { Server } from "socket.io";//server class that listens for WebSocket connections
import http from "http";// to create an HTTP server
import express from "express";//server class that listens for WebSocket connections

const app = express();
const server = http.createServer(app);//An actual HTTP server created using Node’s http module, passing the Express app to it.

//io is a Socket.IO server listening for connections.
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

//track which user is connected on which socket.
const userSocketMap = {}//{userId:socketId}

//Listens for any client that connects via WebSocket.
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // mapping of userId -> socket.id in userSocketMap
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id

    //io.emit() is used to send events to all the connected clients
    //This means I am sending the updated list of all currently online users to every connected frontend,
    //and there, in frontend, the listener "getOnlineUsers" will update the displayed online users list immediately.
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];

        //broadcast the new list of online users again.
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export { io, app, server };