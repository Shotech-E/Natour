const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// gLOBAL Middleware

//Set Scurity HTTP header
app.use(helmet());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Set limitation request from the API 
const limiter = rateLimit({
    max: 100,
    windows: 60 * 60 * 1000,
    message: 'Too many request from this IP, Please try again later in an hour!'
});
app.use('/api', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));

// Data sanitization against NOSQL  query injestion
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//prevent parameter polution
app.use(
    hpp({
        whiteList:['duration',
        'ratingsQuantity', 
        'ratingsAverage', 
        'maxGroupSize', 
        'difficulty', 
        'price']
    })
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) =>  {
//     console.log('Loading...');
//     next();
// });

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) ROUTES 
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// 4 Start the Server
module.exports = app;