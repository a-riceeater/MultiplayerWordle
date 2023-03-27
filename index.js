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

io.on("connection", (socket) => {
    // Socket.io connection established
})

const port = process.env.port;
server.listen(port, () => {
    console.log("\x1b[33mServer Running!")
    console.log("\x1b[31mThis is a development server, do not use this for hosting!\n")
    console.log(`\x1b[0mRunning on:\nhttp://localhost:${port}`)
})