'use strict';

let DATABASE = process.env.ELYSIUM_DATABASE;
if(!DATABASE) throw new Error("ELYSIUM_DATABASE variable not set!");

let USER = process.env.ELYSIUM_USER;
if(!USER) throw new Error("ELYSIUM_USER variable not set!");

let PASSWORD = process.env.ELYSIUM_PASSWORD;
if(!PASSWORD) throw new Error("ELYSIUM_PASSWORD variable not set!");

var Sequelize = require('sequelize');
let _ = Sequelize.Utils._;
var sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
  define: {
    instanceMethods: {
      dump: function(padding) {
        let record = this;
        let props = _.keys(record.rawAttributes);
        let pad = _.padStart('', padding || 2);
        let values = [];
        _.each(props, function(prop) {
          let value = record.getDataValue(prop) || null;
          if(value && typeof value.toISOString === 'function') {
            value = value.toISOString();
          }
          values.push(pad + prop + ": " + value);
        });
        return "(\n" + values.join(",\n") + "\n)";
      }
    }
  }
});

loadModels(sequelize);

function loadModels(instance) {
  //TODO: Add flag to control database import or not
  //TODO: Add flag to control dropping and recreating the database
  let realmStatus = require('./models/realm_status');
  realmStatus.load(instance);
}
