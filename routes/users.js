var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


// Route Insscription

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // On verifie si l'user est déja enregistré 
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32),
        
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // S'il existe déjà
      res.json({ result: false, error: 'Vous avez déjà un compte' });
    }
  });
});

// Permettre au User de se connecter  

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data) {
      if (bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token });
      } else {
        res.json({
          result: false,
          error: 'Identifiant ou mot de passe incorrect',
        });
      }
    } else {
      res.json({ result: false, error: 'Utilisateur introuvable' });
    }
  });
});
module.exports = router;
