var colors = require('colors');
var ExportConvertChannel = require('./exportConvertChannel');
var ConvertSlackExport = require('./convertSlackExport');

try {
  if (!process.argv[2]) {
    console.log("Please specify if you want to export a channel or convert an existing Slack export.".red);
  } else if (process.argv[2] !== 'convert' && process.argv[2] !== 'export') {
    console.log("Please specify if you want to export a channel or convert an existing Slack export.".red);
  } else if (process.argv[2] == 'export' && !process.argv[3]) {
    console.log("Please specify a channel.".red)
  } else if (process.argv[2] == 'convert' && !process.argv[3]) {
    console.log("Please specify a channel.".red)
  } else if (process.argv[2] == 'export' && process.argv[3]){
    ExportConvertChannel.exportChannel(process.argv[3]);
  } else if (process.argv[2] == 'convert' && process.argv[3]){
    ConvertSlackExport.convertSlackExport(process.argv[3]);
  } else {
    console.log("Sorry, that's not a recognized option. Please try again.".red)
  }
}
catch(err) {
  console.log(err);
}
