const express = require("express");
const app = express();
const port = 8080

const cors = require('cors');

app.use(express.json());
app.use(cors());
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});

app.get("/", (req, res) => {
    res.send("It's working.");
});

var balada = require("./routes/balada");
var alien = require("./routes/alien");
var check = require("./routes/check");

app.use("/balada", balada);
app.use("/alien", alien);
app.use("/check", check);