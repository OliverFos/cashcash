// Import des modules nécessaires
var express = require('express');
var router = express.Router();
const session = require('express-session');
const db = require('../connect'); // Import de la connexion à la base de données

// Route pour la requête GET sur '/'
router.get('/', function(req, res, next) {
    // Vérifie si l'utilisateur a une session active
    if (req.session.email) {
        // Rend la vue afficherStats avec le numéro de salle passé en paramètre de la requête
        res.render('afficherStats', {numSal: req.query.numSal});
    } else {
        // Redirige vers la page de connexion si l'utilisateur n'a pas de session active
        res.redirect('/login');
    }
});

// Route pour la requête POST sur '/'
router.post('/', async (req, res) => {
    // Récupère les données du corps de la requête
    let numSal = req.query.numSal;
    let mois = req.body.mois;
    let annee = req.body.annee;

    // Vérifie si les données mois et année sont présentes
    if (mois && annee) {
        // Construit la date de début et de fin du mois
        let startDate = `${annee}-${mois}-01`;
        let endDate = new Date(annee, mois, 0).toISOString().slice(0, 10); // Dernier jour du mois

        // Requête SQL pour récupérer les statistiques
        let sql = `
        SELECT 
            COUNT(DISTINCT reparer.numIntervention) AS nbInterventions,
            (SELECT SUM(client.distanceKilo) AS nbKilometres
                    FROM client
                    JOIN (
                        SELECT DISTINCT intervention.numClient
                        FROM intervention
                        JOIN reparer ON intervention.numIntervention = reparer.numIntervention
                        WHERE intervention.numMatr = ? AND intervention.dateIntervention BETWEEN ? AND ? AND reparer.durreReparationMat IS NOT NULL
                    ) AS filtered_interventions ON client.numClient = filtered_interventions.numClient) AS nbKilometres,
            SEC_TO_TIME(SUM(TIME_TO_SEC(reparer.durreReparationMat))) AS dureeControle
        FROM 
            reparer
        JOIN 
            intervention ON reparer.numIntervention = intervention.numIntervention
        WHERE 
            intervention.numMatr = ?
            AND intervention.dateIntervention BETWEEN ? AND ?
            AND reparer.durreReparationMat IS NOT NULL;`;

        // Exécute la requête SQL avec les paramètres
        db.query(sql, [numSal, startDate, endDate, numSal, startDate, endDate], (err, data) => {
            if (err) {
                throw err;
            }
            console.log(data);

            // Rend la vue afficherStats avec les données récupérées de la base de données
            res.render('afficherStats', {real:1,nbInterventions: data[0].nbInterventions, nbKilometres: data[0].nbKilometres, dureeControle: data[0].dureeControle,numSal:numSal,mois: mois,annee:annee});
        });
    } else {
        // Rend la vue afficherStats avec un message d'erreur si les données mois et année ne sont pas présentes
        res.render('afficherStats', {messageErr:"Veuillez insérer des données"});
    }
});

// Exporte le routeur
module.exports = router;
