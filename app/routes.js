var express = require('express'),
    router = express.Router(),
    passport = require('passport');

// routes defined before the authentication redirect middleware do not require
// login.
router.get('/login', function (req, res) {
  res.render('login');
});

// Auth0 callback handler
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/user");
  });

// middleware to redirect to login if not authenticated
// routes defined before this middleware do not require authentication
// routes defined after *do* require authentication
router.use(function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
});

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/logout', function (req, res) {
  if(req.isAuthenticated()){
    req.logout();
  }
  res.redirect('/');
});

router.get('/examples/template-data', function (req, res) {
  res.render('examples/template-data', { 'name' : 'Foo' });
});

router.get('/user', function(req, res){
  res.render('user', {'user': req.user._json});
});

module.exports = router;
