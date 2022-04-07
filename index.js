const express = require("express");
const port = 5000 || process.env.PORT;
const app = express();
const Server = require("http").createServer(app);
const path = require("path");
const Auth= require("./routes/Auth");
const Admin = require("./routes/Admin");
const Client = require("./routes/Client");
const {ResponseFunction} = require("./components/Response");
// create a connection to the database
const connection = require("./components/connector");

// middleware to support http
app.use(express.json());
app.use(express.static(path.join(__dirname+"/public")));
app.use(express.urlencoded({extended:true}));
// custom paths
app.use("/auth",Auth);
app.use("/admin",Admin);
app.use("/client",Client);
// end of middleware

app.get("/" , (req , res)=>{
    res.sendFile("index.html");
})


// default response for unknown paths
app.use((req , res)=>{
    res.json({
        ...ResponseFunction({
            error:true,
            message:`Route not found`,
        })
    })
})

connection.connect(error =>{
    if(error) throw new Error(`Faced an error connecting to sql : ${error}`);
    // if connection to database is made then start listening to port
    console.log("Connection to database made");
    Server.listen(port , error => error ? console.log(`Error faced ${error}`) : console.log(`Server runnig on port ${port}`));
})



// 