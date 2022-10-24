var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const Restaurant = require('../models/restaurants');
const Question = require('../models/questions');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

//Route Inscription

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Les champs ne sont pas correctement remplis' });
    return;
  }

  // On verifie si l'user est déja enregistré 
  User.findOne({ username: req.body.username }).then((data) => {
    const user = req.body;

    if (data === null) {
      const hash = bcrypt.hashSync(user.password, 10);

      const newUser = new User({
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        password: hash,
        token: uid2(32),
        diets: user.diets,
        intolerances: user.intolerances,
        profilGourmand: user.profilGourmand,
        badges: [],
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
    res.json({ result: false, error: 'Les champs ne sont pas correctement remplis' });
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


//Permettre au User de consulter les plats du jour

router.get('/getplatsdujour', (req, res) => {
  Restaurant.find()
    .then((data) => {
      let dailyMeals = [];
      for (let i = 0; i < data.length; i++) {
        dailyMeals.push(data[i].platdujour)
      }
      res.json({ result: true, platsdujour: dailyMeals });
    });

});


//Permettre au User de poser une question

router.post('/askquestion/:token', async (req, res) => {

  //On vérifie que le formulaire est rempli
  if (!checkBody(req.body, ['message'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
  }

  //on récupère l'id du user, on attend d'obtenir la réponse
  let user = await User.findOne({ user: req.body.token });
  //on récupère l'id du restaurant via les params, on attend d'obtenir la réponse
  let restaurant = await Restaurant.findOne({ user: req.params.token });

  //on crée une nouvelle question en renseignant les deux id
  const newQuestion = new Question({
    user: user.id,
    restaurants: restaurant.id,
    date: req.body.date,
    token: uid2(32),
    message: req.body.message,
  });

  newQuestion.save().then(() => {
    Question.find().then(question => {
      res.json({ result: true, question });
    });
  });
});

module.exports = router;