var express = require('express'),
	app = express(),
	port = +process.env.PORT || 8080
	bodyParser = require('body-parser')
	methodOverride = require('method-override'),
	repogit = require('./route/routes.js'),





app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride('X-HTTP-Method-Override'))

app.use('/repogit', repogit)
app.listen(port, function() {console.log("Server listening on port" + port)});
