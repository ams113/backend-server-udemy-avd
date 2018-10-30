//Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//iniciar variables
var app = express();
// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            msg: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es valida'}
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            msg: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen'}
        });
    }

    //obtener nombre del archivo

    var archivo= req.files.imagen;
    var nombreTroceado = archivo.name.split('.');
    var extArchivo = nombreTroceado[nombreTroceado.length - 1];

    // extensiones aceptadas

    var extValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extValidas.indexOf(extArchivo) < 0 ) {
        return res.status(400).json({
            ok: false,
            msg: 'Extension no válida',
            errors: { message: `Las extensiones válidas son ${extValidas.join(', ')}`}
        });
    }

    // Nombre del archivo personalizado
    // 12635451-143.png

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extArchivo}`;

    //Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al mover archivo',
                errors: err
            });
        }
        uploadByType (tipo, id, nombreArchivo, res);
    });

   
});

function uploadByType (tipo, id, nombreArchivo, res) {

    if (tipo  === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var oldPath = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior

            if( fs. existsSync(oldPath)) {
                fs.unlink( oldPath, err => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            msg: 'Error al sobrescribir archivo',
                            errors: err
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;
       
             usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = '******';

                return res.status(200).json({
                        ok: true,
                        msg: "Imagen de usuario actualizada",
                        usuario: usuarioActualizado
                    });
             });
        });
    }

    if (tipo  === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });
            }

            
            var oldPath = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior

            if( fs. existsSync(oldPath)) {
                fs.unlink( oldPath, err => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            msg: 'Error al sobrescribir archivo',
                            errors: err
                        });
                    }
                });
            }

            medico.img = nombreArchivo;

             medico.save((err, medicoActualizado) => {

                medicoActualizado.password = '******';

                return res.status(200).json({
                        ok: true,
                        msg: "Imagen de usuario actualizada",
                        medico: medicoActualizado
                    });
             });
        });
    }

    if (tipo  === 'hospitales') {
        
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var oldPath = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior

            if( fs. existsSync(oldPath)) {
                fs.unlink( oldPath, err => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            msg: 'Error al sobrescribir archivo',
                            errors: err
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;

             hospital.save((err, hospitalActualizado) => {

                hospitalActualizado.password = '******';

                return res.status(200).json({
                        ok: true,
                        msg: "Imagen de usuario actualizada",
                        hospital: hospitalActualizado
                    });
             });
        });
    }
}

module.exports = app;