var fs = require('fs');
var ejs = require('ejs');
var FeedSub = require('feedsub');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('Htlxj3_ltOUrapXCipppCQ');

var csvFile = fs.readFileSync('friends_list.csv','UTF-8');
var emailTemplate = fs.readFileSync('email_template.html', 'UTF-8');
var blogContent = new FeedSub('http://colin92.github.io/atom.xml', {
  emitOnStart: true
});

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

var ejs_emails = [];

function sendEmail(to_name,to_email,from_name,from_email,subject,msg_html){
  var message = {
      "html": msg_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({
    "message": message, 
    "async": async, 
    "ip_pool": ip_pool}, 
    function(result) {
      // console.log(message);
      // console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - 
      // No subaccount exists with the id 'customer-123'
  });
}

var latest_posts = [];
var last_week = new Date(Date.now());
last_week.setDate(last_week.getDate()-24);

blogContent.read(function(err, blogPosts) {
  blogPosts.forEach(function(post) {
    var blog_date = new Date(post['published']);
    if(blog_date.getTime() > last_week.getTime()) {
      latest_posts.push(post);
      console.log(latest_posts);
    }
  });
  csv_data.forEach(function(contact) {
    var rendered_email = ejs.render(emailTemplate, {
      first_name: contact['first_name'],
      months_since_contact: contact['months_since_contact'],
      latest_posts: latest_posts
    });
    sendEmail(contact['first_name'] + ' ' + contact['last_name'],
      contact['email_address'],
      'Colin Meret',
      'colinmeret@gmail.com',
      'My Fullstack Blog',
      rendered_email);

    ejs_emails.push(rendered_email);
    console.log(rendered_email);
  });
});


