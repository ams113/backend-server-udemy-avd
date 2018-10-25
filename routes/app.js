//Requires
var express = require('express');
//iniciar variables
var app = express();

app.get('/', (req, res, next) => {
    res.status(404).json({
        ok: true,
        msg: "Petición realizada correctamente"
    });
} );

module.exports = app;