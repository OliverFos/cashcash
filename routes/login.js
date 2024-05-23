// Ajout des modules nécessaires
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt')
const router = express.Router();
const connection = require('../connect');

// Gérer les requêtes GET à la racine '/'
router.get('/', function(req, res, next) {
  // Rendre la vue 'login' pour afficher le formulaire de connexion
  res.render('login');
});

// Gérer les requêtes POST à la racine '/'
router.post('/', function(req, res) {
  // Extraire les données du formulaire de connexion
  let email = req.body.email;
  let mdp = req.body.mdp;

  
  // Vérifier si l'email et le mot de passe ont été fournis
  if (email && mdp) {

    // Requête SQL pour vérifier l'authentification de l'utilisateur
    connection.query('SELECT * FROM salarie where salarie.email = ?', [email], function(error, data) {
      if (error) throw error;

      if (data.length > 0) {
        bcrypt.compare(mdp, data[0].mdp, function(err, result) {
          if (result){
            // Enregistrer les informations de session et rediriger vers la page d'accueil
            req.session.loggedin = true;
            req.session.email = email;
            req.session.typeSal = data[0].typeSal;
            req.session.numSal = data[0].numMatr;
            res.redirect('/');
          } else {
            // En cas d'échec d'authentification, afficher un message d'erreur
            res.render('login',{messageErr : "le mot de passe ou l'email n'est pas correcte"});
          }
          res.end();
        });
      } else {
        res.render('login',{messageErr : "l'utilisateur n'existe pas"});
        res.end();
      }
    });
  } else {
    // Si l'email ou le mot de passe n'ont pas été fournis, afficher un message d'erreur
    res.render('login',{messageErr : "veuillez entrer un email et un mot de passe"});
    res.end();
  }
});

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;
