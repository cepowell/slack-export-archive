require('dotenv').config();
var helpers = require('./helpers'),
    slack = require('@slack/client').WebClient,
    token = process.env.SLACK_USER_TOKEN,
    web = new slack(token),
    colors = require('colors'),
    jsonfile = require('jsonfile'),
    fs = require('fs'),
    async = require('async');

/**
 * @param  {string} channel - The name of the channel
 */
function convertSlackExport(channel) {
  _joinJSONFiles(channel);
}

/**
 * Joins all daily JSON files contained in the Slack export channel folder into one channel JSON file
 * @param  {string} channel - The name of the channel
 */
function _joinJSONFiles(channel) {
  var filesArray = [],
      messagesArray = [],
      users = [],
      file = 'convert-json/' + channel + '.json';

  async.waterfall([
    function(callback) {
      fs.readdirSync("slackExport/"+channel+'/').forEach(function(file) {
        filesArray.push("slackExport/"+channel+'/'+file);
      });
      callback(null);
    },
    function(callback) {
      fs.readFile('slackExport/users.json', 'utf8', function(err, data) {
        if (err) {
          console.log(err);
        } else {
          var usersJson = JSON.parse(data);
          for (var i in usersJson) {
            users[usersJson[i].id] = usersJson[i];
          }
          callback(null);
        }
      });
    },
    function(callback) {
      async.forEachOf(filesArray, function(value, key, callback) {
        console.log("Reading " + filesArray[key]);
        var contents = fs.readFileSync(filesArray[key], 'utf8');
        var messagesJson = JSON.parse(contents);
        messagesJson.forEach(function(message) {
          messagesArray.push(message);
        });
      });
      callback(null);
    },
    function(callback) {
      jsonfile.writeFile(file, messagesArray, {spaces: 2, EOL: '\r\n'}, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("JSON files successfully joined.".green);
        }
      });
      callback(null);
    },
    function(callback) {
      helpers.convertToHtml(channel, messagesArray, users, "conv");
      callback(null, 'done');
    }
  ], function (err, result) {
    if (err) {
      console.log(err);
    }
  });
}

module.exports.convertSlackExport = convertSlackExport;
