var fs = require('fs'),
    colors = require('colors'),
    async = require('async');

/**
 * Converts array of messages to an HTML string and writes HTML string to an HTML file
 * @param  {string} chanName - The name of the channel
 * @param  {Object} messages - Array containing channel's messages
 */
function convertToHtml(chanName, messages, users, flag) {
  var htmlString = "",
      stylesheet = "<style> * { font-family:sans-serif;} body { text-align:center; padding:1em; } .messages { width:100%; max-width:700px; text-align:left; display:inline-block; }" +
                  ".messages img { background-color:rgb(248,244,240); width:36px; height:36px; border-radius:0.2em; display:inline-block; vertical-align:top; margin-right:0.65em; }" +
                  ".messages .time { display:inline-block; color:rgb(200,200,200); margin-left:0.5em; } .messages .username { display:inline-block; font-weight:600; line-height:1; }" +
                  ".messages .message { display:inline-block; vertical-align:top; line-height:1; width:calc(100% - 3em); } .messages .message .msg { line-height:1.5; }</style>";

  htmlString = htmlString.concat("<html><body>", stylesheet);

  async.waterfall([
    function(callback) {
      async.forEachOf(messages, function(value, key, callback) {
        var name = users[messages[key].user].profile.display_name || users[messages[key].user].real_name,
            src = users[messages[key].user].profile.image_72,
            text = messages[key].text,
            result = text.replace(/<@U([0-9]|[A-Z]){8}>/gi, name),
            match = result.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi),
            links = "";
        if (match) {
          for (var i in match) {
            links += "<a href='" + match[i] + "'>" + match[i] + "</a></br>";
          }
        }
        htmlString = htmlString.concat("<div class='messages'><img src='", src, "'/><div class='message'><div class='username'>", name, "</div><div class='time'>", new Date(messages[key].ts * 1000), "</div> <div class='msg'>", result, "</div><div>", links, "</div></div><br/><br/>");
      });
      callback(null);
    },
    function(callback) {
      var htmlFile = "";
      if (flag == 'conv') {
        htmlFile = "convert-html/"+chanName+".html";
      }
      else {
        htmlFile = "export-html/"+chanName+".html";
      }
      fs.writeFile(htmlFile, htmlString, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("HTML file successfully generated.".green);
          callback(null, 'done');
        }
      });
    }
  ], function (err, result) {
    if (err) {
      console.log(err);
    }
  });
}

module.exports.convertToHtml = convertToHtml;
