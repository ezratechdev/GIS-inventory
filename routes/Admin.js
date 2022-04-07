const Admin = require("express").Router();
const Protect = require("../middleware/Protector");
const multer = require("multer");

// const ResponseFunction = require("../components/Response");
const connector = require("../components/connector");
const uuid = require("uuid").v4;


// to do 
// enable account deletion


// protected routes

// get all equipments
Admin.get("/getall", Protect, (req, res) => {
    // console.log("hi");
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { previledge } = req.user[0];
    if (previledge == "student") {
        res.json({

            error: true,
            message: `You are not authorized to perform this operation`,

        });
    }

    const getEquipments = "SELECT * FROM equipments";
    connector.query(getEquipments, (error, result, fields) => {
        if (error) {
            res.json({
                error: true,
                message: `An error occurred while fetching all equipments\n${error}`,
            })
        }
        // console.log(result);
        if(result.length > 0){
            res.json({
                error: false,
                message: `Equipments data obtained`,
                equipments: result,
            })
        }else{
            res.json({
                error: false,
                message: `Equipments data obtained`,
                equipments: [],
            })
        }
    });

});

// get single

Admin.get("/getsingle/:id", Protect, (req, res) => {
    const { id } = req.params;
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { previledge } = req.user[0];
    if (previledge == "student") {
        res.json({

            error: true,
            message: `You are not authorized to perform this operation`,

        });
    }

    if (!id) {
        res.json({
            error: true,
            message: `Equipment id was not passed`,
            status: 404,
        })
    }

    const getEquipments = "SELECT * FROM equipments WHERE equipments.equipmentID='" + id + "'";
    connector.query(getEquipments, (error, result, fields) => {
        if (error) {
            res.json({
                error: true,
                message: `An error occurred while fetching all equipments\n${error}`,
            })
        }
        // console.log(result);
        res.json({
            error: false,
            message: `Equipments data obtained`,
            equipments: result,
        })
    });

});
// 
const randomNumberFunc = (initial,final)=>{
    // returns random number between inital and final
    if(final > initial)
    return initial + (Math.floor(Math.random() * final));
    else return randomNumberFunc(50,200);
}

const randomStringName = ()=>{
    return `${randomNumberFunc(40,60)}${randomNumberFunc(50,200)}${randomNumberFunc(10,20)}${randomNumberFunc(0,1)}`;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${randomStringName()+`.`+file.originalname.split(`.`)[file.originalname.split(`.`).length -1]}`);
    },
});
const upload = multer({ storage });
// create an equipment
Admin.post("/create", [Protect , upload.single("image")], (req, res) => {
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { previledge } = req.user[0];
    if (previledge == "student") {
        res.json({

            error: true,
            message: `You are not authorized to perform this operation`,

        })
    }
    // add image later using multer
    const { name, description } = req.body;
    if (!(name && description && req.file)) {
        res.json({

            error: true,
            message: `Some or all details were not sent`,

        })
    }
    // generate id
    var imgsrc = `/uploads/${req.file.filename}`;
    const equipmentID = uuid();
    // push data to database
    const insertQuerry = "INSERT INTO equipments (name , description , equipmentID , state , taken , requested ,whohas , image ) VALUES ('" + name + "' ,'" + description + "' ,'" + equipmentID + "' , 'present' , 'false' ,'false' , '' ,'"+imgsrc+"')";
    connector.query(insertQuerry, (error) => {
        if (error) {
            res.json({
                error: true,
                message: `Unable to create equipment on database\n${error}`,
            })
            console.log("error",error);
            return;
        } else res.json({
            error: false,
            message: `Equipment with id of ${equipmentID} has been created`,
            id: equipmentID,
        })
    })

});

// delete equipment

Admin.get("/delete/:id", Protect, (req, res) => {
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { previledge } = req.user[0];
    if (previledge == "student") {
        res.json({

            error: true,
            message: `You are not authorized to perform this operation`,

        })
    }
    const { id } = req.params;
    if (!id) {
        res.json({

            error: true,
            message: `Equipment id was not found`

        })
    }
    const deleteQuerry = "UPDATE equipments SET state='deleted' WHERE equipmentID='" + id + "'";
    const restoreQuerry = "UPDATE equipments SET state='present' WHERE equipmentID='" + id + "'";
    const getQuerry = "SELECT * FROM equipments WHERE equipments.equipmentID='" + id + "'";
    connector.query(getQuerry, (error, result, fields) => {
        if (error) {
            res.json({
                error: true,
                message: `Unable to fetch equipment to delete`,
                status: 404,
            })
        }
        const { state } = result[0];

        // toggle state
        connector.query(`${state == "present" ? deleteQuerry : restoreQuerry}`, error => {
            if (error) {
                res.json({

                    error: true,
                    message: `Unable to ${state == "present" ? "delete" : "restore"} the equipment\n${error}`,

                });
            }
            res.json({
                error: false,
                message: `Equipment with id ${id} has been ${state == "present" ? "deleted" : "restored"}`,
            })
        });
    })

});

Admin.delete("/permanentdelete" , Protect , (req , res)=>{
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { previledge } = req.user[0];
    if (previledge == "student") {
        res.json({

            error: true,
            message: `You are not authorized to perform this operation`,

        })
        return;
    }
    const {equipmentID} = req.body;
    if(!equipmentID){
        res.json({
            error:true,
            message:`Equipment id was not passed`,
            status:404,
        });
        return;
    }
    const deleteStatement = "DELETE FROM equipments WHERE equipments.equipmentID='"+equipmentID+"'";
    connector.query(deleteStatement , (error)=>{
        if(error){
            res.json({
                error:true,
                message:`Unable to delete the record\n${error}`,
                status:500,
            });
            return;
        }else{
            res.json({
                error:false,
                message:`Record deleted`,
                status:200,
            });
        }
    })
});


// update equipment details
Admin.put("/update/:id", Protect, (req, res) => {
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { previledge } = req.user[0];
    if (previledge == "student") {
        res.json({

            error: true,
            message: `You are not authorized to perform this operation`,

        })
    }
    const { name, description } = req.body;
    const { id } = req.params;
    if (!(name && description) && !id) {
        res.json({
            error: true,
            message: `Id , name or description not passed.Try again and fill all fields`,
        })
    }
    const updateQuerry = "UPDATE equipments SET name='" + name + "' , description='" + description + "' WHERE equipmentID='" + id + "'";
    connector.query(updateQuerry, error => {
        if (error) {
            res.json({
                error: true,
                status: 500,
                message: `Unable to update equipment\n${error}`,
            })
        }
        res.json({
            error: false,
            message: `Equipment with id ${id} has been updated`,
            status: 200,
        })
    });
});

// approve equipment 
Admin.get("/approve/:id", Protect, (req, res) => {
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { previledge } = req.user[0];
    if (previledge == "student") {
        res.json({

            error: true,
            message: `You are not authorized to perform this operation`,

        });
    }
    const { id } = req.params;
    if (!(id)) {
        res.json({
            error: true,
            message: `Equipment id not passed`,
            status: 404,
        });
    }
    const approveQuerry = "UPDATE equipments SET taken='true' where (equipments.equipmentID='"+id+"') AND (equipments.taken='false') AND (equipments.state='present') AND (equipments.requested='true')";
    connector.query(approveQuerry, (error) => {
        if (error) {
            res.json({
                error: true,
                message: `Unable to approve equipment transfer\n${error}`,
                status: 500,
            });
        }
        res.json({
            error: false,
            message: `Equipment has been assigned to a student`,
            id,
        })
    });
});


// approve equipment 
Admin.get("/return/:id", Protect, (req, res) => {
    if (!req.user) res.json({

        error: true,
        message: `User not found`,

        status: 404,
    });
    // gain previledge
    const { previledge } = req.user[0];
    if (previledge == "student") {
        res.json({

            error: true,
            message: `You are not authorized to perform this operation`,

        });
    }
    const { id } = req.params;
    if (!(id)) {
        res.json({
            error: true,
            message: `Equipment id not passed`,
            status: 404,
        });
    }
    const approveQuerry = "UPDATE equipments SET taken='false' , whohas='' , requested='false'  where (equipments.equipmentID='"+id+"') AND (equipments.taken='true') AND (equipments.state='present') AND (equipments.requested='true')";
    connector.query(approveQuerry, (error) => {
        if (error) {
            res.json({
                error: true,
                message: `Unable to approve equipment return\n${error}`,
                status: 500,
            });
        }
        res.json({
            error: false,
            message: `Equipment has been relinquished from student and is now back in the inventory`,
            id,
        })
    });
});

module.exports = Admin;