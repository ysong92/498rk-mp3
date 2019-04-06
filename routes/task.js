var secrets = require('../config/secrets');
var User = require('../models/user');
var Task = require('../models/task');

module.exports = function (router) {
    var taskRoute = router.route('/tasks/:id');
    var ret = {
    	"message":"OK",
    	"data":{}
    }
    // get
    taskRoute.get(async function (req, res) {
        //  handle query
        var id = req.params.id
        console.log(id);
     
        var promise = new Promise(function(resolve, reject){
            Task.findById(id, function(err, task) {
                if (err){
                    console.log("error;"+err);
                    ret.message = "ERROR";
                    ret.data = "Invalid task ID"
                    res.json(404, ret);
                    return router;
                }else{
                    resolve(task);  
                }  
            });
        });

        promise.then(function(task){
            console.log(task);
            if (task == null){
                throw new Error("Invalid task ID");
            }else{
                ret.data = task;
                ret.message = "OK"
                console.log(ret);
                res.json(200, ret);
                return router;
            }
            
        }).catch(function(err){
            if (err.message == "Invalid task ID"){
                ret.message = "ERROR";
                ret.data = "Invalid task ID"
                res.json(404, ret);
                return router;
            }
            else{
                ret.message = "ERROR";
                ret.data = "Server Bugs"
                res.json(404, ret);
                return router;

            }
           
        })
        return router;
	});

	// PUT
	taskRoute.put(async function (req, res) {
        //  handle query
        var id = req.params.id;
        var date = new Date();
        var params = {
            'name':req.query.name,
            "description":req.query.description,
            "deadline":req.query.deadline,
            "completed":req.query.completed,
            "assignedUser":req.query.assignedUser,
            "assignedUserName":req.query.assignedUserName,
            "dateCreated":date
        };
        if (typeof params.description === 'undefined'){params.description = '';}
        if(typeof params.completed === 'undefined'){params.completed = false;}
        if (typeof params.assignedUser === 'undefined'){params.assignedUser = '';}
        if(typeof params.assignedUserName === 'undefined'){params.assignedUserName = 'unassigned';}
        var old_task_id;
        var newuserid = req.query.assignedUser

        //validation
        if (typeof req.query.name === 'undefined' || typeof req.query.deadline === 'undefined'){
            ret.message = "ERROR";
            ret.data = "Undefined task name or deadline";
            res.json(500, ret);
            return router;
        }

        // update old assigned user
        let task = await Task.findById(id, (err, task)=>{
            if (err){console.log(err);}
            else {return task;}
        });
        var old_user_id = task.assignedUser;

        if (old_assigned_user!=""){
            var old_assigned_user = await User.findByIdAndUpdate(old_user_id.toString(), {$pull:{"pendingTasks":task._id}},(err, user)=>{
                if(err){console.log(err);}
                else{
                    console.log("old user tasks handled");
                    return user;
                }
            }).catch(err=>{console.log(err);});
        }
        else{var old_assigned_user = null}
        

        // update new assigned user

        if (typeof req.query.assignedUser === "undefined"){
            console.log("undefined new assignedUser, do nothing");
        }else{
            var new_assigned_user = await User.findByIdAndUpdate(params.assignedUser.toString(), {$addToSet:{"pendingTasks":task._id}}, (err, user)=>{
                if(err){console.log(err);}
                else{
                    console.log("new user tasks handled");
                    return user;
                }
            });
        }

        // update task
        if(new_assigned_user == null){
            console.log("new assigned user invalid");
            params.assignedUser = "";
            params.assignedUserName = "unassigned";
        }
        else{
            params.assignedUserName = new_assigned_user.name;
        }
        var updated_task = await Task.findByIdAndUpdate(id, params, (err, user)=>{
            if(err){
                console.log(err);
                ret.message = "ERROR";
                ret.data = "update failed because of server side error";
                res.json(500, ret);
                return router;
            }
            else{
                ret.data = "Task updated";
                ret.message = "OK";
                res.status(200).json(ret);
                
            }
        });
   
	});

	// DELETE
	taskRoute.delete(function (req, res) {
        //  handle query
        var id = req.params.id;
        console.log("id"+id);
        var new_tasks;
        var handle_user = new Promise(function(resolve, reject){
            Task.findById(id, function(err, task){
                console.log(task);
                if (task!=null){
                    
                    User.findById(task.assignedUser, function(err, user){
                        if (user){
                            new_tasks = user.pendingTasks.filter(function(value, index, arr){
                                return value!=id;
                            });
                            console.log(user.pendingTasks);
                        }
                       

                    }).then(res=>
                        User.findOneAndUpdate({"_id":task.assignedUser},{$set:{pendingTasks: new_tasks}}).exec()
                    )
                }
                resolve(task);
            }).then(task=>{
                
            }).catch(err=>{
                console.log(err);
            })

        });
        var promise = new Promise(function(resolve, reject){
            Task.findByIdAndRemove(id, function(err, task) {
                if (err){
                    console.log("error;"+err);
                    ret.message = "ERROR";
                    ret.data = "Invalid task ID"
                    res.json(404, ret);
                }else{
                    resolve(task);  
                }  
            });
        });

        handle_user.then(response=>{
            console.log("delete task from user");
        }).then(response=>{
            promise.then(function(task){
                ret.data = "task deleted";
                ret.message = "OK";
                console.log(ret);
                res.json(200, ret);
            }).catch(function(err){
                console.log("error;");
            });
        }).catch(err=>{
            console.log(err);
        })
	});
    return router;
}