const express = require('express');
const mongoose = require('mongoose');
const readMailBox = require('./helpers/fetchMail')
const authRoutes = require('./routes/authRoutes')
const ticketRoutes = require('./routes/ticketRoutes')
const cors = require("cors");
require("dotenv").config();

// express app
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("connected");
        var mbox = await readMailBox();
        //console.log(mbox);
        app.listen(process.env.PORT);
    })
    .catch(err => console.log(err));

app.use(express.json());
app.use(cors());
//app.use(express.urlencoded({ extended: true }));

//app.get("/", ()=>console.log("ss"))
app.use("/api/auth", authRoutes);
app.use("/api/home", ticketRoutes);