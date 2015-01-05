var fs = require('fs');

var csvFile = fs.readFileSync('friends_list.csv','UTF-8');
var emailTemplate = fs.readFileSync('email_template.html', 'UTF-8');

function csvParse(csvData) {
  var parsed_data;
  var csv_lines = csvData.split('\n');
  var contact_info_list = [];
  for(i in csv_lines.slice(1,csv_lines.length-1)) {
    var contact = {};
    for(x in csv_lines[0].split(',')) {
      var csv_column = csv_lines[0].split(',')[x]
      .replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      contact[csv_column] = csv_lines.slice(1)[i].split(',')[x];
    }
    contact_info_list.push(contact);
  }
  return contact_info_list;
}


var csv_data = csvParse(csvFile);
console.log(csv_data);

csv_data.forEach(function(row) {
  var email_to_send = emailTemplate;
  
  email_to_send = email_to_send.replace(/[A-Z]+[A-Z_{1}]+/g, function(match) {
    return row[match.toLowerCase()];
  });

  console.log(email_to_send);

});

