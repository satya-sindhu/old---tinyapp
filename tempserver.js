const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const PORT = 8090; // default port 8090
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

app.get("/register", (req,rs) =>{
    console.log("reached the register");
    rs.send("Hi")
})

app.listen(PORT,() =>{
    console.log("server");
})
