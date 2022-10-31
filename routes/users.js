var express = require('express');
var router = express.Router();
// IMPORTS MODELES
require('../models/connection');
const User = require('../models/users');
const Restaurant = require('../models/restaurants');
const Question = require('../models/questions');
// IMPORTS MODULES
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const { checkBody } = require('../modules/checkBody');

// POST /INSCRIPTION USER
router.post('/signup', (req, res) => {
  // On s'assure que les champs nécessaires soient bien remplis
  if (!checkBody(req.body, ['username', 'password'])) {
    //si non : message d'erreur
    res.json({
      result: false,
      error: 'Les champs ne sont pas correctement remplis',
    });
    return;
  }

  // On verifie si l'user est déja enregistré
  User.findOne({ username: req.body.username }).then((data) => {
    const user = req.body;

    //si non, on l'inscrit
    if (data === null) {
      //on stocke dans une constante la méthode pour crypter le password
      const hash = bcrypt.hashSync(user.password, 10);

      //on crée un objet pour les informations du nouvel utilisateur
      const newUser = new User({
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        password: hash, //password cryspé
        token: uid2(32), //token généré
        diets: user.diets,
        intolerances: user.intolerances,
        profilGourmand: user.profilGourmand,
        badges: [],
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // message d'erreur si l'utilisateur existe déjà
      res.json({ result: false, error: 'Vous avez déjà un compte' });
    }
  });
});

// POST /CONNEXION USER
router.post('/signin', (req, res) => {
  // On s'assure que les champs nécessaires soient bien remplis
  if (!checkBody(req.body, ['username', 'password'])) {
    //si non : message d'erreur
    res.json({
      result: false,
      error: 'Les champs ne sont pas correctement remplis',
    });
    return;
  }

  // On verifie si l'user est bien enregistré
  User.findOne({ username: req.body.username }).then((data) => {
    //si données :
    if (data) {
      //on vérifie son password
      if (bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token });
      }
      //si non, message d'erreur
      else {
        res.json({
          result: false,
          error: 'Identifiant ou mot de passe incorrect',
        });
      }
    }

    //si pas de données :
    else {
      res.json({ result: false, error: 'Utilisateur introuvable' });
    }
  });
});

// POST /SHOW USER DATA
router.post('/user', (req, res) => {
  User.findOne({ username: req.body.username }).then((data) => {
    res.json({ result: true, data });
  });
});

// GET /USER AFFICHE LES RESTAURANTS SI PLATS DU JOUR
router.get('/getplatsdujour', (req, res) => {
  //on trouve les restaurants ayant un plat du jour
  Restaurant.find({
    platsdujour: { $exists: true, $type: 'array', $ne: [] },
  }).then((data) => {
    //on crée un tableau
    const dailyMeals = [];

    if (data !== null) {
      for (const restaurant of data) {
        for (const dailyMeal of restaurant.platsdujour) {
          //on crée des objets comprenant les données à récupérer
          let pdj = {
            restaurant: restaurant.name,
            meal: dailyMeal.name,
            src: dailyMeal.src,
            date: dailyMeal.date,
          };
          //on les push dans le tableau
          dailyMeals.push(pdj);
        }
      }
    }

    res.json({ result: true, platsdujour: dailyMeals });
  });
});

// GET plats du jour : pour tous les restaurants de la DB, retourne son nom, son adresse,
// ses coordonnées, et son dernier plat. Utilisé dans mapScreen.js
router.get('/platsdujour/read/', (req, res) => {
  Restaurant.find({}, 'address coordinates name platsdujour').then((data) => {
    const restaurants = [];

    data.map((restaurant) => {
      const { address, coordinates, name, platsdujour } = restaurant;
      restaurants.push({
        address,
        coordinates,
        dernierPlat: platsdujour[platsdujour.length - 1],
        name,
      });
    });

    res.json({
      result: true,
      restaurants: restaurants,
    });
  });
});

// POST /USER POSE UNE QUESTION
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
    Question.find().then((question) => {
      res.json({ result: true, question });
    });
  });
});

module.exports = router;
