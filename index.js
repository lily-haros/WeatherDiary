// essential imports and requirements
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const { body, check, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
require('dotenv').config();
const path = require("path");
const moment = require('moment');
const Note = require("./models/Note");
const { post } = require('./routes/notes.js');
const { validateId } = require('./middleware/validators');
const app = express();
const ObjectId = mongoose.Types.ObjectId;


// middlewares and configuration
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use("", require("./routes/notes.js"));
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, "views/partials")
}));
app.use(express.json());
app.set('view engine', 'handlebars');

const routes = require('./routes/notes');


// DB connections

const dbURI = process.env.dbURI;

const client = new MongoClient(dbURI, { useNewUrlParser: true });

(async () => {
    try {
        await mongoose.connect(dbURI);
        console.log("Database connected");
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server up and running. Listening port ${PORT}`));
    } catch (error) {
        console.log(error); // change this later to log in file
    }
})();

// Frontpage

app.get('/', async (req, res) => {
    const weatherInfo = {};
    const UserNotesEmpty = {};

    res.render('index',
        {
            pagetitle: "WeatherDiary",
            desc: "At this website, you can view historical weather data for Helsinki and add your own personal notes regarding specific dates. Please note that the weather data from today and the past couple of days may be missing due to delays. We retrieve our weather information from the Open Meteo API. At the bottom of this page, you can enter your own comments. To begin, please select a date between January 1, 2000, and today. Once you have chosen your preferred date, click on the 'View' button.",
            weatherDetails: weatherInfo,
            UserNotes: UserNotesEmpty,
        });

});

// to upload frontpage again with date

app.post('/', body('date').notEmpty(), async (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        console.log(req.body.date);
        const UserNotes = await Note.find({ date: req.body.date });
        const dateInput = await req.body.date;

        fetch('https://archive-api.open-meteo.com/v1/archive?latitude=60.17&longitude=24.94&start_date=' + dateInput + '&end_date=' + dateInput + '&daily=temperature_2m_mean,sunrise,sunset,precipitation_sum,windspeed_10m_max&timezone=Europe%2FMoscow&windspeed_unit=ms')
            .then((response) => response.json())
            .then((data) => {

                weatherInfo = {

                    temperature: data.daily.temperature_2m_mean.toString() + " °C",
                    sunrise: data.daily.sunrise.toString().replace("T", " "),
                    sunset: data.daily.sunset.toString().replace("T", " "),
                    precipitation: data.daily.precipitation_sum.toString() + " mm",
                    windspeed: data.daily.windspeed_10m_max.toString() + " m/s",
                };

                res.render('index',
                    {
                        pagetitle: "WeatherDiary",
                        desc: "At this website, you can view historical weather data for Helsinki and add your own personal notes regarding specific dates. Please note that the weather data from today and the past couple of days may be missing due to delays. We retrieve our weather information from the Open Meteo API. At the bottom of this page, you can enter your own comments. To begin, please select a date between January 1, 2000, and today. Once you have chosen your preferred date, click on the 'View' button.",
                        UserNotes: UserNotes.map(usernote => usernote.toJSON()),
                        weatherDetails: weatherInfo,
                        Date: showChosenDay(dateInput),
                    });

            });
    }
    else {
        const weatherInfo = {};
        const UserNotesEmpty = {};

        res.render('index',
            {
                pagetitle: "WeatherDiary",
                desc: "At this website, you can view historical weather data for Helsinki and add your own personal notes regarding specific dates. Please note that the weather data from today and the past couple of days may be missing due to delays. We retrieve our weather information from the Open Meteo API. At the bottom of this page, you can enter your own comments. To begin, please select a date between January 1, 2000, and today. Once you have chosen your preferred date, click on the 'View' button.",
                weatherDetails: weatherInfo,
                UserNotes: UserNotesEmpty,
            });
    }

});

// Search TOMI


app.post('/api/notes/', (req, res, next) => {
    const startDate = moment(req.query.startDate, 'YYYY-MM-DD').toDate();
    const endDate = moment(req.query.endDate, 'YYYY-MM-DD').toDate();

    client.connect((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to connect to database');
        }

        const db = client.db('UserNotes');
        const collection = db.collection('notes');

        collection.find({
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        }).toArray((err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Failed to fetch data from database');
            }

            res.json(data);
        });
    });
});

// CREATE note

app.post("/api/notes/", async (req, res) => {

    try {
        const formattedDate = useChosenDay(req.body.dateToAdd);
        const newNote = new Note({
            date: formattedDate,
            temperature: req.body.temperature,
            comment: req.body.comment
        });
        await newNote.save();
        res.redirect("/");
    }

    catch (error) {
        res.status(500).json({ msg: error.message });
    }
})


// Error 

app.use(function (req, res, next) {
    res.status(404).render('404', { pagetitle: '404 Error' });
});

/* const btn = document.getElementById('btn');

btn.addEventListener('click', function handleClick() {
  const dateInput = document.getElementById('date');

  if (!dateInput.value) {
    alert("Pleace pick a date.");
    //break;
  } 

}); */

function showChosenDay(date) {

    let MyDate = date;
    //console.log(MyDate);

    // slicing the date, to show in right format
    let year = String(MyDate).slice(0, 4);
    //console.log(year);
    let month = String(MyDate).slice(5, 7);
    //console.log(month);
    let day = String(MyDate).slice(8, 10);
    //console.log(day);
    let formatDate = day + "." + month + "." + year;
    //console.log(formatDate);
    return formatDate;
}

function useChosenDay(date) {
    let MyDate = date;
    //console.log(MyDate);
    // slicing the date, to show in right format
    let year = String(MyDate).slice(6, 10);
    //console.log(year);
    let month = String(MyDate).slice(3, 5);
    //console.log(month);
    let day = String(MyDate).slice(0, 2);
    //console.log(day);
    let formatDate = year + "-" + month + "-" + day;
    //console.log(formatDate);
    return formatDate;
}



