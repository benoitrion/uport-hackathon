var express = require('express');
var app = express();
var path = require("path");

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname+'/public/main.html'));

});

app.get('/test', function(request, response) {
    response.sendFile(path.join(__dirname+'/public/NotSoSimpleStorage.html'));
});

app.get('/test2', function(request, response) {
    response.sendFile(path.join(__dirname+'/public/test2.html'));
});

app.get('/patient', function(request, response) {
    response.sendFile(path.join(__dirname+'/public/patient_view.html'));
});

app.get('/professional', function(request, response) {
    response.sendFile(path.join(__dirname+'/public/professional_view.html'));
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
