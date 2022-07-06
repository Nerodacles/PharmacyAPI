var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var express = require('express');
const helmet = require("helmet");
var database = require('./db/conn');
const bodyParser= require('body-parser')
const rateLimit = require("express-rate-limit");

var swaggerJsDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');

var {unless} = require('express-unless');
var users = require('./controllers/userController.js');
const auth = require('./helpers/jwt.js');
const errors = require('./helpers/errorHandlers.js');

// Routers
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var healthRouter = require('./routes/health');

const swaggerOptions = {
  swaggerDefinition: {
    openai: '1.0.0',
    securityDefinitions: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'authorization',
      },
      ApiKeyDef: {
        type: 'apiKey',
        in: 'header',
        name: 'api-key',
      },
    },
    info: {
      title: 'Pharmacy API',
      version: '1.0.0',
      description: 'API Documentation for Pharmacy App',
      license: {
        name: 'MIT',
        url: 'https://choosealicense.com/licenses/mit/',
      },
      contact: {
        name: 'Juanma Canahuate',
        email: 'juanma@jmcv.codes',
        url: 'https://links.jmcv.codes',
      },
      servers: 
        [
          {url: 'https://pharmacy.jmcv.codes/api', description: 'Production'},
          {url: 'https://pharmacy.jmcv.codes/health', description: 'HealthCkeck'},
          {url: 'https://pharmacy.jmcv.codes/users', description: 'Users'},
        ],
      }
    },
    apis: [`${__dirname}/routes/api.js`, `${__dirname}/routes/health.js`, `${__dirname}/controllers/userController.js`],
}

var swaggerDocs = swaggerJsDoc(swaggerOptions);

var app = express();
app.use(helmet());
app.disable('x-powered-by');

const PORT = process.env.PORT || 8087;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30 // limit each IP to 100 requests per windowMs
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', users);
app.use("/api/", limiter);
app.use('/api', apiRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/health', healthRouter);
app.use(express.static("api"));


// middleware for authenticating token submitted with requests
auth.authenticateToken.unless = unless;
app.use(auth.authenticateToken.unless({
  path: [
    { url: '/users/login', methods: ['POST']},
    { url: '/users/register', methods: ['POST']},
  ]
}))

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set headers 
  res.header('Access-Control-Allow-Origin', 'https://pharmacy.jmcv.codes');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization, API-Key');

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use((req, res, next) => {
  const token = req.headers.authorization || req.headers['API-Key'];
  if (!token) {
    res.status(401).json({error: 'unauthorised'})
  } else {
    next()
  }
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));

module.exports = app;
