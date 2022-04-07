const connector = require("mysql").createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "GIS",
});


module.exports = connector;