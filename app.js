//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var serveIndex = require('serve-index');

//iniciar variables
var app = express();

//CORS

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });

//body parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//conexión a la base de Datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res ) => {
    if (err) throw err;
    console.log('MongoDB puerto 27027: \x1b[32m%s\x1b[0m','connected');
})

//server index config
app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/', appRoutes);

 
//Escuchar peticion
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
});