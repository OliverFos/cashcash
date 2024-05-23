// Ajout des modules nécessaires
var express = require('express');
var router = express.Router();
const db = require('../connect');
const session = require('express-session');

// Gérer les requêtes GET à la racine '/'
router.get('/', function(req, res, next) {
    // Vérifier si l'utilisateur est connecté
    if (req.session.email){
        // Vérifier si le typeSal de l'utilisateur n'est pas égal à 1 (1 = assistant téléphonique)
        if(req.session.typeSal != 1){
            // Extraire le numéro d'intervention à partir de la requête
            const id = req.query.numInter;
            // Requête SQL pour récupérer les réparations associées à une intervention spécifique qui n'ont pas encore de durée de réparation
            const sql = "SELECT * FROM reparer WHERE reparer.numIntervention = ? and reparer.durreReparationMat is null";
            db.query(sql, id, (err, data) => {
                if (err) throw err;
                // Rendre la vue 'validerInter' avec les données des réparations à valider
                res.render('validerInter', {repareData: data});
            });
        } else {
            // Rediriger vers la racine '/' si l'utilisateur n'a pas les autorisations nécessaires
            res.redirect("/");
        }
    } else {
        // Rediriger vers la racine '/' si l'utilisateur n'est pas connecté
        res.redirect("/");
    }
});

// Gérer les requêtes POST à la racine '/'
router.post('/', (req, res) => {
    // Requête SQL pour mettre à jour la durée de réparation et le commentaire d'une réparation spécifique
    const query = "UPDATE reparer SET durreReparationMat = ?, commentaire = ? WHERE numSerie = ? AND numIntervention = ?;";
    
    const updateData = [
        req.body.dureeRep,
        req.body.commentaire,
        req.body.numSerie,
        req.body.numInter
    ];

    db.query(query, updateData, (err, data) => {
        if (err){
            // Afficher une erreur si la mise à jour échoue
            throw err;
        } else {
            // Rendre la vue 'validerInter' avec un message de succès et les informations de l'intervention mise à jour
            res.render('validerInter', {message : "Modification réussie!", numInter : req.body.numInter, numMat : req.body.numSerie});
        }
    });
});

// Gérer les requêtes GET pour annuler une intervention
router.get('/annulerIntervention/:numSerie/:numIntervention', (req, res, next) => {
    // Vérifier si l'utilisateur est connecté
    if (req.session.email){
        // Vérifier si le typeSal de l'utilisateur n'est pas égal à 1 (1 = assistant téléphonique)
        if(req.session.typeSal != 1){
            // Extraire les numéros de série et d'intervention à partir de la requête
            const numSerie = req.params.numSerie;
            const numIntervention = req.params.numIntervention;
            // Requête SQL pour annuler la durée de réparation et le commentaire d'une réparation spécifique
            const query = "UPDATE reparer SET durreReparationMat = NULL, commentaire = NULL WHERE numSerie = ? AND numIntervention = ?;";
            db.query(query, [numSerie, numIntervention], (err, data) => {
                if (err) {
                    // Afficher une erreur si la mise à jour échoue
                    throw err;
                } else {
                    // Rediriger vers la vue 'validerInter' avec le numéro de l'intervention annulée
                    res.redirect("/validerInter?numInter="+numIntervention);
                }
            });
        } else {
            // Rediriger vers la racine '/' si l'utilisateur n'a pas les autorisations nécessaires
            res.redirect("/");
        }
    } else {
        // Rediriger vers la racine '/' si l'utilisateur n'est pas connecté
        res.redirect("/");
    }
});

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;
