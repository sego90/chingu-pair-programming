const express = require('express');

const router = express.Router();
const passport = require('passport');
const slack = require('slack');
const Team = require('../models/teams');

/* Start slack OAuth flow */
router.get('/slack', passport.authenticate('slack'));

/* Slack OAuth callback url */
router.get('/slack/callback',
  passport.authenticate('slack', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/slack/install', function (req, res) {
  var client_id = process.env.SLACK_CLIENT_ID;
  var client_secret = process.env.SLACK_CLIENT_SECRET;
  var code = req.query.code;
  var redirect_uri = process.env.INSTALL_LINK;

  slack.oauth.access({ client_id, client_secret, code, redirect_uri }, (err, data) => {
    if(err){
      console.error(err);
    }
    Team.findOne({accessToken: data.access_token})
    .then(function(team){
      if(team){
        // Team exists already
        team.accessToken = data.access_token;
        team.scope = data.scope;
        team.userId = data.user_id;
        team.teamName = data.team_name;
        team.teamId = data.team_id;
        team.bot = {
          bot_user_id: data.bot.bot_user_id,
          bot_access_token: data.bot.bot_access_token
        }
        team.save(function(err){
          if(err) {
            throw err
          }else{
            //send app already installed and success update message
          }
        })
      }else{
        var newTeam = new Team()
        newTeam.accessToken = data.access_token;
        newTeam.scope = data.scope;
        newTeam.userId = data.user_id;
        newTeam.teamName = data.team_name;
        newTeam.teamId = data.team_id;
        newTeam.bot = {
          bot_user_id: data.bot.bot_user_id,
          bot_access_token: data.bot.bot_access_token
        }
        newTeam.save(function(err){
          if(err) {
            throw err;
          }else{
            //send success installation message.
          }
        })
      }
      res.redirect('/login')
    })
  })
})

module.exports = router;
