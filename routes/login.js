//Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//iniciar variables
var SEED = require('../config/config').SEED;
var app = express();

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne( {email: body.email}, (err, user) => {
        if(err) {
            return res.status(500).json({
                ok: fasle,
                msg: 'Error al buscar usuario',
                error: err
            });
        } 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        if ( !bcrypt.compareSync(body.password, user.password) ) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas - password',
                errors: err
            });
        }
        user.password = '******';

        //crear token
        //payload + seed + fecha expiracion
        //console.log(SEED);
        var token = jwt.sign({ usuario: user}, SEED, {expiresIn: 14400}); //4 horas

        res.status(200).json({
            ok: true,
            usuario: user,
            id: user._id,
            token: token
        });
    });
});


module.exports = app;