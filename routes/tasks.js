var secrets = require('../config/secrets');
var Task = require('../models/task');
var User = require('../models/user');

module.exports = function (router) {
    var userRoute = router.route('/tasks');
    var ret = {
    	"message":"OK",
    	"data":{}
    }

    // POST: toddo: unassigned 
    userRoute.post(async function (req, res){
        var old_user;
        var date = new Date();
        var params = {
            'name':req.param('name'),
            "description":req.param('description'),
            "deadline":req.param('deadline'),
            "completed":req.param('completed'),
            "assignedUser":req.param('assignedUser'),
            "assignedUserName":req.param('assignedUserName'),
            "dateCreated":date
        }
            
        //validation
        if (typeof params.name === 'undefined' || typeof params.deadline === 'undefined'){
            ret.message = "ERROR";
            ret.data = "Undefined task name or deadline";
            res.json(400, ret);
            return router;
        }

        //update assignedUserName if assignedUser
        console.log(params);
        var assigned_user = await User.findById(params.assignedUser).then(async user=>  {
            if(user == null){
                //invalid assigneduser
                params.assignedUser = "";
                params.assignedUserName = "unassigned"
            }else{
                //valid assigned User
                params.assignedUserName = user.name;
                console.log(params);
                //push new task to user pending task
            }
        }).catch(err=>{console.log(err);});

        // handle new task
        console.log(params);
        var new_task = await new Task(params);
        new_task.save().then(async new_task=>{
            if (new_task.assignedUser!=""){
                var user = await User.findByIdAndUpdate(params.assignedUser, {$push:{"pendingTasks":new_task._id}}).catch(err=>{console.log(err);});
            }
            return new_task;
        }).then((new_task)=>{
            res.status(201).send({
                "message":"OK",
                "data":new_task
            });
        });
    });

    // GET
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

       
        var promise = new Promise(function(resolve, reject){
            Task.find(filter, function(err, tasks) {
                if (err){
                    console.log("error;"+err);
                }else{
                    resolve(tasks);  
                }  
            }).sort(sort).select(select).skip(skip).limit(limit);
        });


        promise.then(function(tasks){
            ret.data = tasks;
            if (count){
                ret.data = tasks.length;
            }
            res.json(200, ret);

        }).catch(function(err){
            console.log("error;");
        })
	});

    return router;
}