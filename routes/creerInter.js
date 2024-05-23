// Ajouts des modules nécessaires
var express = require('express');
var router = express.Router();
const db = require('../connect');
const session = require('express-session');

// Gérer les requêtes GET à la racine '/'
router.get('/', function(req, res, next) {
    // Vérifier si l'utilisateur est connecté, a la variable de session 'typeSal' et a le rôle (typeSal) égal à 1
    if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
        // Rendre la vue 'creerInter' si les conditions sont remplies
        res.render('creerInter');
    } else {
        // Rediriger vers la racine '/' si les conditions ne sont pas remplies
        res.redirect("/");
    }
});

// Handle POST requests to the root '/'
router.post('/', (req, res) => {
    // Query to get the maximum 'numIntervention'
    const maxQuery = "SELECT MAX(numIntervention) AS maxIntervention FROM intervention";
    
    // Execute the query to get the maximum 'numIntervention'
    db.query(maxQuery, (err, result) => {
        if (err) {
            // Render 'creerInter' view with an error message in case of an error
            res.render('creerInter', { messageErr: err });
        } else {
            // Compute the new 'numIntervention'
            let maxIntervention = result[0].maxIntervention;
            let newInterventionNum = 'I' + String(maxIntervention ? parseInt(maxIntervention.slice(1)) + 1 : 1).padStart(4, '0');
            
            // Query to insert a new intervention
            const insertQuery = "INSERT INTO intervention (numIntervention, dateIntervention, heureIntervention, numClient, numMatr) VALUES (?,?,?,?,NULL)";
            
            // Data to insert
            const insertData = [
                newInterventionNum,
                req.body.dateInter,
                req.body.heureInter,
                req.body.numCli
            ];
            
            // Execute the insert query
            db.query(insertQuery, insertData, (err, result) => {
                if (err) {
                    // Render 'creerInter' view with an error message in case of an error
                    res.render('creerInter', { messageErr: err });
                } else {
                    // Query to get the last inserted intervention
                    const selectQuery = "SELECT * FROM intervention ORDER BY numIntervention DESC LIMIT 1";
                    
                    // Execute the select query
                    db.query(selectQuery, (err, results) => {
                        if (err) {
                            throw err;
                        } else {
                            // Redirect to the 'ajouterMat' page with the necessary parameters
                            res.redirect("/ajouterMat?numCli=" + req.body.numCli + "&numInter=" + results[0].numIntervention);
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;