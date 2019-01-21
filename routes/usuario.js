//Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mAuth = require('../middlewares/autenticacion');
//iniciar variables
var app = express();

// ===================================================
//  Obtener usuarios sin password
// ===================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
    .skip(desde)
    .limit(5)
    .exec(
         (err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: fasle,
                    msg: 'Error cargando usuarios!',
                    error: err
                });
            }

            Usuario.count({}, (err, num) => {

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: num
                });
            });

            
    });    
} );

// ===================================================
//  Actualizar usuario
// ===================================================

app.put('/:id', [mAuth.verificaToken, mAuth.verifyMyselfOrAdmin], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, (err, usuario) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar usuarios!',
                error: err
            });
        } 
        if(!usuario) {
            return res.status(400).json({
                ok: false,
                msg: `El usuario con el id ${id} no existe`,
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar usuario',
                    error: err
                });
            }
            usuarioGuardado.password = '******';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        }); 
    });
});

// ===================================================
//  Crear usuario
// ===================================================

app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al crear usuario',
                error: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    } ); 
});

// ===================================================
//  Borrar usuario
// ===================================================

app.delete('/:id', [mAuth.verificaToken, mAuth.verificaAdminRole], (req, res) => {

    var id = req.params.id;
    
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if(err) {
            return res.status(500).json({
                ok: fasle,
                msg: 'Error al borrar usuario',
                error: err
            });
        } 
        if(!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                msg: `El usuario con el id ${id} no existe`,
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;