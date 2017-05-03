'use strict';

let DATABASE = process.env.ELYSIUM_DATABASE;
if(!DATABASE) throw new Error("ELYSIUM_DATABASE variable not set!");

let USER = process.env.ELYSIUM_USER;
if(!USER) throw new Error("ELYSIUM_USER variable not set!");

let PASSWORD = process.env.ELYSIUM_PASSWORD;
if(!PASSWORD) throw new Error("ELYSIUM_PASSWORD variable not set!");

var Sequelize = require('sequelize');
var sequelize = new Sequelize(DATABASE, USER, PASSWORD);

loadModels(sequelize);

function loadModels(instance) {
  let realmStatus = require('./models/realm_status');
  realmStatus.load(instance);
}
