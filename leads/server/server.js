const path = require('path');
require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();

const server = createServer(app);

const io = new Server(server);


app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "..", "views")
);


app.set("io", io);



const home = require("../routes/router");

app.use(home);


io.on("connection", (socket) => {

    console.log(
        "🟢 Browser connected:",
        socket.id
    );


    socket.on("disconnect", () => {

        console.log(
            "🔴 Browser disconnected:",
            socket.id
        );

    });

});


mongoose
    .connect(process.env.DB_URL)

    .then(() => {

        console.log(" Connected To DB");


        server.listen(
            process.env.PORT || 3000,
            () => {

                console.log(
                    ` Server running at http://localhost:${process.env.PORT || 3000}`
                );

            }
        );

    })

    .catch((error) => {

        console.error(
            "Database connection failed:",
            error
        );

    });