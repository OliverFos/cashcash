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
        const selectQuery = `SELECT DISTINCT m.*
        FROM materiel m
        JOIN contrat c ON m.numContrat = c.numContrat
        JOIN intervention i ON m.numClient = i.numClient
        WHERE m.numClient = ?
          AND c.dateEcheance > i.dateIntervention;`;

        // Exécuter la requête dans la base de données
        db.query(selectQuery, numCli, (err, data) => {
            if (err) {
                throw err;
            }

            // Si aucune donnée n'est récupérée, rediriger vers une page d'annulation, sinon, rendre la vue 'ajouterMat'
            if (data.length === 0) {
                res.redirect(`ajouterMat/cancel/${numInter}`);
            } else {
                res.render('ajouterMat', { matData: data, numInter: numInter,numCli:numCli });
            }
        });

    } else {
        // Si l'utilisateur n'a pas les autorisations nécessaires, le rediriger vers la racine '/'
        res.redirect("/");
    }
});

// Gérer les requêtes POST à la racine '/'
router.post('/', (req, res) => {
    // Extraire les matériaux sélectionnés à partir du corps de la requête
    const selectedMaterials = Object.keys(req.body);
    const numCli = req.query.numCli;
    const numInter = req.query.numInter;

    // Si aucun matériau n'est sélectionné, récupérer les données du matériel et rediriger avec un message d'erreur
    if (selectedMaterials.length === 0) {
        const selectQuery = `SELECT DISTINCT m.*
        FROM materiel m
        JOIN contrat c ON m.numContrat = c.numContrat
        JOIN intervention i ON m.numClient = i.numClient
        WHERE m.numClient = ?
          AND c.dateEcheance > i.dateIntervention;
        `;

        db.query(selectQuery, numCli, (err, data) => {
            if (err) {
                throw err;
            }

            console.log(data.length);

            if (data.length === 0) {
                res.redirect(`ajouterMat/cancel/${numInter}`);
            } else {
                res.render('ajouterMat', { matData: data, numInter: numInter, messageErr: "Aucun matériau sélectionné" });
            }
        });

    } else {
        // Si des matériaux sont sélectionnés, insérer les données dans la table 'reparer'
        const insertQuery = "INSERT INTO reparer (numSerie, numIntervention) VALUES ?";

        // Mapper les matériaux sélectionnés pour les valeurs d'insertion
        const values = selectedMaterials.map(numSerie => [numSerie, numInter]);

        // Exécuter la requête d'insertion dans la base de données
        db.query(insertQuery, [values], (err, result) => {
            if (err) {
                throw err;
            }

            // Afficher le nombre de lignes insérées dans la console et rendre la vue avec un message de succès
            //console.log(`Inserted ${result.affectedRows} rows into reparer table.`);
            res.render('ajouterMat', { messageSucc: "Ajout réussi !", numInter: numInter, numCli: numCli });
        });
    }
});

// Gérer les requêtes GET pour annuler une opération
router.get('/cancel/:numInter', (req, res) => {
    // Vérifier si l'utilisateur est connecté, a la variable de session 'typeSal' et a le rôle (typeSal) égal à 1
    if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
        // Extraire le numéro d'intervention des paramètres de requête
        const numInter = req.params.numInter;

        // Requête DELETE pour supprimer les entrées correspondant au numéro d'intervention dans les tables 'reparer' et 'intervention'
        const deleteReparerQuery = "DELETE FROM reparer WHERE numIntervention = ?";
        db.query(deleteReparerQuery, [numInter], (errReparer, resultReparer) => {
            if (errReparer) {
                throw errReparer;
            }

            // Afficher le nombre de lignes supprimées dans la console

            console.log(`Deleted ${resultReparer.affectedRows} rows from reparer where numIntervention = ${numInter}.`);

            // Requête DELETE pour supprimer l'intervention
            const deleteInterventionQuery = "DELETE FROM intervention WHERE numIntervention = ?";
            db.query(deleteInterventionQuery, [numInter], (errIntervention, resultIntervention) => {
                if (errIntervention) {
                    throw errIntervention;
                }

                // Afficher le nombre de lignes supprimées dans la console
                //console.log(`Deleted ${resultIntervention.affectedRows} row from intervention where numIntervention = ${numInter}.`);

                // Rediriger vers la création d'une nouvelle intervention
                res.redirect("/creerInter");
            });
        });
    } else {

        // Si l'utilisateur n'a pas les autorisations nécessaires, le rediriger vers la racine '/'
        res.redirect("/");
    }
});

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;