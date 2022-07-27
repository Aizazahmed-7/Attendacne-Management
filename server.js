//jshint esversion: 6
const express = require("express");
const app = express();
const date = require(__dirname + "/date.js");
const bodyParser = require("body-parser");
app.set('view engine', 'ejs');
var mongoose = require('mongoose');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.connect("mongodb://localhost:27017/userDB");

const day = date.getDate();

userSchema = {
  name: String,
  url: String,
  password: String,
  presence: [{
    date: String,
    present: String
  }]
}

adminSchema = {

  name: String,
  password: String,
  leaves: [{
    name: String,
    date: String
  }]
}

const Admin = mongoose.model("Admin", adminSchema);
const User = mongoose.model("User", userSchema);


// const admin = new Admin({
//   name:"admin",
//   password:"1234"
// });
//
// admin.save();
let admin;

Admin.findOne({
  name: "admin",
  password: "1234"
}, function(err, data) {

  if (err) {
    console.log("err");
  } else {
    admin = data;
  }


});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});


let username;
let pass;
let url;

app.post("/", function(req, res) {

  username = req.body.username;
  pass = req.body.password;

  console.log(username, pass);
  User.find({
    name: username,
    password: pass
  }, function(err, user) {
    if (err) {
      console.log(err);
    } else {

      if (user.length === 0) {
        res.send("Incoreect email or password");
      } else {

        if (user[0].name == username && user[0].password == pass) {
          url = user[0].url;
          res.redirect("/user")
        }
      }
    }
  })
});

let user;

app.get("/user", function(req, res) {

  User.find({
    name: username,
    password: pass
  }, function(err, data) {
    user = data;
    console.log(data[0].presence.length);

    res.render("user", {
      username: username,
      user: data[0]
    });

  })
});




app.post("/user", function(req, res) {

  const itemname = day;
  const x = req.body.list;

  if (x === "L") {

    console.log("Requested leave");
    let tempobj = {
      name: username,
      date: day
    }
    admin.leaves.push(tempobj);
    admin.save();
  } else {

    let obj = {
      date: day,
      present: x
    }

    if (user[0].presence.length == 0) {
      user[0].presence.push(obj);
      user[0].save();
    } else {
      if (user[0].presence[user[0].presence.length - 1].date == day) {
        // alert("already marked");
      } else {
        user[0].presence.push(obj);
        user[0].save();
      }
    }
  }
  res.redirect("/user");

});

app.get("/dp", function(req, res) {

  res.render("db");

})
app.post("/dp", function(req, res) {

  let tempurl = req.body.dpurl;
  User.updateOne({
    name: username,
    password: pass
  }, {
    url: tempurl
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("updated");
    }
  });
  redirect("/user");
});

app.get("/adminlogin", function(req, res) {
  res.render("adminlogin");

});

let admin_username;
let admin_pass

app.post("/adminlogin", function(req, res) {
  admin_username = req.body.username;
  admin_pass = req.body.password;

  console.log(admin_username, admin_pass);
  if (admin.name == admin_username && admin.password == admin_pass) {
    console.log("sucessfully signed in admin ");
    res.redirect("/adminhome");
  } else {
    console.log("wrong admin password ");
  }
});

app.get("/adminhome", function(req, res) {
  User.find({}, function(err, data) {
    if (err) {
      console.log(err);
    } else {

      res.render("adminhome", {
        user: data
      });
    }
  });
});

let removebtn;
app.post("/adminhome",function(req,res){

removebtn=req.body.removebtn;
// User.findOne({name:req.body.removebtn},function(err,data){
//
//
// res.render("userrecord",{
//   user:data
// });
//
// });
res.redirect("/userrecord")
});

app.get("/userrecord",function(req,res){
  User.findOne({name:removebtn},function(err,data){


  res.render("userrecord",{
    user:data
  });

  });

});

app.post("/userrecord",function(req,res){



if(req.body.searchbtn==null){
  User.findOne({name:removebtn},function(err,data){

if(data.presence[req.body.changebtn].present=="A"){
  data.presence[req.body.changebtn].present="P";
} else{
  data.presence[req.body.changebtn].present="A"
}

data.save();
  res.redirect("/userrecord");

  });
} else{

console.log(req.body.To,req.body.From);

  User.findOne({name:removebtn},function(err,data){res.render("searchuserrecord",{
    todate:req.body.To,
    fromdate:req.body.From,
    user:data
  });});

}
});


app.get("/Adduser", function(req, res) {
  res.render("adduser");

});

app.post("/Adduser", function(req, res) {

  const newuser = new User({
    name: req.body.username,
    password: req.body.password,
    url: req.body.URL
  });

  newuser.save();

  res.redirect("/adminhome");

});

app.get("/Removeuser", function(req, res) {


  User.find({}, function(err, data) {
    if (err) {
      console.log(err);
    } else {

      res.render("removeuser", {
        user: data
      });
    }
  })

});


app.post("/Removeuser",function(req,res){
User.findOneAndRemove({name:req.body.removebtn}, function(err){
  if(err){
  console.log(err);
}else{
  console.log("removed sucessfully");
}
});
res.redirect("/Removeuser");

});


app.get("/leaverequest",function(req,res){
res.render("leaverequest",{
  admin:admin
});

});


app.post("/leaverequest",function(req,res){
  if(req.body.reject == null){
    console.log("good scene");
    User.findOne({name:req.body.accept},function(err,data){
      if(err){
        console.log(err);
      }else{

        let obj1 = {
          date: day,
          present: "L"
        }
        data.presence.push(obj1);
        data.save();
      }
    });
    for(let i=0 ;i<admin.leaves.length;i++){
      if(admin.leaves[i].name==req.body.accept){
        admin.leaves.splice(i,1);
      }
    }
    admin.save();
  }
  else{
    for(let i=0 ;i<admin.leaves.length;i++){
      if(admin.leaves[i].name==req.body.reject){
        admin.leaves.splice(i,1);
      }
    }
admin.save();
  }
  res.redirect("/leaverequest");
});




app.listen(3000, function() {
  console.log("server started on port 3000")
});
