var express = require('express');
var router = express.Router();

require('../models/connection');
const Restaurant = require('../models/restaurants');
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
        adress: restaurant.adress,
        siren: restaurant.siren,
        website: restaurant.website,
        phone: restaurant.phone,
        platdujour: {},
        cuisine: restaurant.cuisine,
        atmosphere: restaurant.atmosphere,
        bookings: restaurant.bookings,
        miscellaneous: restaurant.miscellaneous,
        bioShort: restaurant.bioShort,
        bioLong: restaurant.bioLong,
        socials: restaurant.socials,
        goals: restaurant.goals,
        qrCode: restaurant.qrCode

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
router.post('/platdujour', (req, res) => {
  const pdj = req.body;

  if (!checkBody(req.body, ['token'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  Restaurant.updateOne(
    { token: pdj.token },
    {
      platdujour:
      {
        name: pdj.name,
        description: pdj.description,
        src: pdj.src,
        date: pdj.date,
      }
    }
  )
    .then(() => {

      Restaurant.find().then((data) => {
        console.log(data);
      })

    })
});

router.get('/getplatdujour', (req, res) => {
    Restaurant.find()
    //   .populate('restaurants')
      .then((data) => {
        let dailyMeals = [];
        for (let i = 0; i < data.length; i++) {
            dailyMeals.push(data[i].platdujour) 
        }
        res.json({ result: true, platsdujour: dailyMeals});
      });
     
  });
module.exports = router;
