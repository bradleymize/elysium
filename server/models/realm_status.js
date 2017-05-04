'use strict';

let DATABASE_FILE = process.env.ELYSIUM_DATABASE_FILE;
if(!DATABASE_FILE) throw new Error("ELYSIUM_DATABASE_FILE variable not set!");

var flatfile = require('flat-file-db');
var db = flatfile.sync(DATABASE_FILE);

let Sequelize = require('sequelize');
let _ = Sequelize.Utils._;

function logErrors(results) {
  //skips insertion errors and continues with loading
  console.log("*****************************************");
  console.error(results.message);
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
          let record = this;
          if(this.horde + this.alliance > 100) {
            let message = "Total faction ratio cannot exceed 100%. Attempted to insert:\n"+record.dump();
            throw new Error(message);
          }
        }
      }
    });

    return database.sync({force: true})
      .then(function() {
        let keys = db.keys();
        let data = [];
        _.each(keys, function(key) {
          let entry = db.get(key);
          let ana = entry.Anathema || {};
          let dar = entry.Darrowshire || {};
          let ely = entry.Elysium || {};
          let zet = entry.ZethKur || {};
          data.push({name: "Anathema"   , population: ana.population || 0, horde: ana.horde || 0, alliance: ana.alliance || 0, timestamp: Number(key)});
          data.push({name: "Darrowshire", population: dar.population || 0, horde: dar.horde || 0, alliance: dar.alliance || 0, timestamp: Number(key)});
          data.push({name: "Elysium"    , population: ely.population || 0, horde: ely.horde || 0, alliance: ely.alliance || 0, timestamp: Number(key)});
          data.push({name: "Zeth'Kur"   , population: zet.population || 0, horde: zet.horde || 0, alliance: zet.alliance || 0, timestamp: Number(key)});
        });
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
