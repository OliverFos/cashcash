// Ajout des modules nécessaires
var express = require('express');
var router = express.Router();
const db = require('../connect');
const session = require('express-session');

// Gérer les requêtes GET à la racine '/'
router.get('/', function(req, res, next) {
  // Vérifier si l'utilisateur est connecté et a la variable de session 'typeSal'
  if (req.session.email && req.session.typeSal) {
    // Vérifier si le typeSal de l'utilisateur est égal à 1 (1 = assistant téléphonique)
    if(req.session.typeSal == 1){
      // Rendre la vue 'rechClient' pour permettre à l'utilisateur de rechercher des clients
      res.render('rechClient');
    } else {
      // Rediriger vers la racine '/' si l'utilisateur n'a pas les autorisations nécessaires
      res.redirect("/");
    }
  } else {
    // Rediriger vers la racine '/' si l'utilisateur n'est pas connecté
    console.log("utilisateur non connecté")
    res.redirect("/");
  }
});

// Gérer les requêtes POST à la racine '/'
router.post('/', (req, res) => {
  // Extraire le numéro du client à rechercher à partir du formulaire
  const numCli = req.body.numCli;
  // Requête SQL pour récupérer les informations du client en fonction de son numéro
  const sql = "SELECT * FROM client WHERE client.numClient = ?";
  
  db.query(sql, numCli, (err, data) => {
    if (err) throw err;
    console.log(data);
    // Vérifier si des données ont été trouvées pour le numéro de client donné
    if (data.length == 0){
      // Afficher un message si la fiche client recherchée n'existe pas
      res.render('rechClient', { message : "La fiche client que vous recherchez n'existe pas" });
    } else {
      // Afficher les données du client trouvé
      res.render('rechClient', { cliData: data });
    }
  });
});

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;
