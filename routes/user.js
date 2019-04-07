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
	userRoute.put(async function (req, res) {
        //  handle query
        var id = req.params.id;
        var date = new Date();
        var params = {
            "name":req.query.name,
            "email":req.query.email,
            // "pendingTasks":JSON.parse(req.query.pendingTasks),
            "pendingTasks":req.query.pendingTasks,
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

        // invalid user id
        var user = await User.findById(id).catch(error=>{console.log(user);});
        if(user == null){
            res.status(400).send({
                    "message":"ERROR",
                    "data":"Invalid user id"
                });
                return router;
        } 
        // avoid same email
        users = await User.find({email:params['email']}).catch(err=>{console.log(err);});
        users.forEach(user=>{
            if(user._id.toString()!=id){
                res.status(400).send({
                    "message":"ERROR",
                    "data":"Invalid Email"
                });
                return router;
            }
        });

        // handle old pendingTasks
        // var user = await User.findById(id).catch(error=>{console.log(user);});
        var old_tasks = user.pendingTasks;


        old_tasks.forEach(async task=>{
            old_task = await Task.findByIdAndUpdate(task, {$set:{"assignedUser":'', "assignedUserName":"unassigned"}}).catch(err=>{console.log(err);});
        });

        // handle new pendingTasks (validation)
        var new_tasks = params.pendingTasks;
        var new_tasks_list = [];
        
        await Promise.all(new_tasks.map(async taskId=>{
            tasks = await Task.findById(taskId).catch(err=>{
                console.log(err);
            });
            return tasks;
        })).then(async tasks=>{
            console.log(tasks);
            await tasks.forEach(async task=>{
                if (task!=null){
                    console.log(task._id);
                    new_tasks_list.push(task._id);
                    //handle new pendingg tasks old users
                    var old_user = await User.findByIdAndUpdate(task.assignedUser,{$pull:{"pendingTasks":task._id}});
                }

            });
            params.pendingTasks = new_tasks_list;
        });

        // handle user
        var updated_user = await User.findByIdAndUpdate(id, params, {"new":true}).then(user=>{
            res.status(201).send({
                    "message":"OK",
                    "data": user
                });
        }).catch(err=>{console.log(err);});
        return router;

      
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