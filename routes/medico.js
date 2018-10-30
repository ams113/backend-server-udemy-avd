var express = require('express');
var Medico = require('../models/medico');
var mAuth = require('../middlewares/autenticacion');

//iniciar variables
var app = express();

// ===================================================
//  Obtener medicos
// ===================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .skip(desde)
    .limit(5)
    .exec(
         (err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: fasle,
                    msg: 'Error cargando médicos!',
                    errors: err
                });
            }

            Medico.count({}, (err, num) => {

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: num
                });
            });
    });    
} );

// ===================================================
//  Actualizar medico
// ===================================================

app.put('/:id', mAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, (err, medico) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar médico!',
                errors: err
            });
        } 
        if(!medico) {
            return res.status(400).json({
                ok: false,
                msg: `El médico con el id ${id} no existe`,
                errors: { message: 'No existe un medico con ese ID'}
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save( (err, medicoGuardado) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        }); 
    });
});

// ===================================================
//  Crear medico
// ===================================================

app.post('/', mAuth.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save( (err, medicoGuardado) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al crear médico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    } ); 
});

// ===================================================
//  Borrar medico
// ===================================================

app.delete('/:id', mAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if(err) {
            return res.status(500).json({
                ok: fasle,
                msg: 'Error al borrar médico',
                errors: err
            });
        } 
        if(!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                msg: `El médico con el id ${id} no existe`,
                errors: { message: 'No existe un médico con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;