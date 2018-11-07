//Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');

//iniciar variables
var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;
var app = express();

// google
const client = new OAuth2Client(CLIENT_ID);

// ===================================================
//  Auth google
// ===================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload: payload
    };
  }

  app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUsuer = await verify(token)
    .catch( e => {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido'
        });
    });

    Usuario.findOne({ email: googleUsuer.email }, (err, usuarioDB) => {
        if(err) {
            return res.status(500).json({
                ok: fasle,
                msg: 'Error al buscar usuario',
                error: err
            });
        } 

        if(usuarioDB) {
            if(usuarioDB.google === false) {
                return res.status(400).json({
                    ok: fasle,
                    msg: 'Debe utilizar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB}, SEED, {expiresIn: 14400}); //4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });
            }
        } else {
            // El usuario no existe hay que crearlo

            var usuario = new Usuario();

            usuario.nombre = googleUsuer.nombre;
            usuario.email = googleUsuer.email;
            usuario.img = googleUsuer.img;
            usuario.google = true;
            usuario.password = '******';

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB}, SEED, {expiresIn: 14400}); //4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });
            });
        }
    });
});






// ===================================================
//  Auth Normal
// ===================================================

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