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
const { default: mongoose } = require('mongoose');

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
  User.findOne({ username: req.body.username })
    .populate('collections.likes.restaurants')
    .populate('collections.bookmarks.restaurants')
    .populate('collections.visited.restaurants')
    .then((data) => {
      res.json({
        result: true,
        data,
      });
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
            diets: dailyMeal.diets,
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
  Restaurant.find({}, 'address coordinates name platsdujour token').then(
    (data) => {
      const restaurants = [];

      data.map((restaurant) => {
        const { address, coordinates, name, platsdujour, token } = restaurant;
        restaurants.push({
          address,
          coordinates,
          dernierPlat: platsdujour[platsdujour.length - 1],
          name,
          token,
        });
      });

      res.json({
        result: true,
        restaurants: restaurants,
      });
    }
  );
});

// GET get restaurant likes
router.get('/:userToken/likes', async (req, res) => {
  const { userToken } = req.params;

  const likedRestaurants = await User.findOne(
    { token: userToken },
    'collections.likes.restaurants'
  ).populate('collections.likes.restaurants');

  res.json({
    result: true,
    data: likedRestaurants,
    log: `Returned liked restaurants for token ${userToken} from DB`,
  });
});

// POST add restaurant to likes
router.post('/like', async (req, res) => {
  const { userToken, restaurantToken } = req.body;

  // Si un token user et un username restaurant manquent, arrête-toi ici
  if (!checkBody(req.body, ['userToken', 'restaurantToken'])) {
    res.json({
      result: false,
      error: 'Missing or empty fields',
    });
  }
  // Sinon, trouve l'id d'un restaurant à l'aide de son token
  else {
    const restaurantId = await Restaurant.findOne(
      { token: restaurantToken },
      '_id'
    );
    // Puis ajoute-le à collections.likes.restaurants du user dont j'ai fourni le token
    User.updateOne(
      { token: userToken },
      {
        $addToSet: { 'collections.likes.restaurants': restaurantId },
      }
    ).then(
      res.json({
        result: true,
        log: `Success: the restaurant with token: ${restaurantToken} was liked / added to collections.likes.restaurants in the DB`,
      })
    );
  }
});

// POST remove restaurant from likes
router.post('/dislike', async (req, res) => {
  const { userToken, restaurantToken } = req.body;

  // Si un token user et un username restaurant manquent, arrête-toi ici
  if (!checkBody(req.body, ['userToken', 'restaurantToken'])) {
    res.json({
      result: false,
      error: 'Missing or empty fields',
    });
  }
  // Sinon, trouve l'id d'un restaurant à l'aide de son token
  else {
    const restaurantId = await Restaurant.findOne(
      { token: restaurantToken },
      '_id'
    );
    // Puis enlève-le à la collections.likes.restaurants du user dont j'ai fourni le token
    User.updateOne(
      { token: userToken },
      {
        $pull: {
          'collections.likes.restaurants':
            mongoose.Types.ObjectId(restaurantId),
        },
      }
    ).then(
      res.json({
        result: true,
        log: `Success: the restaurant with token: ${restaurantToken} was disliked / removed from collections.likes.restaurants in the DB`,
      })
    );
  }
});

// POST add restaurant to bookmarks
router.post('/bookmark', async (req, res) => {
  const { userToken, restaurantUsername } = req.body;

  // Si un token user et un username restaurant manquent, arrête-toi ici
  if (!checkBody(req.body, ['userToken', 'restaurantUsername'])) {
    res.json({
      result: false,
      error: 'Missing or empty fields',
    });
  }
  // Sinon, trouve l'id d'un restaurant à l'aide de son username
  else {
    const restaurantId = await Restaurant.findOne(
      { username: restaurantUsername },
      '_id'
    );
    // Puis ajoute-le à collections.likes.restaurants du user dont j'ai fourni le token
    User.updateOne(
      { token: userToken },
      {
        $addToSet: { 'collections.bookmarks.restaurants': restaurantId },
      }
    ).then(
      res.json({
        result: true,
        log: `Success: the restaurant with username: ${restaurantUsername} was bookmarked / added to collections.bookmarks.restaurants in the DB`,
      })
    );
  }
});

// POST add restaurant to visited
router.post('/visited', async (req, res) => {
  const { userToken, restaurantUsername } = req.body;

  // Si un token user et un username restaurant manquent, arrête-toi ici
  if (!checkBody(req.body, ['userToken', 'restaurantUsername'])) {
    res.json({
      result: false,
      error: 'Missing or empty fields',
    });
  }
  // Sinon, trouve l'id d'un restaurant à l'aide de son username
  else {
    const restaurantId = await Restaurant.findOne(
      { username: restaurantUsername },
      '_id'
    );
    // Puis ajoute-le à collections.likes.restaurants du user dont j'ai fourni le token
    User.updateOne(
      { token: userToken },
      {
        $addToSet: { 'collections.visited.restaurants': restaurantId },
      }
    ).then(
      res.json({
        result: true,
        log: `Success: the restaurant with username: ${restaurantUsername} was marked as visited / added to collections.visited.restaurants in the DB`,
      })
    );
  }
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
