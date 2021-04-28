var express = require("express");
var router = express.Router();

var db = require("../db/db")

router.get("/", function(req, res) {

    var nome = (req.query.nome ? `${req.query.nome}` : '%');

    db.query(`SELECT id, nome FROM baladas WHERE nome LIKE '${nome}';`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
        } else {
            res.status(200).json(result.rows);
        }
    });
});

router.get("/objeto_proibido/:id", function(req, res) {

    db.query(`SELECT id, balada_id, objeto FROM objetos_proibidos WHERE balada_id = ${req.params.id};`, (err, result) => {
        if (err) {
            res.status(500).send({error: "Database error."});
            console.log("DB Error: ", err);
        } else {
            res.status(200).json(result.rows);
        }
    });
});

router.get("/:id", function(req, res) {

    db.query(`SELECT id, nome FROM baladas WHERE id = ${req.params.id};`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
            console.log("DB Error: ", err);
        } else {
            res.status(200).json(result.rows);
        }
    });
});

router.post("/", async function(req, res) {

    if (!req.body.nome) {
        res.status(500).json({error: "Campo nome é obrigatório."});
        return
    }

    try {
        var count = await (await db.query(`SELECT * FROM baladas WHERE nome = '${req.body.nome}'`)).rowCount
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (count > 0) {
        res.status(500).send({error: "Ja existe uma balada com esse nome."});
        return
    }

    db.query(`INSERT INTO baladas (nome) VALUES ('${req.body.nome}');`, err => {
        if(err) {
            res.status(500).send({error: "Database error"});
            console.log("DB Error: ", err);
        } else {
            res.status(200).send();
        }
    });
});

router.put("/:id", async function(req, res) {

    if (!req.body.nome) {
        res.status(500).json({error: "Campo nome é obrigatório."});
        return
    }

    try {
        var count = await (await db.query(`SELECT * FROM baladas WHERE nome = '${req.body.nome}'`)).rowCount
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (count > 0) {
        res.status(500).send({error: "Ja existe uma balada com esse nome."});
        return
    }

    db.query(`UPDATE baladas SET nome = '${req.body.nome}' WHERE id = ${req.params.id};`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", err);
        } else {
            res.status(200).send();
        }
    });
});

router.delete("/:id", function(req, res) {

    db.query(`DELETE FROM baladas WHERE id = ${req.params.id};`, (err, result) => {
        if(err) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", err);
        } else {
            res.status(200).send();
        }
    });
});

router.post("/objeto_proibido", async function(req, res) {

    if (!req.body.balada) {
        res.status(500).send({error: "Deve ser informado o id da balada na requisição."});
        return
    }
    
    if (!req.body.objetos) {
        res.status(500).send({error: "Deve ser informado pelo menos um objeto na requisição."});
        return
    }

    if (!Array.isArray(req.body.objetos)) {
        res.status(500).send({error: "O(s) objeto(s) deve(m) ser passado(s) em um array."});
        return
    }

    var valobj = [];

    for(var i = 0; i < req.body.objetos.length; i++) {
        try {
            var count = await (await db.query(`SELECT * FROM objetos_proibidos WHERE balada_id = ${req.body.balada} AND objeto = '${req.body.objetos[i]}'`)).rowCount
        } catch(e) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", e);
            return
        }

        if (count <= 0) {
            valobj.push(req.body.objetos[i]);
        }
    }

    if (valobj.length == 0) {
        res.status(500).send({error: "Não é permitido recadastrar um objeto."});
        return
    }

    var objetos = "";
    await valobj.forEach(async (obj, i) => {

        if (i == (req.body.objetos.length - 1)) {
            objetos += `(${req.body.balada}, '${obj}');`
        } else {
            objetos += `(${req.body.balada}, '${obj}'),`
        }
    });

    try {
        await db.query(`INSERT INTO objetos_proibidos (balada_id, objeto) VALUES ${objetos}`);
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    res.status(200).send();
});

module.exports = router;