'use strict';
let DButilsAzure = require('../../DButils');
var User = require('../models/user');
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());
let secret = "thisIsASecret";

exports.register = function (req, res) {
    DButilsAzure.execQuery("INSERT INTO Users (userName, password, firstName, lastName, country, city, email)\n" +
        "VALUES (" + req.body.userName + "," + req.body.password + "," + req.body.firstName + "," + req.body.lastName + "," +
        req.body.country + "," + req.body.city + "," + req.body.email + ")")
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
};

exports.login = function (req, res) {
    DButilsAzure.execQuery("SELECT * FROM Users \n" +
        "WHERE (userName = '" + req.body.userName+"') AND (password = '" + req.body.password+"')")
        .then(function (result) {
            if(result.length === 1) {
                let payload = {name: req.body.userName};
                let options = {expiresIn: "1d"};
                const token = jwt.sign(payload, secret, options);
                res.send(token);
            }
            else{
                res.status(400).send("Invalid username or password")
            }
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
};

exports.verifyAnswer = function (req, res) {
    DButilsAzure.execQuery("SELECT * FROM UsersQuestions WHERE (userName='"+req.body.userName+ "') AND" +
        "(firstQuestion='"+req.body.firstQuestion + "') AND (firstAnswer='"+req.body.firstAnswer+"')")
        .then(function (result) {
            if (result == 0) {
                console.log(result);
                res.send("Incorrect answer. Please try again");
            }
            else{
                console.log(result);
                DButilsAzure.execQuery("SELECT password FROM Users WHERE (userName='"+req.body.userName+"')")
                    .then(function (pass) {
                        res.send(pass);
                    })
            }
        })
};


exports.getUserInterests = function (req, res) {
    let userName = auth(req, res)
    DButilsAzure.execQuery("SELECT firstInterest, secondInterest FROM UsersInterests\n" +
        "WHERE (userName = '" + userName+"')")
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
};

exports.getUserFavorites = function (req, res) {
    let userName = auth(req, res)
    DButilsAzure.execQuery("SELECT * FROM POI u\n" +
        "JOIN UsersFavoritePOI " +
        "ON poiName = point " +
        "WHERE (userName='"+userName+"')")
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
};

exports.list_all_tasks = function (req, res) {
    res.send("TEST");
};

function auth(req, res){
    const token = req.header("x-auth-token");
    if (!token) res.status(400).send("Access denied. No token provided.");
    try {
        req.decoded = jwt.verify(token, secret);
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
    return req.decoded.name;
}