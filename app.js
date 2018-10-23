//Requires
var express = require('express');
var mongoose = require('mongoose');

//iniciar variables
var app = express();

//conexión a la base de Datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res ) => {
    if (err) throw err;
    console.log('MongoDB puerto 27027: \x1b[32m%s\x1b[0m','connected');
})

//Rutas
app.get('/', (req, res, next) => {
    res.status(404).json({
        ok: true,
        msg: "Petición realizada correctamente"
    });
} );
 
//Escuchar peticion
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
});