
var express = require('express');
var Hospital = require('../models/hospital');
var mAuth = require('../middlewares/autenticacion');

//iniciar variables
var app = express();

// ===================================================
//  Obtener hospital
// ===================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .populate('usuario', 'nombre email')
    .skip(desde)
    .limit(5)
    .exec(
         (err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: fasle,
                    msg: 'Error cargando Hospitales!',
                    errors: err
                });
            }

            Hospital.count({}, (err, num) => {

                res.status(200).json({
                    ok: true,
                    ospitales: hospitales,
                    total: num
                });
            });
    });    
} );

// ===================================================
//  Actualizar Hospital
// ===================================================

app.put('/:id', mAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar hospital!',
                errors: err
            });
        } 
        if(!hospital) {
            return res.status(400).json({
                ok: false,
                msg: `El hospital con el id ${id} no existe`,
                errors: { message: 'No existe un hospital con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        }); 
    });
});

// ===================================================
//  Crear hospital
// ===================================================

app.post('/', mAuth.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    } ); 
});

// ===================================================
//  Borrar Hospital
// ===================================================

app.delete('/:id', mAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if(err) {
            return res.status(500).json({
                ok: fasle,
                msg: 'Error al borrar hospital',
                errors: err
            });
        } 
        if(!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                msg: `El hospital con el id ${id} no existe`,
                errors: { message: 'No existe un hospital con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;