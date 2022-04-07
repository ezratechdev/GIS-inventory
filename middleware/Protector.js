const jwt = require("jsonwebtoken");
const {ResponseFunction} = require("../components/Response");
const connector = require("mysql").createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"GIS",
});

const Protect = (req , res , next)=>{
    let token;
    try{
        // 
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
            if(!token){
                res.json({
                    ...ResponseFunction({
                        error:true,
                        message:`A valid token was not found`,
                    }),
                })
            }
            const {id , operation} = jwt.verify(token, "secretsignkey");
            if(operation == "auth"){
                const query = "SELECT username , identity , email , previledge , userID , password  FROM users where users.userID='"+id+"'";
                connector.query(query,(error,result,fields)=>{
                    if(!error){
                        req.user = result;
                        next();
                    }
                });
            }


        }
    } catch(error){
        res.json({
            ...ResponseFunction({
                error:false,
                message:`An error occurred\n${error}`,
            })
        })
    }
}

module.exports = Protect;