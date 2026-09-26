const express = require("express");
const http = require("http");
const { Server } = require("socket.io")
const { registerSocketEvents } = require("./public/js/socket");
const morgan = require("morgan");
const dotenv = require("dotenv").config();
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;


app.use(morgan("dev"));
app.use(express.json());

// Frontend
app.use("/", express.static(path.join(__dirname, "/public/html")));
app.use("/js", express.static(path.join(__dirname, "/public/js")));


io.on("connection", (socket) => {
    console.log("Se conectó:", socket.id);
    registerSocketEvents(io, socket);
});

server.listen(port, () =>{
    console.log(`Running on http://localhost:${port}`)
});