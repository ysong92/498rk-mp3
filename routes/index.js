/*
 * Connect all of your endpoints together here.
 */
module.exports = function (app, router) {
    app.use('/api', require('./home.js')(router));
    app.use('/api/users', require('./users.js')(router));
    app.use('/api/users/:id', require('./user.js')(router));
    app.use('/api/tasks', require('./tasks.js')(router));
    app.use('/api/tasks/:id', require('./task.js')(router));
 //    app.use(express.json());       // to support JSON-encoded bodies
	// app.use(express.urlencoded()); // to support URL-encoded bodies

    // connect to db
	var mongoose = require('mongoose');
	const uri = "mongodb+srv://ysong92:Sasuke007@cluster0-yk3a8.mongodb.net/498rk-mp3";
	mongoose.connect(uri, { useNewUrlParser: true });
	var db = mongoose.connection;
	mongoose.set('useFindAndModify', false);
	// console.log(db);
};

	
