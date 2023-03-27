require("dotenv").config();
const express = require("express");
const http = require("http");
const socketio = require("socket.io")
const path = require("path")
const cors = require("cors")

const app = express();
const server = http.createServer(app);
const io = socketio(server, { 'force new connection': true });

app.use(express.json());
app.set("socketio", io);
app.use(express.static("public"))

const rp = (p) => { return path.join(__dirname, "html/" + p )} // one liner lol

app.get("/", (req, res) => {
    res.send("Hello, world!");
})

app.get("/play", (req, res) => {
    res.sendFile(rp("play.html"));
})

app.get("/play/:game", (req, res) => {
    res.sendFile(rp("play.html"))
})

const rooms = new Map();
const roomPlayers = new Map();
const gameWords = new Map();

const words = require("./words").words;

io.on("connection", (socket) => {
    // Socket.io connection established
    socket.on("joinGame", (data) => {
        if (io.sockets.adapter.rooms.get(data.room) && io.sockets.adapter.rooms.get(data.room).size == 5) return;
        socket.join(data.room);
        rooms.set(data.user, data.room)
        console.log(data.user)
        if (!roomPlayers.get(data.room)) roomPlayers.set(data.room, [])
        roomPlayers.set(data.room, roomPlayers.get(data.room).push(data.user));
        socket.emit("gameJoined", { started: io.sockets.adapter.rooms.get(data.room).size == 1 ? true : false })
        if (io.sockets.adapter.rooms.get(data.room).size == 1) { 
            const gws = [];

            for (let i = 0; i < 5; i++) {
                let word = words[Math.floor(Math.random() * words.length)];
                gws.push(word);

                if (i == 4) {
                    gameWords.set(data.room, gws);
                    console.log(gameWords.get(data.room))
                }
            }

            io.to(data.room).emit("startGame", { players: roomPlayers.get(data.room) }) 
        }
    })

})

const port = process.env.port;
server.listen(port, () => {
    console.log("\x1b[33mServer Running!")
    console.log("\x1b[31mThis is a development server, do not use this for hosting!\n")
    console.log(`\x1b[0mRunning on:\nhttp://localhost:${port}`)
})