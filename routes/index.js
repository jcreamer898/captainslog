var express = require('express');
var router = express.Router();

var OAuth2 = require("oauth").OAuth2;

var clientId = "555bd560f3e7f911daee";
var secret = "6524f6f635189de699cd8c3e47f276d7772b24e9";
var oauth = new OAuth2(clientId, secret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");

var GitHubApi = require("github");

var github = new GitHubApi({
    debug: true,
    version: "3.0.0"
});

// github.authenticate({
//   type: "oauth",
//   key: "555bd560f3e7f911daee",
//   secret: "6524f6f635189de699cd8c3e47f276d7772b24e9"
// });

// github.authorization.create({
//   scopes: ["user", "public_repo", "repo", "repo:status", "gist"],
//   note: "what this auth is for",
//   note_url: "http://url-to-this-auth-app",
//   headers: {
//       "X-GitHub-OTP": "two-factor-code"
//   }
// }, function(err, res) {
//     console.log(err, res);
//     // if (res.token) {
//         //save and use res.token as in the Oauth process above from now on
//     // }
// });
var accessToken;
router.get("/", function(req, res) {
  
  github.authenticate({
    type: "oauth",
    // Replace this with actual token from /login
    token: "c545a73b7f09334d31c153030e779e4a362ef8be"
  });

  github.events.getFromUser({
    user: "jcreamer898"
  }, function(err, response) {
    res.render("index", {
      accessToken: accessToken,
      events: response.filter(function(event) {
        return event.type === "PushEvent" || event.type === "PullRequestEvent";
      })
    });
  });
});

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.redirect(oauth.getAuthorizeUrl({ 
      redirect_uri: 'http://localhost:3000/authorize',
      scope: "user,repo,gist"
  }));
});

router.get('/authorize', function(req, res, next) {
  oauth.getOAuthAccessToken(req.query.code, {}, function (err, access_token, refresh_token) {
    if (err) {
      console.log(err);
      res.writeHead(500);
      res.end(err + "");
      return;
    }
    
    accessToken = access_token;
    
    // authenticate github API
    github.authenticate({
      type: "oauth",
      token: accessToken
    });
      
    //redirect back
    res.writeHead(303, {
        Location: "/"
    });
    res.end();
  });
});

module.exports = router;
