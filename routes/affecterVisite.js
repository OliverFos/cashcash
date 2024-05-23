// Ajout des modules nécéssaires
var express = require('express');
var router = express.Router();
const session = require('express-session');
const db = require('../connect'); // Contient la logique de connexion à la base de données

// Défini une route pour gérer les requêtes GET à la racine '/'
router.get('/', function(req, res, next) {
  // Vérifier si l'utilisateur est connecté et a les variables de session requises
  if (req.session.email && req.session.typeSal) {
    // Vérifier si l'utilisateur a le rôle requis (typeSal)
    if (req.session.typeSal === 1) {

      // Afficher les interventions sans Technicienns
      const sql = "SELECT * FROM intervention WHERE numMatr IS NULL";

      db.query(sql, (err, data) => {
        // Gérer les éventuelles erreurs survenues lors de la requête à la base de données
        if (err) {
          throw err;
        }

        // Rendre la vue 'affecterVisite' et transmettre les données récupérées
        res.render('affecterVisite', { interventionData: data });
        
      });
    } else {
      // Si l'utilisateur n'a pas le rôle correct, le rediriger vers la racine '/'
      res.redirect("/");
    }
  } else {
    // Si l'utilisateur n'est pas connecté ou n'a pas les variables de session requises, le rediriger vers la racine '/'
    res.redirect("/");
  }
});

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;