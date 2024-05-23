// Ajout des modules nécessaires
var express = require('express');
var router = express.Router();
const db = require('../connect');
const session = require('express-session');

// REGEX pour les validations
var numericPattern = /^[0-9]+$/
var timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
var datePattern = /^\d{4}(-)(((0)[0-9])|((1)[0-2]))(-)([0-2][0-9]|(3)[0-1])$/
var clientPattern = /^((CL)\d{4})$/
var matrPattern = /^((S)\d{4})$/

router.get('/', function(req, res, next) {
    // Vérifier si l'utilisateur est connecté, a la variable de session 'typeSal' et a le rôle (typeSal) égal à 1
    if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
        // Extraire l'identifiant du client des paramètres de requête
        const id = req.query.id;
        // Requête SQL pour récupérer les données du client en fonction de son identifiant
        const sql = "SELECT numIntervention, DATE_FORMAT(dateIntervention, '%Y-%m-%d') as dateIntervention, heureIntervention, numClient, numMatr FROM intervention WHERE intervention.numIntervention = ?;";
        db.query(sql, id, (err, data) => {
            if (err) throw err;
            console.log(data);
            // Rendre la vue 'modifIntervention' en passant les données du client en tant que variables
            res.render('modifIntervention', { userData: data, id: req.query.id });
        });
    } else {
        // Rediriger vers la racine '/' si l'utilisateur n'a pas les autorisations nécessaires
        res.redirect("/");
    }
});

// Gérer les requêtes POST à la racine '/'
router.post('/', (req, res) => {
    // Validation des champs du formulaire avec des expressions régulières

    if (timePattern.test(req.body.heureIntervention) == false || req.body.heureIntervention > 8) {
        res.render('modifIntervention', { messageErr: "Heure incorrecte !", id: req.query.id });
    } else if ((datePattern.test(req.body.dateIntervention) == false)) {
        res.render('modifIntervention', { messageErr: "Date incorrecte", id: req.query.id })
    } else if ((req.body.numClient.length != 6 || clientPattern.test(req.body.numClient) == false)) {
        res.render('modifIntervention', { messageErr: "Numéro client incorrecte", id: req.query.id })
    } else if ((req.body.numMatr.length != 5 || matrPattern.test(req.body.numMatr) == false)) {
        res.render('modifIntervention', { messageErr: "Numéro du matricule incorrecte", id: req.query.id })

    } else {
        // Si les champs sont valides, exécuter la mise à jour des données du client dans la base de données
        const query = "UPDATE intervention SET dateIntervention = ?, heureIntervention = ?, numClient = ?, numMatr = ? WHERE numIntervention = ?;";

        const updateData = [
            req.body.dateIntervention,
            req.body.heureIntervention,
            req.body.numClient,
            req.body.numMatr,
            req.query.id
        ];

        db.query(query, updateData, (err, data) => {
            // En cas d'erreur, afficher un message d'erreur spécifique
            if (err) {
                res.render('modifIntervention', { messageErr: err, id: req.query.id })
            } else {
                // Si la mise à jour réussit, afficher un message de succès
                res.render('modifIntervention', { messageSucc: "Modification réussie!", id: req.query.id });
            }
        });
    }
});

module.exports = router;

