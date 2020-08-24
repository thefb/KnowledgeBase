const express = require("express");
const pug = require("pug");
const path = require("path");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mongocon = require('dotenv').config();

//DBSetup
const uri = process.env.uri;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

//Check connection
db.once('open', () => { console.log('Connected to MongoDB') });

// CHeck db errors
db.on('error', (err) => { console.log(err) });

// Bring in Models
let Article = require('./models/article');

// Initialize app
const app = express();

// create jsonParser
app.use(bodyParser.json());

// create application/x-www-form-urlencoder parser
app.use(bodyParser.urlencoded({ extended: false }));

// Set public folders
app.use(express.static(path.join(__dirname, 'public')));

// load views Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Home route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err)
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    })
});

// Get single article
app.get('/article/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.log(err);
        } else {
            res.render('article', {
                article: article
            })
        }
    });
});

// Load edit form
app.get('/article/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.log(err);
        } else {
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            })
        }
    });
});
// Load edit form
app.get('/articles/add', (req, res) => {
    res.render('add_article', {
        title: 'Add Article'
    })
});

// Add submit post route
app.post('/articles/add', (req, res) => {
    const article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save((err) => {
        if (err) {
            console.log(err);
            return;
        } else {
            res.redirect('/');
        }

    })
});

// Edit submit post route
app.post('/article/edit/:id', (req, res) => {
    const article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    const query = { _id: req.params.id };


    Article.update(query, article, (err) => {
        if (err) {
            console.log(err);
            return;
        } else {
            res.redirect('/');
        }

    })
});

// Delete request
app.delete('/article/:id', (req, res) => {
    const query = { _id: req.params.id }
    Article.deleteOne(query, (err) => {
        if (err) {
            console.log(err)
        }
        res.send('Success');
    })
})

// Start server
app.listen(3000, () => {
    console.log("Running server at localhost:3000!")
});
