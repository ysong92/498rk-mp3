var secrets = require('../config/secrets');
var User = require('../models/user');

module.exports = function (router) {
    var userRoute = router.route('/users');
    var ret = {
    	"message":"OK",
    	"data":{}
    }
    // post
    userRoute.post(function (req, res){
        var date = new Date();
        var params = {
            'name':req.param('name'),
            "email":req.param('email'),
            "pendingTasks":req.param('pendingTasks'),
            "dateCreated":date,
        }

        //validation
        if (typeof params.name === 'undefined' || typeof params.email === 'undefined'){
            ret.message = "ERROR";
            ret.data = "Undefined user name or email";
            res.json(400, ret);
            return router;
        }

        // avoid same email
        var same_email_promise = new Promise(function(resolve, reject){
            User.findOne({email:params['email']}, function(err, users) {
                if (err){
                    ret.message = "ERROR";
                    ret.data = "DB Error";
                    res.json(500, ret);
                    return router;
                }else{
                    resolve(users);  
                }  
            });
        });

        //promie all
        same_email_promise.then(response => {
            if (response!==null){
                throw new Error("same_email");
            }
        }).then(response=>{
            //save new user
            var promise = new Promise(function(resolve, reject){
                var new_user = new User(params);
                new_user.save(function(err, new_user){
                    if (err) {
                        ret.message = "ERROR";
                        ret.data = "DB Error";
                        res.json(500, ret);
                        return router;
                    }
                    else{
                        resolve(new_user);
                        console.log("new user");
                    }
                });
            });
            promise.then(response => {
                ret.data = response;
                ret.message = "OK";
                res.status(201).json(ret);
                return router;
            });

        }).catch(function(err){
            console.log(err.message);
            if (err.message === "same_email"){
                ret.message = "ERROR";
                ret.data = "Used Email";
                res.status(400).json(ret);
                return router;
            }
            else{
                ret.message = "ERROR";
                ret.data = "Server Error";
                res.json(500, ret);
                return router;
            }
        });
    });

    userRoute.get(function (req, res) {
        //  handle query
        var filter = {}; 
        if("where" in req.query){
            var filter = JSON.parse(req.query.where);
        }
        
        var sort = {};
        if("sort" in req.query){
            var sort = JSON.parse(req.query.sort);
        }

        var select = {};
        if("select" in req.query){
            var select = JSON.parse(req.query.select);
        }
  
        var skip = 0;
        if("skip" in req.query){
            var skip = JSON.parse(req.query.skip);
        } 

        var limit = 0;
        if("limit" in req.query){
            var limit = JSON.parse(req.query.limit);
        }

        var count = false;
        if("count" in req.query){
            var count = JSON.parse(req.query.count);
        }

        // users get
        var promise = new Promise(function(resolve, reject){
            User.find(filter, function(err, users) {
                if (err){
                    console.log(err);
                    ret.message = "ERROR";
                    ret.data = "DB Error";
                    res.json(500, ret);
                    return router;
                }else{
                    resolve(users);  
                }  
            }).sort(sort).select(select).skip(skip).limit(limit);
        });

        promise.then(function(users){
            ret.data = users;
            if (count){
                ret.data = users.length;
            }
            ret.message = "OK";
            res.status(200).json(ret);
        }).catch(function(err){
            console.log(err);
            ret.message = "ERROR";
            ret.data = "Server Error";
            res.json(500, ret);
            return router;
            res.status(404).json("error");
        })
	});
    return router;
}

