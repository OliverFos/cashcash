// Ajout des modules nécessaires
const express = require('express');
const router = express.Router();
const db = require('../connect');
const session = require('express-session');

// Gérer les requêtes GET à la racine '/'
router.get('/', (req, res, next) => {

  //console.log(req.session);

  // Vérifier si l'utilisateur est connecté, a la variable de session 'typeSal' et a le rôle (typeSal) égal à 1
  if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
    // Extraire les identifiants du client et de l'intervention des paramètres de requête
    const idCli = req.query.idCli;
    const idInter = req.query.idInter;
    const date = req.query.date;
    const heure = req.query.heure;

    // Requête SQL pour sélectionner les techniciens disponibles pour l'intervention associée à un client
    const sql = `
    SELECT DISTINCT t.*
    FROM technicien t
    JOIN client c ON t.numAgence = c.numAgence
    WHERE c.numClient = ? AND
          t.numMatr NOT IN (
              SELECT t.numMatr
              FROM technicien t
              LEFT JOIN intervention i ON t.numMatr = i.numMatr
                AND i.dateIntervention = ?
                AND i.heureIntervention BETWEEN DATE_SUB(?, INTERVAL 3 HOUR) AND DATE_ADD(?, INTERVAL 3 HOUR)
              WHERE i.numMatr IS NOT NULL
          );
    `;

    // Exécuter la requête dans la base de données
    db.query(sql, [idCli, date, heure, heure], (err, data) => {
      if (err) {
        throw err;
      }

      //console.log(data);

      // Rendre la vue 'ajouterTech' avec les données récupérées
      res.render('ajouterTech', { techData: data, idCli: idCli, idInter: idInter, numMatr: data[0].numMatr });
    });
  } else {
    // Si l'utilisateur n'a pas les autorisations nécessaires, le rediriger vers la racine '/'
    res.redirect("/");
  }
});

// Gérer les requêtes POST à la racine '/'
router.post('/', (req, res, next) => {
  // Extraire les données à mettre à jour à partir du corps de la requête
  const updateData = [
    req.body.numTech,
    req.body.numInter
  ];

  // Requête SQL pour mettre à jour le technicien associé à une intervention
  const query = "UPDATE intervention SET numMatr = ? WHERE numIntervention = ?;";

  // Exécuter la requête dans la base de données
  db.query(query, updateData, (err, data) => {
    if (err) {
      // En cas d'erreur, rendre la vue 'ajouterTech' avec un message d'erreur
      res.render('ajouterTech', { messageErr: "Erreur" });
    } else {
      // En cas de succès, rendre la vue 'ajouterTech' avec un message de succès et le numéro d'intervention
      res.render('ajouterTech', { messageSucc: "Modification réussie !", numInter: req.body.numInter });
    }
  });
});

// Gérer les requêtes GET pour annuler l'association d'un technicien à une intervention
router.get('/annulerTech/:numInter', (req, res, next) => {
  // Vérifier si l'utilisateur est connecté, a la variable de session 'typeSal' et a le rôle (typeSal) égal à 1
  if (req.session.email && req.session.typeSal && req.session.typeSal === 1) {
    // Extraire le numéro d'intervention des paramètres de requête
    const idInter = req.params.numInter;

    // Requête SQL pour annuler l'association d'un technicien à une intervention
    const query = "UPDATE intervention SET numMatr = NULL WHERE numIntervention = ?;";

    // Exécuter la requête dans la base de données
    db.query(query, [idInter], (err, data) => {
      // Afficher les données récupérées dans la console à des fins de débogage
      console.log(data);
      console.log(req.params);

      if (err) {
        throw err;
      } else {
        // Rediriger vers la page 'affecterVisite' après l'annulation de l'association
        res.redirect("/affecterVisite");
      }
    });
  } else {
    // Si l'utilisateur n'a pas les autorisations nécessaires, le rediriger vers la racine '/'
    res.redirect("/");
  }
});

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;