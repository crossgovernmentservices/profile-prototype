var express = require('express'),
    router = express.Router(),
    passport = require('passport');

// routes defined before the authentication redirect middleware do not require
// login.
router.get('/login', function(req, res, next){
  passport.authenticate('auth0', {
    state: req.query.target
  })(req, res, next);
});

// Auth0 callback handler
router.get('/callback',
  passport.authenticate('auth0', {}),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }

    res.redirect(req.query.state || "/");
  });

// middleware to redirect to login if not authenticated
// routes defined before this middleware do not require authentication
// routes defined after *do* require authentication
router.use(function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login?target=' + res.locals.current_url);
  }
  next();
});

router.get('/logout', function (req, res) {
  // logout express session
  req.logout();

  // log out of auth0
  res.redirect('https://' + process.env.AUTH0_DOMAIN +
    '/v2/logout?returnTo=' +
    encodeURIComponent('http://' + process.env.SITE_DOMAIN + '/'));
});

router.get('/user', function(req, res){
  res.render('user');
});

module.exports = router;
