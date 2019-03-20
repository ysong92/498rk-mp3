var secrets = require('../config/secrets');
var User = require('../models/user');

module.exports = function (router) {
    var userRoute = router.route('/users/:id');
    var ret = {
    	"message":"OK",
    	"data":{}
    }
    // get
    userRoute.get(function (req, res) {
        //  handle query
        var id = req.params.id
        console.log(id);
     
        var promise = new Promise(function(resolve, reject){
            User.findById(id, function(err, user) {
                if (err){
                    console.log("error;"+err);
                    ret.message = "ERROR";
                    ret.data = "Invalid user ID"
                    res.json(404, ret);
                }else{
                    resolve(user);  
                }  
            });
        });

        promise.then(function(user){
            ret.data = user;
            // if (count){
            //     ret.data = users.length;
            // }
            console.log(ret);
            res.json(200, ret);
            // res.send(ret); 

        }).catch(function(err){
            console.log("error;");
        })
	});

	// PUT
	userRoute.put(function (req, res) {
        //  handle query
        var id = req.params.id
		// var update_user = {
		// 	"name"
		// }     
		console.log(req.query);
        var promise = new Promise(function(resolve, reject){
            User.findByIdAndUpdate(id, req.query, function(err, user) {
                if (err){
                    console.log("error;"+err);
                    ret.message = "ERROR";
                    ret.data = "Invalid user ID"
                    res.json(404, ret);
                }else{
                    resolve(user);  
                }  
            });
        });

        promise.then(function(user){
            ret.data = "User updated";
            ret.message = "OK";
            
            console.log(ret);
            res.json(200, ret);
            // res.send(ret); 

        }).catch(function(err){
            console.log("error;");
        })
	});

	// DELETE
	userRoute.delete(function (req, res) {
        //  handle query
        var id = req.params.id
        var promise = new Promise(function(resolve, reject){
            User.findByIdAndRemove(id, function(err, user) {
                if (err){
                    console.log("error;"+err);
                    ret.message = "ERROR";
                    ret.data = "Invalid user ID"
                    res.json(404, ret);
                }else{
                    resolve(user);  
                }  
            });
        });

        promise.then(function(user){
            ret.data = "User deleted";
            ret.message = "OK";
            
            console.log(ret);
            res.json(200, ret);
            // res.send(ret); 

        }).catch(function(err){
            console.log("error;");
        })
	});
    return router;
}