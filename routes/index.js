// Ajout des modules nécessaires
var express = require('express');
const session = require('express-session');
var router = express.Router();

// Gérer les requêtes GET à la racine '/'
router.get('/', function(req, res, next) {
  // Vérifier si l'utilisateur a une session avec l'adresse email enregistrée
  if (req.session.email) {
    // Rendre la vue 'index' en passant les données de session (email et typeSal) en tant que variables
    res.render('index', { email: req.session.email, typeSal: req.session.typeSal });
  } else {
    // Rediriger vers la page de connexion si l'utilisateur n'a pas de session
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(400).send('Unable to log out')
      } else {
        res.redirect('/login');
      }
    });
  } else {
    res.end()
  }
})

// Exporter l'objet router pour le rendre disponible pour une utilisation dans d'autres fichiers
module.exports = router;