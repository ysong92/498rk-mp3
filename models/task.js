// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var TaskSchema = new mongoose.Schema({
    "name" : String,
	"description" : { type: String, default: "" },
	"deadline" : Date,
	"completed" : { type: Boolean, default: false },
	"assignedUser" : { type: String, default: "" },
	"assignedUserName" : { type: String, default: "unassigned" },
	"dateCreated" : { type: Date, default: Date.now },
});

// Export the Mongoose model
module.exports = mongoose.model('task', TaskSchema, "tasks");