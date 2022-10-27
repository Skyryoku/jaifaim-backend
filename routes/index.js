var express = require('express');
var router = express.Router();
const Preference = require('../models/preferences');

// GET DIETS (retourne tous les régimes possibles)
router.get('/diets', (req, res) => {
  Preference.findOne({}, 'diets').then((data) =>
    res.json({ result: true, diets: data })
  );
});

module.exports = router;
