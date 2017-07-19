const express = require('express');
const redis = require('redis');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const sha256 = require('js-sha256');

const app = express();

const client = redis.createClient();

client.on("connect", (err) => {
	if(err != undefined)
		console.log("There was an error connecting to the databse: " + err);
});

app.engine('handlebars', exphbs({ defaultLayout : 'main'}));
app.set('view engine', 'handlebars');

require('./routes.js')(app);

app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

const port = 8080;
app.listen(port);
console.log('The server is running on port ' + port);

var data;

app.post("/logindetails", (req, res) => {
	var username = req.body.username;
	var password = sha256(req.body.password);

	if(!client.hgetall(username)) {
		res.render('noUser', {
			name : username
		});
	} else {
		client.hgetall(username, (err, data) => {
			if(err != undefined || data == null) {
				console.log(err);
			} else {
				if(data.password == password) {
					res.render("profile", {
						user: data
					});
				} else {
					res.end("Access Denied");
				}
			}
		});
	}
});

app.post("/signupdetails", (req, res) => {
	let username = req.body.username;
	let password = sha256(req.body.password);
	let first_name = req.body.first_name;
	let last_name = req.body.last_name;

	client.hmset(username, [
		'username', username,
		'password', password,
		'first_name', first_name,
		'last_name', last_name
	], (err, reply) => {
		if(err) {
			console.log(err);
		}
		console.log(reply);
		res.redirect("/");
	});
})













