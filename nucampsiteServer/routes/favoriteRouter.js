const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favorites => {
                if (favorites.campsites.length > 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.send("no favorites.");
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorites => {

                if (favorites) {
                    for (let i = 0; i < req.body.length; i++) {
                        if (favorites.campsites.indexOf(req.body[i]._id) === -1) {
                            favorites.campsites.push(req.body[i]._id);
                        } else {
                            console.log(`Campsite ${req.body[i]._id} is already in your favorites.`);
                        }
                    }
                    favorites.save()
                        .then(favorites => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            console.log('Favorite created', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndRemove({ user: req.user._id })
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.send('favorites have been removed.');
            })
    })

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorites => {
                if (favorites) {
                    if (favorites.campsites.includes(req.params.campsiteId)) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send('That campsite is already in your favorites.');
                    } else {
                        favorites.campsites.push(req.params.campsiteId);
                        favorites.save()
                            .then(favorites => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorites);
                            })
                    }
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            console.log('Favorite created', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorites => {
                if (favorites.campsites.includes(req.params.campsiteId)) {
                    favorites.campsites.remove(req.params.campsiteId);
                    favorites.save()
                        .then(favorites => {
                            console.log('Favorite campsite Deleted!', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'plain/text');
                    res.send('Campsite not found in your favorites.');
                }
            })
            .catch(err => next(err));
    })


module.exports = favoriteRouter;