const express = require('express');
const home = express.Router();
const HomeController = require('../controller/home')


home.get('/', HomeController.GetHome);
home.get('/webhook', HomeController.GetWebhook);
home.post('/webhook', HomeController.PostWebhook);
home.get('/leads', HomeController.GetLeads);


module.exports = home ;