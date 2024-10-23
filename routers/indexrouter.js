const express = require('express');
const router=express.Router();
require('dotenv').config();



const mongoose = require("mongoose");
const Listing = require("../modules/listings.js");
const biding = require("../modules/biding.js");
const Users = require("../modules/user.js");
const Notify = require("../modules/notification.js");
const {isLoggedIn}=require("../middleware.js")


//
const methodoverride = require("method-override");
const engine = require('ejs-mate');
const { register } = require('module');
var cookieParser = require('cookie-parser')
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({ storage })
const session=require("express-session")
const wrapAsync=require("../utils/wrapAsyc.js")
const ExpressError=require("../utils/ExpressError.js");
const { receiveMessageOnPort } = require('worker_threads');
const flash=require("connect-flash");

// const { error, clear } = require('console');
// // const {listingSchema}=require("./schema.js")
// const wrapAsync=require("./utility/wrapasync.js")
// const ExpressError=require("./utility/error.js");
// const reviews= require("./models/review.js");


 
//form new add 
router.get("/add",wrapAsync(async(req, res) => {
    
    res.render("profile.ejs");
  }))
  
  ///add new listings
  router.post('/index',upload.single('listing[image]'), wrapAsync(async (req, res) => {
  console.log(req.file.filename+","+req.file.path)
  let filename=req.file.filename;
  let url=req.file.path;
    let id = req.user._id;
    let d;
    let user;
    let User = await Users.findById(id).then((data) => {
      d = data;
     user=data.name;
    })
  
    let newListing = new Listing({ ...req.body.listing, User })
    newListing.image.push({url,filename})
    newListing.User.push(d)
    newListing.save();
  
     let notification=Notify.insertMany({
      receiver:"admin",
      message:`${user} add new please check in`
     })
     req.flash("success","new listing Add SuccessFully");
    
    res.redirect(`/user/products`);
  }))
  //delete products
  
  router.get("/delete/:id",isLoggedIn,wrapAsync(async (req,res)=>{
    let id=req.params.id;
    console.log(id)
    let del= await Listing.findByIdAndDelete(id).then((data)=>{
      console.log(data)
    })

    res.redirect("/user/products")
  }))
  
  //edit product
  router.get("/edit/:id",isLoggedIn, wrapAsync(async (req,res)=>{
    let id=req.params.id;
    await Listing.findById(id).then((data)=>{
      console.log(data)
      res.render("edit.ejs",{data})
    })
  }))
  
  //UPDATE
  
  router.post('/update/:id',upload.single('listing[image]'), wrapAsync(async (req, res) => {
    console.log(req.file.filename+","+req.file.path)
    let filename=req.file.filename;
    let url=req.file.path;
      let id = req.params.id;
      let d;
      
    
      let newListing =  await Listing.findByIdAndUpdate(id,{ ...req.body.listing}).then((data)=>{
        
        console.log("this is data"+data.image[0].id)
        
      })
     Listing.findById(id).then((data)=>{
      console.log(data);
     data.image[0]={url,filename};
     data.save();
    
    });
    req.flash("success","update listing SuccessFully");
  res.redirect("/user/products")
      
    }))

    
module.exports=router;