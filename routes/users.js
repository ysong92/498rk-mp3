var secrets = require('../config/secrets');
var User = require('../models/user');
var Task = require('../models/task');

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
            "pendingTasks":JSON.parse(req.query.pendingTasks),
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

        // handle tasks
        var promises = [];
        valid_tasks_id = [];
        console.log(params.pendingTasks);
        for (var i = 0; i<params.pendingTasks.length;i++){
            console.log(params.pendingTasks[i])
            new_p = new Promise(function(resolve, reject){
                Task.findById(params.pendingTasks[i], function(err, task){
                    if (err){
                        console.log(params.pendingTasks[i]);
                    }
                    else{
                        console.log(task);
                        if(task!=null){valid_tasks_id.push(task._id);}
                        resolve(task);
                    }
                }).catch(err=>{});
            });
            promises.push(new_p);
        }

        Promise.all(promises).then(tasks=>{

            params.pendingTasks = valid_tasks_id;
            console.log(params.pendingTasks);
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
                promise.then(user => {
                    let updatedTasks = user.pendingTasks.map(
                        task=>
                            Task.findOneAndUpdate({"_id":task},{$set:{assignedUser: user.id, assignedUserName: user.name}}).exec()
                    );
                    Promise.all(updatedTasks).then((response)=>{
                            ret.data = user;
                            ret.message = "OK";
                            res.status(201).json(ret);
                            return router;
                    });
                    
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

