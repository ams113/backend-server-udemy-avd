//Requires
var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//iniciar variables
var app = express();

// ===================================================
//  Buesqueda por colección
// ===================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var hasta = 5;
    var desde = req.query.desde || 0;
    desde = Number(desde);
    
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch(tabla) {
        case 'usuarios':
            promesa = buscarUsuario(busqueda, regex, desde, hasta);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex, desde, hasta);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex, desde, hasta);
            break;

        default:
            res.status(400).json({
                ok: true,
                msg: 'Los tipos de busqueda sólo son: usuarios, médicos y hospitales',
                errors: { message: 'Tipo de table/colección no válido'}
            });
    }
    
    promesa.then( data => {
        res.status(200).json({
            ok: true,
            total: data.total,
            [tabla]: data.consulta
        });
    });
});


// ===================================================
//  Buesqueda general
// ===================================================

app.get('/todo/:busqueda', (req, res, next) => {
    var hasta = 20;
    var desde = req.query.desde || 0;
    desde = Number(desde);

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex, desde, hasta),
        buscarMedicos(busqueda, regex, desde, hasta),
        buscarUsuario(busqueda, regex, desde, hasta)
    ]).then( respuestas => {
        var total = 0;
        if (respuestas[0].consulta.length > 0) {
            total += Number(respuestas[0].total);
        }
        if (respuestas[1].consulta.length > 0) {
            total += Number(respuestas[1].total);
        }
        if (respuestas[2].consulta.length > 0) {
            total += Number(respuestas[2].total);
        }
        res.status(200).json({
            ok: true,
            total: total,
            hospitales: respuestas[0].consulta,
            medicos: respuestas[1].consulta,
            usuarios: respuestas[2].consulta
        });
    });
   
});

function buscarHospitales(busqueda, regex, desde, hasta) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .skip(desde)
            .limit(hasta)
            .exec((err, hospitales) => {
                if(err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    Hospital.count({}, (err, num) => {
                        var obj = {
                            consulta: hospitales,
                            total: num
                        };
                        
                        resolve(obj);
                    });
                }
        });
    });
}
function buscarMedicos(busqueda, regex, desde, hasta) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .skip(desde)
        .limit(hasta)
        .exec((err, medicos) => {
            if(err) {
                reject('Error al cargar medicos', err);
            } else {
                Medico.count({}, (err, num) => {
                    var obj = {
                        consulta: medicos,
                        total: num
                    };
                    
                    resolve(obj);
                });
            }
        });
    });
}

function buscarUsuario(busqueda, regex, desde, hasta) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
        .or([ {'nombre': regex}, {'email': regex} ])
        .skip(desde)
        .limit(hasta)
        .exec( (err, usuarios) => {
            if(err) {
                reject('Error al cargar usuarios', err);
            } else {
                Usuario.count({}, (err, num) => {
                    var obj = {
                        consulta: usuarios,
                        total: num
                    };
                    
                    resolve(obj);
                });
            }
        });
    });
}

module.exports = app;