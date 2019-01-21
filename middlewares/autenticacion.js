var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ===================================================
//  Verificar token
// ===================================================
exports.verificaToken = function (req, res, next) {
    var token = req.query.token;
    
    jwt.verify( token, SEED, (err, decoded) => {
        if(err) {
            return res.status(401).json({
                ok: false,
                msg: 'Token incorrecto',
                errors: err
            });
        } 
        req.usuario = decoded.usuario
        next();
       
    });
};

// ===================================================
//  Verificar Admin
// ===================================================

exports.verificaAdminRole = function (req, res, next) {

    var usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE' ) {
        next();
        return;
    } else  {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene permisos',
            errors: { message: 'Error de autorización necesita permisos' } 
        });
    }
};

// ===================================================
//  Verificar así mismo
// ===================================================

exports.verifyMyselfOrAdmin = function (req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else  {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene permisos',
            errors: { message: 'Error de autorización necesita permisos' } 
        });
    }
};