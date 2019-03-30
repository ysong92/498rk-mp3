var secrets = require('../config/secrets');
var Task = require('../models/task');

module.exports = function (router) {
    var taskRoute = router.route('/tasks/:id');
    var ret = {
    	"message":"OK",
    	"data":{}
    }
    // get
    taskRoute.get(function (req, res) {
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
	taskRoute.put(function (req, res) {
        //  handle query
        var id = req.params.id
        console.log(req.query);
        //validation
        if (typeof req.query.name === 'undefined' || typeof req.query.deadline === 'undefined'){
            ret.message = "ERROR";
            ret.data = "Undefined task name or deadline";
            res.json(500, ret);
            return router;
        }
        var promise = new Promise(function(resolve, reject){
            Task.findByIdAndUpdate(id, req.query, function(err, task) {
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
            ret.data = "Task updated";
            ret.message = "OK";
            res.json(200, ret);
        }).catch(function(err){
            console.log("error;");
        })
	});

	// DELETE
	taskRoute.delete(function (req, res) {
        //  handle query
        var id = req.params.id
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

        promise.then(function(task){
            ret.data = "task deleted";
            ret.message = "OK";
            console.log(ret);
            res.json(200, ret);

        }).catch(function(err){
            console.log("error;");
        })
	});
    return router;
}