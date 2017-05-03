'use strict';

let Sequelize = require('sequelize');
let _ = Sequelize.Utils._;

function logErrors(results) {
  console.log("*****************************************");
  _.forEach(results, function(value, key) {
   console.log("key: ",key,"\tvalue: ",value);
  });
  console.log("Message: ",results.message());
  console.log("Value: ",results.value());
  console.log("SQL: ",results.sql);
  console.log("*****************************************");
}

module.exports = {
  load: function(database) {
    var RealmStatus = database.define('realm_status', {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      population: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      horde: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      alliance: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      }
    }, {
      version: true,
      indexes: [{
        unique: true,
        fields: ['name', 'timestamp']
      }],
      validate: {
        totalPopulation: function() {
          let recordString = JSON.stringify(this);
          if(this.horde + this.alliance > 100) {
            throw new Error("Total faction ratio cannot exceed 100%. ("+recordString+")");
          }
        }
      }
    });

    return database.sync({force: true})
      .then(function() {
        //TODO: Load data from database file into MySQL via Sequelize
        /****************/
        let NOW = new Date(2017, 5, 3).getTime();
        let data = [
          {name: "Andorhol", population: 1234, horde: 51, alliance: 50, timestamp: NOW},
          {name: "Zeth'kur", population: 700, horde: 45, alliance: 55, timestamp: NOW},
          {name: "Elysium", population: 9000, horde: 55, alliance: 45, timestamp: NOW},
          {name: "Darrowshire", population: 1200, horde: 50, alliance: 50, timestamp: NOW},
          {name: "New Realm", population: 1200, horde: 50, alliance: 50, timestamp: NOW}
        ];
        return Sequelize.Promise.map(data, function(entry) {
          return RealmStatus.findOrCreate({
            where: {
              name: entry.name,
              timestamp: entry.timestamp
            },
            defaults: entry
          });
        });
      })
      .then(_.noop, logErrors);
  }
};
