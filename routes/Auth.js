const Auth = require("express").Router();
const expressAsynchHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const uuid = require("uuid").v4;
const conn = require("../components/connector");
const bcrypt = require("bcryptjs");

const {ResponseFunction}  = require("../components/Response");
const Protect = require("../middleware/Protector");

// json web token generator 
const generateJWT = ({id , operation})=>{
    return jwt.sign({ id , operation} , "secretsignkey" ,{expiresIn:'30d'});
}

// post requests
Auth.post("/signup",expressAsynchHandler(async(req , res)=>{
    const { identity , email , password , previledge , username } = req.body;
    // check for details
    if(!(identity && email && password && previledge && username)){
        res.json({
            ...ResponseFunction({
                error:true,
                message:"Username , email or password was not passed",
            }),
        })
    }
    // 

    // create a unique user id
    const userID = uuid();
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const createUserStatement = `INSERT INTO users (username ,identity , email , previledge , password , userID) VALUES('${username}', '${identity}', '${email.toLowerCase()}', '${previledge}', '${hashedPassword}' , '${userID}')`;

    conn.query(createUserStatement ,error=>{
        if(error) {
            res.json({
                ...ResponseFunction({
                    error:true,
                    message:"Could not insert new user to database",
                })
            });
        } else
        res.json({
            ...ResponseFunction({
                error:false,
                message:`User with email ${email} has been created`,
                token:generateJWT({ id :userID ,operation :"auth"}),
            })
        })
    })

}));

Auth.post("/login" , expressAsynchHandler(async (req , res)=>{
    const { email , password } = req.body;
    if(!(email && password)){
        res.json({
            ...ResponseFunction({
                error:true,
                message:`Email or password not passed`,
            }),
        })
    }
    const loginQuerry = "Select * FROM users WHERE users.email='"+email+"'";

    conn.query(loginQuerry,async (error , result , fields)=>{
        if(error){
            res.json({
                ...ResponseFunction({
                    error:true,
                    message:`Invalid details sent.User does not exist\n${error}`,
                }),
            })
        }
        if(typeof result != "undefined" && result.length > 0){
            const { userID , email} = result[0];
            const gainedPassword = result[0].password;
            const v = await require("bcryptjs").compare(password , result[0].password);
            if(v){
                res.json({
                    ...ResponseFunction({
                        error:false,
                        message:`Login successful for user with email ${email}`,
                        token:generateJWT({id:userID , operation:"auth"}),
                    })
                })
            }else{
                res.json({
                    ...ResponseFunction({
                        error:true,
                        message:`Login failed.Wrong password.Try again , ${gainedPassword} , ${password}`,
                    })
                })
            }
        } else res.json({result:"invalid credentials"});
    });
}));

Auth.post("/getpage" , Protect , (req ,res)=>{
    if(req.user){
       const{ previledge , email } = req.user[0];
       res.json({
           error:false,
           message:`User was found , redirect to :${previledge == "student" ? "client page" :"admin page"}`,
           page:`${previledge == "student" ? 'client' : 'admin'}`,
           email,
       });
    }else res.json({
        ...ResponseFunction({
            error:true,
            message:`Unable to authorize user as user was not found , try again`,
        }),
    });
} )

Auth.post("/reset" , Protect , async (req , res)=>{
    const { password , userID , email } = req.user[0];
    const {oldPass , newPass } = req.body;
    if(!(oldPass && newPass)){
        res.json({
            error:true,
            message:`Old or new password was not passed`,
        });
    }
    const v = await require("bcryptjs").compare(password , result[0].password);
    if(v){
        const updateQuerry = "UPDATE users SET users.password='"+newPass+"' WHERE users.userID='"+userID+"'";
        conn.query(updateQuerry ,(error)=>{
            if(error){
                res.json({
                    error:true,
                    message:`Faced some error from the server\n${error}`,
                    status:500,
                })
            }
            res.json({
                error:false,
                message:`Password for ${email} has been updated succesfully`,
                status:200,
            })
        })
    }else{
        res.json({
            error:true,
            message:`Your current password is incorrect`
        })
    }
});


Auth.delete("/deleteAccount" , Protect , (req , res)=>{
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { userID , email } = req.user[0];
    if (!userID) {
        res.json({

            error: true,
            message: `User id was not found kindly try again`,

        })
        return;
    }

    const deleteUserQuerry = "DELETE FROM users where users.userID='"+userID+"'";
    conn.query(deleteUserQuerry , (error)=>{
        if(error){
            res.json({
                error:true,
                message:`Error faced\n${error}`,
                status:500,
            });
            return;
        }
        res.json({
            error:false,
            message:`Account for user with email ${email} has been deleted`,
            status:200,
        });
    });
});

module.exports = Auth;