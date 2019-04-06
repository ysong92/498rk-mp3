var secrets = require('../config/secrets');
var User = require('../models/user');
var Task = require('../models/task');

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
        var promise = new Promise(function(resolve, reject){
            User.findById(id, function(err, user) {
                if (err){
                    ret.message = "ERROR";
                    ret.data = "Invalid user ID"
                    res.json(404, ret);
                    return router;
                }else{
                    resolve(user);  
                }  
            });
        });

        promise.then(function(user){
            if (user === null){
                ret.message = "ERROR";
                ret.data = "Invalid user ID"
                res.json(404, ret);
                return router;
            }
            else{
                ret.data = user;
                ret.message = "OK";
                res.json(200, ret);
            }
        }).catch(function(err){
            console.log(err);
            ret.message = "ERROR";
            ret.data = "Server Error";
            res.json(500, ret);
            return router;
        })
	});

	// PUT
	userRoute.put(function (req, res) {
        //  handle query
        var id = req.params.id;
        var date = new Date();
        var params = {
            "name":req.query.name,
            "email":req.query.email,
            "pendingTasks":JSON.parse(req.query.pendingTasks),
            "dateCreated":date
        };

        var user_name;

        //validation
        if (typeof params.name === 'undefined' || typeof params.email === 'undefined'){
            ret.message = "ERROR";
            ret.data = "Undefined user name or email";
            res.json(400, ret);
            return router;
        }
        if (typeof params.pendingTasks === 'undefined'){
            params.pendingTasks = [];
        }
        
        // avoid same email
        var same_email_promise = new Promise(function(resolve, reject){
            User.find({email:params['email']}, function(err, users) {
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
        same_email_promise.then(responses => {
            responses.forEach(function(user){
                if (user._id.toString()!=id){
                    console.log(user._id.toString(), id);
                    throw new Error("same_email");
                }
            })
            if (responses.length == 0){throw new Error("invalid_user");}

        }).then(res=>{
            //set old tasks to unassigned
            Task.updateMany({"assignedUser":id}, {"assignedUser":'', "assignedUserName":"unassigned"}).exec();
        }).then(response=>{
            var promise = new Promise(function(resolve, reject){
                User.findOneAndReplace({"_id":id}, params, function(err, user) {
                    if (err) {
                        ret.message = "ERROR";
                        ret.data = "DB Error";
                        res.json(500, ret);
                        return router;
                    }
                    else{
                        user_name = user.name;
                        resolve(user);
                    }
                });
            });
            promise.then(user=>{
                Task.updateMany({"_id":{$in:params.pendingTasks}}, {$set:{"assignedUser":id, "assignedUserName":user_name}}).exec();
            }).then(response => {
                ret.data = "User Updated";
                ret.message = "OK";
                res.status(201).json(ret);
                return router;
            }).catch(function(err){console.log(err);})

        }).catch(function(err){
            if (err.message == "same_email"){
                ret.message = "ERROR";
                ret.data = "Used Email";
                res.status(400).json(ret);
                return router;
            }else if(err.message == "invalid_user"){
                ret.message = "ERROR";
                ret.data = "Invalid User ID";
                res.status(404).json(ret);
                return router;
            }else{
                ret.message = "ERROR";
                ret.data = "Server Error";
                res.json(500, ret);
                return router;
            }
        });
	});

	// DELETE
	userRoute.delete(function (req, res) {
        //  handle query
        var id = req.params.id

        var handle_tasks = new Promise(function(resolve, reject){
            Task.updateMany({"assignedUser":id}, {"assignedUser":"", "assignedUserName":"unassigned"}, function(err,tasks){
                if (err){
                    console.log(err);
                    ret.message = "ERROR";
                    ret.data = "Invalid user ID"
                    res.json(404, ret);
                }else{
                    resolve(tasks);  
                } 
            })
        });
        var promise = new Promise(function(resolve, reject){
            User.findByIdAndRemove(id, function(err, user) {
                if (err){
                    console.log(err);
                    ret.message = "ERROR";
                    ret.data = "Invalid user ID"
                    res.json(404, ret);
                }else{
                    resolve(user);  
                }  
            });
        });

        handle_tasks.then(response=>{
            console.log("update tasks to unassigned");
        }).then(response=>{
            promise.then(function(user){
                ret.data = "User deleted";
                ret.message = "OK";
                res.json(200, ret);
            }).catch(function(err){
                console.log(err);
                ret.message = "ERROR";
                ret.data = "Server Error";
                res.json(500, ret);
            });
        }).catch(function(err){
            console.log(err);
            ret.message = "ERROR";
            ret.data = "Server Error";
            res.json(500, ret);
        });
	});
    return router;
}