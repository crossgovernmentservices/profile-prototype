var path = require('path'),
    express = require('express'),
    routes = require(__dirname + '/app/routes.js'),
    favicon = require('serve-favicon'),
    app = express(),
    port = (process.env.PORT || 3000),
    passport = require('passport'),
    Auth0Strategy = require('passport-auth0'),
    cookieParser = require('cookie-parser'),
    session = require('express-session');

// load values in .env into process.env
require('dotenv').load();

// Grab environment variables specified in Procfile or as Heroku config vars
var env = process.env.NODE_ENV || 'development';

// Auth0 setup
var auth_strategy = new Auth0Strategy({
    domain:       'xgs.eu.auth0.com',
    clientID:     '85tRVeT4eU53Vn6NXy6TF8Pz4M31PWOh',
    clientSecret: 'ikNBTBWFBQ42jJvsFDfne-6bPgMfMZdL7qyoLMN7nE1MqqSmnZSGM3oYzgvbchn-',
    callbackURL:  '/callback'
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });

passport.use(auth_strategy);

// This is not a best practice, but we want to keep things simple for now
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// add Auth0 env vars to global context
app.use(function(req, res, next){
  res.locals.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
  res.locals.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
  res.locals.AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL;
  next();
});


// Add session and passport middleware
app.use(cookieParser());
app.use(session({ secret: 'shhhhhhhhh' }));
app.use(passport.initialize());
app.use(passport.session());


// Application settings
app.engine('html', require(__dirname + '/lib/template-engine.js').__express);
app.set('view engine', 'html');
app.set('vendorViews', __dirname + '/govuk_modules/govuk_template/views/layouts');
app.set('views', __dirname + '/app/views');

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_template/assets'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit'));

app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images','favicon.ico')));


// send assetPath to all views
app.use(function (req, res, next) {
  res.locals.assetPath="/public/";
  next();
});


// routes (found in app/routes.js)

if (typeof(routes) != "function"){
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  app.use("/", routes);
}

// auto render any view that exists

app.get(/^\/([^.]+)$/, function (req, res) {

	var path = (req.params[0]);

	res.render(path, function(err, html) {
		if (err) {
			console.log(err);
			res.sendStatus(404);
		} else {
			res.end(html);
		}
	});

});

// start the app

app.listen(port);
console.log('');
console.log('Listening on port ' + port);
console.log('');
