// Ajout des modules nécessaires
var express = require('express');
var router = express.Router();
const db = require('../connect');
const session = require('express-session');

// REGEX pour les validations
var numericPattern = /^[0-9]+$/
var emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
var decimalPattern = /^\d{1,3}(\.\d{1,2})?$/
var timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/

// Gérer les requêtes GET à la racine '/'
router.get('/', function(req, res, next) {
    // Vérifier si l'utilisateur est connecté, a la variable de session 'typeSal' et a le rôle (typeSal) égal à 1
    if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
        // Extraire l'identifiant du client des paramètres de requête
        const id = req.query.id;
        // Requête SQL pour récupérer les données du client en fonction de son identifiant
        const sql = "SELECT * FROM client WHERE client.numClient = ?";
        db.query(sql, id, (err, data) => {
            if (err) throw err;
            console.log(data);
            // Rendre la vue 'modifClient' en passant les données du client en tant que variables
            res.render('modifClient', { userData: data });
        });
    } else {
        // Rediriger vers la racine '/' si l'utilisateur n'a pas les autorisations nécessaires
        res.redirect("/");
    }
});

// Gérer les requêtes POST à la racine '/'
router.post('/', (req, res) => {
    // Validation des champs du formulaire avec des expressions régulières

    if (req.body.raisonSociale.length > 30) {
        res.render('modifClient', { messageErr: "Trop long!", id: req.query.id });
    } else if ((numericPattern.test(req.body.siren) == false) || (req.body.siren.length != 9)) {
        res.render('modifClient', { messageErr: "SIREN incorrecte", id: req.query.id })
    } else if ((numericPattern.test(req.body.ape) == false) || (req.body.ape.length != 5)) {
        res.render('modifClient', { messageErr: "APE incorrecte", id: req.query.id })
    } else if ((numericPattern.test(req.body.telephone) == false) || (req.body.telephone.length != 10)) {
        res.render('modifClient', { messageErr: "Téléphone incorrecte", id: req.query.id })
    } else if ((numericPattern.test(req.body.telecopie) == false) || (req.body.telecopie.length != 10)) {
        res.render('modifClient', { messageErr: "Télécopie incorrecte", id: req.query.id })
    } else if ((emailPattern.test(req.body.email) == false) || (req.body.email.length > 30)) {
        res.render('modifClient', { messageErr: "Email incorrecte", id: req.query.id })
    } else if (req.body.adresse.length > 50) {
        res.render('modifClient', { messageErr: "Adresse incorrecte", id: req.query.id })
    } else if (req.body.nom.length > 10) {
        res.render('modifClient', { messageErr: "Nom trop long", id: req.query.id })
    } else if (decimalPattern.test(req.body.distanceKilo) == false) {
        res.render('modifClient', { messageErr: "Distance kilométrique incorrecte", id: req.query.id })
    } else if (timePattern.test(req.body.tempsDeplacement) == false) {
        res.render('modifClient', { messageErr: "Temps déplacement incorrecte", id: req.query.id })
    } else if (req.body.numeroAgence.length > 5) {
        res.render('modifClient', { messageErr: "Numero agence non valide", id: req.query.id })
    } else {
        // Si les champs sont valides, exécuter la mise à jour des données du client dans la base de données
        const query = "UPDATE client SET raisonSociale = ?, SIREN = ?, APE = ?, adresseClient = ?, telephoneClient = ?, telecopieClient = ?, emailClient = ?, nomClient = ?, distanceKilo = ?, tempsDeplacement = ?, numAgence = ? WHERE numClient = ?;";

        const updateData = [
            req.body.raisonSociale,
            req.body.siren,
            req.body.ape,
            req.body.adresse,
            req.body.telephone,
            req.body.telecopie,
            req.body.email,
            req.body.nom,
            req.body.distanceKilo,
            req.body.tempsDeplacement,
            req.body.numeroAgence,
            req.query.id
        ];

        db.query(query, updateData, (err, data) => {
            // En cas d'erreur, afficher un message d'erreur spécifique
            if (err) {
                res.render('modifClient', { messageErr: "Le numéro d'agence n'existe pas", id: req.query.id })
            } else {
                // Si la mise à jour réussit, afficher un message de succès
                res.render('modifClient', { messageSucc: "Modification réussie!", id: req.query.id });
            }
        });
    }
});

module.exports = router;