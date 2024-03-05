const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'})
const app =  require('./app');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1)
});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
// .connect(process.env.DATABASE_LOCAL,{
.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then(() => console.log('DB connection established')).catch(err => console.log('ERROR'));
// .then(con => {
//     console.log(con.connections);
//     console.log('DB connection established')
// });
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`)
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLER REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
});