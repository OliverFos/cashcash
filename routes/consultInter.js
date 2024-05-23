// Ajout des modules nécessaires
var express = require('express');
var router = express.Router();
const db = require('../connect');
const session = require('express-session');

// Gérer les requêtes GET à la racine '/'
router.get('/', function(req, res, next) {
  // Vérifier si l'utilisateur a une session avec l'adresse email enregistrée
  if (req.session.email) {
    // Vérifier si l'utilisateur a le rôle (typeSal) différent de 1
    if (req.session.typeSal == 0) {
     
      //console.log(req.session);

      // Requête SQL pour récupérer les interventions associées à un technicien spécifique
      const sql = `
        SELECT DISTINCT
          intervention.numIntervention,
          DATE_FORMAT(intervention.dateIntervention, '%d-%m-%Y') AS dateIntervention,
          intervention.heureIntervention,
          intervention.numClient,
          client.tempsDeplacement,
          client.distanceKilo
        FROM
          intervention
          JOIN reparer ON intervention.numIntervention = reparer.numIntervention
          JOIN client ON intervention.numClient = client.numClient
        WHERE
          intervention.numMatr = ?
          AND reparer.durreReparationMat IS NULL
        ORDER BY
          intervention.dateIntervention,
          intervention.heureIntervention,
          client.distanceKilo ASC
      `;
      // Exécuter la requête dans la base de données avec le numéro du technicien issu de la session
      db.query(sql, req.session.numSal, (err, data) => {
        if (err) throw err;

        //console.log(data);

        // Si aucune donnée n'est récupérée, rendre la vue 'consultInter' avec un message approprié, sinon, rendre la vue avec les données récupérées
        if (data.length == 0) {
          res.render('consultInter', { message: "Vous n'avez pas d'intervention" });
        } else {
          res.render('consultInter', { interData: data });
        }
      });
    } else {
      // Si l'utilisateur a le rôle (typeSal) égal à 1, le rediriger vers la racine '/'
      res.redirect("/");
    }
  } else {
    // Si l'utilisateur n'a pas de session ou n'a pas l'adresse email enregistrée, le rediriger vers la racine '/'
    res.redirect("/");
  }
});

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;