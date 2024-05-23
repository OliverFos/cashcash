// Ajout des modules nécessaires
var express = require('express');
var router = express.Router();
const db = require('../connect');
const session = require('express-session');

// Gérer les requêtes GET à la racine '/'
router.get('/', async (req, res) => {
    // Vérifier si l'utilisateur est connecté, a la variable de session 'typeSal' et a le rôle (typeSal) égal à 1
    if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
        // Extraire les numéros de client et d'intervention à partir des paramètres de requête
        const numCli = req.query.numCli;
        const numInter = req.query.numInter;

        // Requête SELECT pour récupérer les données des matériaux en fonction du client et du contrat non nul
        const selectQuery = `SELECT m.*
        FROM materiel m
        INNER JOIN contrat c ON m.numContrat = c.numContrat
        WHERE m.numClient = ? AND c.dateEcheance > CURRENT_DATE();`;

        // Exécuter la requête dans la base de données
        db.query(selectQuery, numCli, (err, data) => {
            if (err) {
                throw err;
            }

            // Si aucune donnée n'est récupérée, rediriger vers une page d'annulation, sinon, rendre la vue 'ajouterMat'

            res.render('selectMat', { matData: data, numInter: numInter });
            
        });

    } else {
        // Si l'utilisateur n'a pas les autorisations nécessaires, le rediriger vers la racine '/'
        res.redirect("/");
    }
});

module.exports = router;