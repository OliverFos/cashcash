var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');



var app = express();


/* GET home page. */
const session = require('express-session');
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true

}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/', indexRouter);
app.use('/users', usersRouter);

const testRouter = require('./routes/test');
app.use('/test',testRouter);

const affecterVisiteRouter = require('./routes/affecterVisite');
app.use('/affecterVisite',affecterVisiteRouter);

const rechClientRouter = require('./routes/rechClient');
app.use('/rechClient',rechClientRouter);

const modifClientRouter = require('./routes/modifClient');
app.use('/modifClient',modifClientRouter);

const ajouterTechRouter = require('./routes/ajouterTech');
app.use('/ajouterTech',ajouterTechRouter);

const creerInterRouter = require('./routes/creerInter');
app.use('/creerInter',creerInterRouter);

const loginRouter = require('./routes/login');
app.use('/login',loginRouter);

const rechInterventionRouter = require('./routes/RechIntervention.js');
app.use('/rechIntervention',rechInterventionRouter);

const modifInterventionRouter = require('./routes/modifIntervention.js');
app.use('/modifIntervention',modifInterventionRouter);

const ajouterMatRouter = require('./routes/ajouterMat.js');
app.use('/ajouterMat',ajouterMatRouter);

const selectMatRouter = require('./routes/selectMat.js');
app.use('/selectMat',selectMatRouter);

const consultInterRouter = require('./routes/consultInter.js');
app.use('/consultInter',consultInterRouter);

const validerInterRouter = require('./routes/validerInter.js');
app.use('/validerInter',validerInterRouter);

const genererPdf = require('./routes/genererPdf.js');
app.use('/genererPdf',genererPdf);

const modifMatRouter = require('./routes/modifMat.js');
app.use('/modifMat', modifMatRouter);

const afficherStatsRouter = require('./routes/afficherStats.js');
app.use('/afficherStats', afficherStatsRouter);

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
