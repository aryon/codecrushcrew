const express = require('express')
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const cookieSession = require('cookie-session');
const app = express()
const port = process.env.PORT || 5000;
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const moment = require('moment');

const Lesson = require('./models/lesson')
const User = require('./models/user')
const { isAdmin } = require('./middleware/isAdmin');
require('dotenv').config();

app.use(expressLayouts);
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded

app.use(express.urlencoded())

// Database config
mongoose.connect(process.env.MONGO_DB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/**
 * Middleware configuration for Passport
 */
// Configure cooke session for express
app.use(express.static('public'));
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // One day in milliseconds
  keys: ['yum cookies are good']
}));
// Used to initialize passport
app.use(passport.initialize());
// Used to persist login sessions
app.use(passport.session());
// Used to convert the passport user to a cookei user object
passport.serializeUser((user, done) => {
  // TODO: Look up user in database based on user.email match
  // and return THAT user.
  done(null, user);
});
// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
  done(null, user);
});
// Middleware to check if the user is authenticated
function isUserAuthenticated(req, res, next) {
  if(req.user) {
    next();
  } else {
    res.redirect('/login')
  }
}

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

var env = process.env.NODE_ENV || 'dev';

if(env !== 'dev') {
  app.use(requireHTTPS);
}

/**
 * Swoop Specific configuration for Passport OAuth2
 */
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get('https://auth.swoop.email/oauth2/profile', accessToken, function(err, body, res) {
    let profile = JSON.parse(body);
    profile.token = accessToken;
    done(null, profile);
  });
};

let params = {
  authorizationURL: process.env.AUTH_URL,
  tokenURL: process.env.TOKEN_URL,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: `${process.env.CALLBACK_URL}/auth/swoop/callback`
};

passport.use('swoop', new OAuth2Strategy(params, function(accessToken, refreshToken, profile, done) {
  done(null, profile);
}));
// Generates the login link and redirects
app.get('/auth/swoop', passport.authenticate('swoop', { scope: ['email'], state: { foo: 'bar' } }));
// Callback function after authentication occurs
app.get('/auth/swoop/callback', passport.authenticate('swoop', { session: true }), (req, res, next) => {

  var query = {'email': req.user.email};

  User.findOneAndUpdate(query, query, {upsert: true}, function(err, doc) {
      console.log(err)
      console.log(doc)
  });

  res.redirect('/lessons');
});

/**
 * Routes
 */
// Root routes
app.get('/', (req, res) => {
  res.render('index.ejs', {
    user: req.user,
    title: "Code Crush Crew"
  });
});
// Secret route
app.get('/lessons', isUserAuthenticated, isAdmin(), async (req, res, next) => {

  let lessons = [];
  try {
    lessons = await Lesson.find()
    .sort('sort')
  } catch (err) {
    next(err);
  }

  res.render('lessons.ejs', {
    isAdmin: req.isAdmin,
    user: req.user,
    lessons: lessons,
    title: "Code Crush Crew - Lessons",
    moment: moment
  });
});

app.post('/lessons', isUserAuthenticated, isAdmin(), async (req, res, next) => {
  if(!req.isAdmin) {
    return res.redirect('/')
  }

  let params = req.body;
  let l = new Lesson(params);
  await l.save();

  res.redirect('/lessons');

})

app.post('/lessons/:id', isUserAuthenticated, isAdmin(), async (req, res, next) => {
  if(!req.isAdmin) {
    return res.redirect('/')
  }

  let params = req.body;
  let id = req.params.id;

  if(req.body._method && req.body._method === 'put') {
    await Lesson.findOneAndUpdate( { _id: id }, params, { new: true } );
  } else if(req.body._method && req.body._method === 'delete') {
    let lesson = Lesson.findById(id);
    await lesson.remove();
  }

  res.redirect('/lessons');

})

app.put('lessons/:id', isUserAuthenticated, isAdmin(), async (req, res, next) => {
  if(!req.isAdmin) {
    return res.redirect('/')
  }
  return res.redirect('/lessons')

});

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Login route
app.get('/login', (req, res) => {
  if(req.user) {
    res.redirect('/lessons');
  } else {
    res.render('login.ejs',{title: "Login", user: req.user});
  }
});

app.listen(port, () => console.log(`Code Crush Crew listening on port ${port}!`));
