var express = require('express');
var router = express.Router();

var db = require('../db/db');

router.post("/in", async function(req, res) {

    if (!req.body.balada) {
        res.status(500).send({error: "Deve ser informado um código de balada."});
        return
    }

    if (!req.body.alien) {
        res.status(500).send({error: "Deve ser informado um código do alien."});
        return
    }

    try {
        var count = await (await db.query(`SELECT * FROM baladas WHERE id = ${req.body.balada};`)).rowCount;
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (count <= 0) {
        res.status(500).send({error: "Código de balada inválido."});
        return
    }

    try {
        var result = await db.query(`SELECT id, nome, nascimento FROM aliens WHERE id = ${req.body.alien};`);
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (result.rowCount <= 0) {
        res.status(500).send({error: "Código do alien inválido."});
        return
    }

    var alien = result.rows[0];

    var today = new Date();
    var birthdate = new Date(alien.nascimento);
    var age = today.getFullYear() - birthdate.getFullYear();
    var m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }

    if (age < 25) {
        res.status(500).send({error: "Alien tem menos de 25 anos de idade terráquea."});
        return;
    }

    try {
        var count = await (await db.query(`SELECT * FROM banimentos WHERE balada_id = ${req.body.balada} AND alien_id = ${req.body.alien};`)).rowCount;
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (count > 0) {
        res.status(500).send({error: "Alien foi banido dessa balada."});
        return;
    }

    try {
        var result = await db.query(`SELECT balada_id FROM entrada_saida WHERE alien_id = ${req.body.alien} AND saida IS NULL;`);
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (result.rowCount > 0) {

        try {
            await db.query(`INSERT INTO banimentos (balada_id, alien_id) VALUES (${req.body.balada}, ${req.body.alien}), (${result.rows[0].balada_id}, ${req.body.alien});`);
        } catch(e) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", e);
            return
        }

        try {
            await db.query(`UPDATE entrada_saida SET saida = NOW() WHERE alien_id = ${req.body.alien};`);
        } catch(e) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", e);
            return
        }

        res.status(500).send({error: "Movimentação suspeita. Alien ja executou check-in em outra balada. Será banido de ambas as baladas."});
        return
    }

    if (req.body.objetos && req.body.objetos.length > 0) {
        var objects = "";
        await req.body.objetos.forEach((o, i) => {
            if (i == req.body.objetos.length - 1) {
                objects += `'${o}'`
            } else {
                objects += `'${o}',`
            }
        });

        try {
            var result = await db.query(`SELECT objeto FROM objetos_proibidos WHERE balada_id = ${req.body.balada} AND objeto IN (${objects});`);
        } catch(e) {
            res.status(500).send({error: "Database error."});
            console.log("DB error: ", e);
            return
        }

        var obj = result.rows.map(value => {
            return value.objeto;
        })

        if (result.rowCount > 0) {
            res.status(500).send({error: "O alien está carregando um ou mais objetos proibidos.", body: {objetos: obj}});
            return
        }
    }

    try {
        await db.query(`INSERT INTO entrada_saida (balada_id, alien_id, entrada) VALUES (${req.body.balada}, ${req.body.alien}, NOW());`);
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    res.status(200).send();
});

router.put("/out", async function(req, res) {

    if (!req.body.balada) {
        res.status(500).send({error: "Deve ser informado um código de balada."});
        return
    }

    if (!req.body.alien) {
        res.status(500).send({error: "Deve ser informado um código do alien."});
        return
    }

    try {
        var count = await (await db.query(`SELECT * FROM baladas WHERE id = ${req.body.balada};`)).rowCount;
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (count <= 0) {
        res.status(500).send({error: "Código de balada inválido."});
        return
    }

    try {
        var count = await (await db.query(`SELECT * FROM aliens WHERE id = ${req.body.alien};`)).rowCount;
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (count <= 0) {
        res.status(500).send({error: "Código do alien inválido."});
        return
    }

    try {
        var result = await db.query(`SELECT * FROM entrada_saida WHERE balada_id = ${req.body.balada} AND alien_id = ${req.body.alien} AND saida IS NULL;`);
    } catch {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
        return
    }

    if (result.rowCount == 0) {
        res.status(500).send({error: "Não existe nenhum check-in nessa balada por esse alien."});
        return
    }

    var entrada = new Date(result.rows[0].entrada);
    var now = new Date();

    if (((now - entrada)/1000) < 60) {
        res.status(500).send({error: "Checkout só é permitido um minuto após check-in."});
        return
    }

    try {
        await db.query(`UPDATE entrada_saida SET saida = NOW() WHERE balada_id = ${req.body.balada} AND alien_id = ${req.body.alien} AND saida IS NULL;`);
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
    }

    res.status(200).send();
});

router.get("/", async function(req, res) {

    var balada = (req.query.balada ? req.query.balada : '%');
    var alien = (req.query.alien ? req.query.alien : '%');

    try {
        var result = await db.query(`SELECT id, balada_id, alien_id, entrada, saida FROM entrada_saida WHERE CAST(balada_id AS TEXT) LIKE '${balada}' AND CAST(alien_id AS TEXT) LIKE '${alien}';`);
    } catch(e) {
        res.status(500).send({error: "Database error."});
        console.log("DB error: ", e);
    }

    res.status(200).send(result.rows);
});

module.exports = router;