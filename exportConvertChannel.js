require('dotenv').config();
var helpers = require('./helpers'),
    slack = require('@slack/client').WebClient,
    token = process.env.SLACK_USER_TOKEN,
    web = new slack(token),
    jsonfile = require('jsonfile'),
    colors = require('colors'),
    fs = require('fs'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    async = require('async');

/**
 * Finds the ID of the channel whose history is being exported, calls getChannelHistory on that channel
 * @param  {string} chanName - The name of the channel whose history is being exported
 */
function exportChannel(chanName) {
  var channelLookup = {};
  web.channels.list(function(err, info) {
    if (err) {
      console.log(err);
    } else {
      for (var i in info.channels) {
        channelLookup[info.channels[i].name] = info.channels[i].id;
      }
      if (!channelLookup[chanName]) {
        console.log("Specified channel does not exist.".red);
      } else {
        _getChannelHistory(chanName, channelLookup[chanName], 1000);
      }
    }
  });
}

/**
 * Converts messages in channel history to a JSON object, writes JSON object to a file, and calls convertToHtml on the array of messages
 * @param  {string} chanName - The name of the channel
 * @param  {string} channel - The ID of the channel
 * @param  {Integer} count - The number of messages to export
 */
function _getChannelHistory(chanName, channel, count) {

  var file = 'export-json/' + chanName + '.json',
      messageArray = [],
      userLookup = [],
      getChannelHistory = function() {
        this.get = function(callback) {
          var xhr = new XMLHttpRequest();
          var url = "https://slack.com/api/channels.history?token=" + token + "&channel=" + channel + "&count=" + count;
          xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
              callback(xhr.responseText);
            }
          }
          xhr.open("GET", url, true);
          xhr.send();
        }
      };

  async.waterfall([
    function(callback) {
      web.users.list(function(err, info) {
        if (err) {
          console.log(err);
        } else {
          for (var i in info.members) {
            userLookup[info.members[i].id] = info.members[i];
          }
          callback(null);
        }
      });
    },
    function(callback) {
      history = new getChannelHistory();
      history.get(function(response) {
        json = JSON.parse(response);
        json['messages'].forEach(function(message) {
          messageArray.unshift(message);
        });
        jsonfile.writeFile(file, messageArray, {spaces: 2, EOL: '\r\n'}, function(err) {
          if (err) {
            console.log(err);
          } else {
            helpers.convertToHtml(chanName, messageArray, userLookup, "exp");
            console.log("Channel history successfully archived.".green);
          }
        });
      });
      callback(null, 'done');
    }
  ], function (err, result) {
    if (err) {
      console.log(err);
    }
  });
}

module.exports.exportChannel = exportChannel;
