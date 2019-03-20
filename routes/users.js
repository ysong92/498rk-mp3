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
        var new_user = new User(params);
        new_user.save(function(err, new_user){
            if (err) {console.log(err);}
            else{res.json(201, new_user);}
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
                    console.log("error;"+err);
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
            console.log(ret);
            res.json(200, ret);
            // res.send(ret); 

        }).catch(function(err){
            console.log("error;");
        })
	});
    return router;
}

