var express = require('express');
var router = express.Router();

require('../models/connection');
const Restaurant = require('../models/restaurants');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const Answer = require('../models/answers');
const Question = require('../models/questions');

// Route Inscription
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // On verifie si l'user est déja enregistré

  Restaurant.findOne({ username: req.body.username }).then((data) => {
    const restaurant = req.body;

    if (data === null) {
      const hash = bcrypt.hashSync(restaurant.password, 10);

      const newRestaurant = new Restaurant({
        username: restaurant.username,
        email: restaurant.email,
        name: restaurant.name,
        password: hash,
        token: uid2(32),
        address: restaurant.address,
        siren: restaurant.siren,
        website: restaurant.website,
        phone: restaurant.phone,
        platsdujour: [],
        cuisine: restaurant.cuisine,
        atmosphere: restaurant.atmosphere,
        bookings: restaurant.bookings,
        miscellaneous: restaurant.miscellaneous,
        bioShort: restaurant.bioShort,
        bioLong: restaurant.bioLong,
        socials: restaurant.socials,
        goals: restaurant.goals,
        qrcode: restaurant.qrCode,
      });

      newRestaurant.save().then((newDoc) => {
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

  Restaurant.findOne({ username: req.body.username }).then((data) => {
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

//Ajouter un plat du jour

router.post('/addplatdujour', (req, res) => {
  const data = req.body;
  const { name, description, src, date, diets, token } = data;
  if (!checkBody(req.body, ['token'])) {
    res.json({
      result: false,
      error: 'Missing or empty fields',
    });
  }
  Restaurant.updateOne(
    { token },
    {
      $push: {
        platsdujour: {
          name,
          description,
          src,
          date,
          diets,
        },
      },
    }
  ).then(() => {
    Restaurant.findOne({ token }).then((restaurant) =>
      res.json({
        result: true,
        platsdujour: restaurant.platsdujour,
      })
    );
  });
});

//Supprimer un plat du jour

router.post('/deleteplatdujour/:token', (req, res) => {
  Restaurant.updateOne({ token: req.params.token }, { platsdujour: [] }).then(
    () => {
      Restaurant.find().then((data) => {
        res.json({ result: true, data });
      });
    }
  );
});

router.post('/answer/:token', async (req, res) => {
  //On vérifie que le formulaire est rempli
  if (!checkBody(req.body, ['message'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
  }

  //on récupère l'id du restaurant, on attend d'obtenir la réponse
  let restaurant = await Restaurant.findOne({ restaurant: req.body.token });
  //on récupère l'id de la question via les params, on attend d'obtenir la réponse
  let question = await Question.findOne({ question: req.params.token });

  //on crée une nouvelle question en renseignant les deux id
  const newAnswer = new Answer({
    restaurant: restaurant.id,
    question: question.id,
    date: req.body.date,
    token: uid2(32),
    message: req.body.message,
  });

  newAnswer.save().then(() => {
    Answer.find().then((question) => {
      res.json({ result: true, question });
    });
  });
});

module.exports = router;
