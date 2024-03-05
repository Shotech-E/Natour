const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({path:'./config.env'})

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
.then(() => console.log('DB connection established'));

// READ JSON FILES
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'));

// IMPORT DATA INTO DATABASE
const importData = async () => {
    try{
        await Tour.create(tours);
        console.log('Data successfully created');
        
    } catch (err){
        console.log(err);
    }
    process.exit();
}

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted')
    } catch (err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] == '--import'){
    importData();
} else if (process.argv[2] == '--delete') {
    deleteData();
}