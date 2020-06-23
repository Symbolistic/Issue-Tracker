/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
let mongoose = require('mongoose');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const Schema = mongoose.Schema;

const issueSchema = new Schema({
  project: {type: String},
  issue_title: {type: String, required: true}, 
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  assigned_to: String,
  status_text: String,
  open: {type: Boolean, default: true}
  }, {
  timestamps: {
    createdAt: 'created_on',
    updatedAt: 'updated_on'
  },                                              
});

const Issue = mongoose.model("Issue", issueSchema);

// Establish Connection to Database
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      console.log(req.query)
      Issue.find({...req.params, ...req.query}, function (err, data) {
            if(err) throw err;
            res.send(data);
        })
    })
    
    .post(function (req, res){
      var project = req.params.project;
      
      const {issue_title, 
             issue_text, 
             created_by,
             assigned_to,
             status_text
            } = req.body;

      
      const newIssue = new Issue({
             project,
             issue_title, 
             issue_text, 
             created_by,
             assigned_to,
             status_text,
             created_on: new Date(),
             updated_on: new Date(),
             open: true
      });
    
      newIssue.save((err, result) => {    
        if (err) {
          console.log("Error" + err)
          res.status(400).send("No data");
        }
        res.json(result);
    });
  })
    
    .put(function (req, res){
      var project = req.params.project;
      const {issue_title, 
             issue_text, 
             created_by,
             assigned_to,
             status_text,
             open
            } = req.body;
      
    
      let params = {issue_title, issue_text, created_by, assigned_to, status_text, open};
    
      for (let prop in params) {
        if (!params[prop]){
          delete params[prop];
        }
      };
    
    if (Object.keys(params).length < 1) {
      res.send("No updated field sent");
    } else {
        Issue.findByIdAndUpdate(req.body._id, params, {useFindAndModify: false}, function(err,result){
          if (err) {
            console.log("Error: " + err);
            res.send(`Could not update ${req.body._id}`);
          } else {   
          res.send("Successfully updated");
          }
        })
       }
  })
    
    .delete(function (req, res){
      var project = req.params.project;
      const id = req.body._id;
      console.log(req.body)
      if (!id) {
        res.send("_id Error")
      } else {
        Issue.findByIdAndDelete(id, (err, result) => {
          if(err) {
            console.log(err)
            res.send(`Could not delete ${id}`);
          } else {
            console.log("Deleted")
            res.send(`Deleted ${id}`);
          }
        })
      }  
    })
    
};
