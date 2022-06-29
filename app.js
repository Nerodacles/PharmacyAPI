var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var express = require('express');
var database = require('./db/conn');
const bodyParser= require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var healthRouter = require('./routes/health');

var swaggerJsDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openai: '1.0.0',
    securityDefinitions: {
      BasicAuth: {
        type: 'basic',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'API-Key',
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
          {url: 'https://pharmacy.jmcv.codes/health', description: 'HealthCkeck'}
        ],
      }
    },
    apis: [`${__dirname}/routes/api.js`, path.join(process.cwd(), '/routes/health.js')]
}

var swaggerDocs = swaggerJsDoc(swaggerOptions);

var app = express();

const PORT = process.env.PORT || 8087;

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
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/health', healthRouter);
app.use(express.static("api"));

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set headers 
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, API-Key');

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use((req, res, next) => {
  const apiKey = req.get('API-Key')
  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({error: 'unauthorised'})
  } else {
    next()
  }
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));

module.exports = app;
