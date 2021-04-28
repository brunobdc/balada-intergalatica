var express = require('express');
var router = express.Router();

var db = require('../db/db');

router.get("/", function(req, res) {

    var nome = (req.query.nome ? `${req.query.nome}`: '%' );
    var nascimento = (req.query.begindate && req.query.enddate ? `AND nascimento BETWEEN '${req.query.begindate}' AND '${req.query.enddate}'` : "");
    
    db.query(`SELECT id, nome, nascimento FROM aliens WHERE nome LIKE '${nome}' ${nascimento};`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", err);
        } else {
            res.status(200).json(result.rows);
        }
    });
});

router.get("/:id", function(req, res) {

    db.query(`SELECT id, nome, nascimento FROM aliens WHERE id = ${req.params.id};`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", err);
        } else {
            res.status(200).json(result.rows);
        }
    });
});

router.post("/", async function(req, res) {

    if (!req.body.nome) {
        res.status(500).send({error: "Campo nome não pode ser vazio."});
        return
    }

    if (!req.body.nascimento) {
        res.status(500).send({error: "Data de nascimento não pode ser vazia."});
        return
    }

    if (new Date(req.body.nascimento) == "Invalid Date") {
        res.status(500).send({error: "Data de nascimento é inválida."});
        return
    }

    try {
        var count = await (await db.query(`SELECT * FROM aliens WHERE nome = '${req.body.nome}';`)).rowCount
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (count > 0) {
        res.status(500).send({error: "Já existe um alien com esse nome cadastrado."});
        return
    }

    db.query(`INSERT INTO aliens (nome, nascimento) VALUES ('${req.body.nome}', '${req.body.nascimento}');`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", err);
        } else {
            res.status(200).send();
        }
    });
});

router.put("/:id", async function(req, res) {

    if (!req.body.nome) {
        res.status(500).send({error: "Campo nome não pode ser vazio."});
        return
    }

    if (!req.body.nascimento) {
        res.status(500).send({error: "Data de nascimento não pode ser vazia."});
        return
    }

    if (new Date(req.body.nascimento) == "Invalid Date") {
        res.status(500).send({error: "Data de nascimento é inválida."});
        return
    }

    try {
        var count = await (await db.query(`SELECT * FROM aliens WHERE nome = '${req.body.nome}';`)).rowCount
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (count > 0) {
        res.status(500).send({error: "Já existe um alien com esse nome cadastrado."});
        return
    }

    db.query(`UPDATE aliens SET nome = '${req.body.nome}', nascimento = '${req.body.nascimento}' WHERE id = ${req.params.id};`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", err);
        } else {
            res.status(200).send();
        }
    });
});

router.delete("/:id", function(req, res) {

    db.query(`DELETE FROM aliens WHERE id = ${req.params.id};`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", err);
        } else {
            res.status(200).send();
        }
    });
});

module.exports = router;