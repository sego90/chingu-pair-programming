const express = require('express');

const router = express.Router();
const User = require('../models/users');
const runMatch = require('../lib/match_user.js');
const fcc = require('../lib/fccScore.js');

router.get('/', function (req, res) {
  const fccLevels = fcc.toLevelsArray();
  const timezones = require('../lib/timezones.js');
  res.render('request-match', { fccLevels, timezones });
});

router.post('/', function (req, res) {
  const update = {
    $set: {
      profile: {
        timezone: req.body.timezone,
        fccScore: req.body.fccScore,
        fccLevel: fcc.getLevel(req.body.fccScore),
      },
      pending: {
        created: new Date(),
      },
    },
  };

  User.findByIdAndUpdate(req.user._id, update, { new: true }).exec()
  .then(runMatch);

  res.redirect('/');
});

router.get('/delete', function (req, res) {
  User.findByIdAndUpdate(req.user._id, { $unset: { pending: '' } }).exec();
  res.redirect('/');
});

module.exports = router;
