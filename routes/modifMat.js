const express = require('express');
const router = express.Router();
const db = require('../connect');
const session = require('express-session');

// Gérer les requêtes GET à la racine '/'
router.get('/', async (req, res) => {
    if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
        const numCli = req.query.numCli;
        const numInter = req.query.numInter;

        const selectQuery = `SELECT DISTINCT m.*
                             FROM materiel m
                             JOIN contrat c ON m.numContrat = c.numContrat
                             JOIN intervention i ON m.numClient = i.numClient
                             WHERE m.numClient = ?
                               AND c.dateEcheance > i.dateIntervention;`;

        db.query(selectQuery, numCli, (err, data) => {
            if (err) {
                return res.status(500).send("Database query error");
            }

            if (data.length === 0) {
                return res.redirect(`ajouterMat/cancel/${numInter}`);
            }

            res.render('ajouterMat', { matData: data, numInter: numInter, numCli: numCli });
        });

    } else {
        res.redirect("/");
    }
});

router.post('/', (req, res) => {
    const selectedMaterials = Object.keys(req.body);
    const numCli = req.query.numCli;
    const numInter = req.query.numInter;

    if (selectedMaterials.length === 0) {
        const selectQuery = `SELECT DISTINCT m.*
                             FROM materiel m
                             JOIN contrat c ON m.numContrat = c.numContrat
                             JOIN intervention i ON m.numClient = i.numClient
                             WHERE m.numClient = ?
                               AND c.dateEcheance > i.dateIntervention;`;

        db.query(selectQuery, numCli, (err, data) => {
            if (err) {
                return res.status(500).send("Database query error");
            }

            if (data.length === 0) {
                return res.redirect(`ajouterMat/cancel/${numInter}`);
            }

            res.render('ajouterMat', { matData: data, numInter: numInter, messageErr: "Aucun matériau sélectionné" });
        });

    } else {
        const insertQuery = "INSERT INTO reparer (numSerie, numIntervention) VALUES ?";
        const values = selectedMaterials.map(numSerie => [numSerie, numInter]);

        db.query(insertQuery, [values], (err, result) => {
            if (err) {
                return res.status(500).send("Database insertion error");
            }

            res.render('ajouterMat', { messageSucc: "Ajout réussi !", numInter: numInter, numCli: numCli });
        });
    }
});

router.get('/cancel/:numInter', (req, res) => {
    if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
        const numInter = req.params.numInter;

        const deleteReparerQuery = "DELETE FROM reparer WHERE numIntervention = ?";
        db.query(deleteReparerQuery, [numInter], (errReparer, resultReparer) => {
            if (errReparer) {
                return res.status(500).send("Error deleting reparer");
            }

            const deleteInterventionQuery = "DELETE FROM intervention WHERE numIntervention = ?";
            db.query(deleteInterventionQuery, [numInter], (errIntervention, resultIntervention) => {
                if (errIntervention) {
                    return res.status(500).send("Error deleting intervention");
                }

                res.redirect("/creerInter");
            });
        });
    } else {
        res.redirect("/");
    }
});

module.exports = router;
