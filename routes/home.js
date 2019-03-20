var secrets = require('../config/secrets');

module.exports = function (router) {
	var homeRoute = router.route('/');
	homeRoute.get(function (req, res) {
		var connectionString = secrets.token;
		res.send('hello world');
		res.json({ message: 'My connection string is ' + connectionString });
	});
	return router;
}




