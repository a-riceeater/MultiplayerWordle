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

const rp = (p) => { return path.join(__dirname, "html/" + p) } // one liner lol

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
        // roomPlayers.set(data.room, eval(roomPlayers.get(data.room)).push(data.user));
        socket.emit("gameJoined", { started: io.sockets.adapter.rooms.get(data.room).size == 1 ? true : false })
        if (io.sockets.adapter.rooms.get(data.room).size == 1) {
            const gws = [];

            for (let i = 0; i < 5; i++) {
                let word = words[Math.floor(Math.random() * words.length)];
                gws.push(word);

                if (i == 4) {
                    console.log(gws)
                    gameWords.set(data.room, gws);
                }
            }

            io.to(data.room).emit("startGame", { players: roomPlayers.get(data.room) })
        }
    })

    socket.on("verifyWord", (data) => {
        const word = data.word.toLowerCase();
        if (!word) return;
        if (word.length != 5) return;
        const gws = gameWords.get(rooms.get(data.user))
        console.log(gws[0])
        if (words.includes(word)) {
            if (word == gws[0]) socket.emit("correctWord", { word: word });
            else {
                // 0 wrong, 1: wrong pos, 2: correct
                const curWord = gws[0]
                let result = '';
                for (let i = 0; i < word.length; i++) {
                    if (word[i] == curWord[i]) result += '2'
                    else {
                        if (curWord.includes(word[i])) result += '1'
                        else result += '0'
                    }

                    if (i == word.length - 1) {
                        socket.emit("wordStatus", { result: result })
                    }
                }
            }
        } else {
            socket.emit("wordNotExist", { word: word })
        }
    })

})

const port = process.env.port;
server.listen(port, () => {
    console.log("\x1b[33mServer Running!")
    console.log("\x1b[31mThis is a development server, do not use this for hosting!\n")
    console.log(`\x1b[0mRunning on:\nhttp://localhost:${port}`)
})