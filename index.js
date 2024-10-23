require('dotenv').config();

var cors = require('cors')

const express = require('express');
const app = express();
const port = 3000
const mongoose = require("mongoose");
const Listing = require("./modules/listings.js");
const biding = require("./modules/biding.js");
const Users = require("./modules/user.js");
const Notify = require("./modules/notification.js");

const Admins= require("./modules/admin.js");
//advertize//
const Ads = require("./modules/ads.js");
//
const path = require("path");
const methodoverride = require("method-override");
const engine = require('ejs-mate');
const { register } = require('module');
var cookieParser = require('cookie-parser')
const multer  = require('multer')
const {storage}=require("./cloudConfig.js")
const upload = multer({ storage })
const session=require("express-session")
const wrapAsync=require("./utils/wrapAsyc.js")
const ExpressError=require("./utils/ExpressError.js");
const listRoute=require("./routers/indexrouter.js");
const { receiveMessageOnPort } = require('worker_threads');
const flash=require("connect-flash");



const passport=require("passport")
const localstrategy=require("passport-local")
const {isLoggedIn}=require("./middleware.js");
const { error } = require('console');


main().then(() => {
  console.log("connected to database");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/marketplace');



  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodoverride("_method"));
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());
app.use(cors())
mongoose.set('strictPopulate', false)
const sessionOption={
  secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}

app.use(session(sessionOption));
app.use(flash());



app.use((req,res,next)=>{
  res.locals.msg=req.flash("success");
  res.locals.error=req.flash("error");
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localstrategy(Users.authenticate()));

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.use("/",listRoute)
//create notify clientside
app.get("/notify",wrapAsync(async(req,res)=>{

let data= await Notify.find({receiver:{$in:["admin"]}}).then((data)=>{
  console.log(data);
 let time=data[0].createAt.toString().slice(0,10);
 console.log(time);
  res.render("notify.ejs",{data,time});
});
}));

//delete notify adminside

app.get("/notify/delete/:id", wrapAsync(async (req,res)=>{
  let id=req.params.id;
  console.log(id)
  let del= await Notify.findByIdAndDelete(id).then((data)=>{
    console.log(data)
  })
  res.redirect("/notify");
}))




//bids form
app.get("/bids/:id/:productuser", isLoggedIn,(req, res) => {
  let { id, productuser } = req.params;
  let productuserdata = Users.findById(productuser).then((prouser) => {
    console.log(prouser)
    res.render("bid.ejs", { id: id,  prouser: prouser,})

  })
  // console.log(id+""+name)
  // res.render("bid.ejs",{id:id,name:name,userid:userid})
})

app.get('/logout', function(req, res, next) {
  req.logout(function(req,err) {
    if (err) { 
      console.log(req.user);

      return next(err);
      
     }
     res.redirect("/show");
  });
});

//login form...

app.get("/login", (req, res) => {
  res.render("login.ejs")
})


app.post("/login",passport.authenticate("local",{ failureRedirect:"/login",failureFlash:true}),wrapAsync(async (req, res) => {


  let { username, password } = req.body;
  console.log(username + "" + password)

  let info;
  let admin1 = await Users.find({ username: username ,role:"Admin"}).then((data) => {
    console.log(data)
    //new added
    if (data == "") {
      let user = Users.find({ username: username, role:"User" }).then((data) => {
        console.log(data)
        d = data[0];
        console.log(d)
        if (data == "") {
          res.send("not register please register after login")
        }
        if(d.status=="Block"){
          req.flash("error","THIS USER IS BLOCKKED");
           return res.redirect("/login");
        }
        res.cookie("data", d).redirect("/show");


      })
    }
    else {
      let d = data[0];
      res.cookie("data", d).redirect("/show");

    }
  })








  //  let user=await Users.find({emailid:emailid,password:password}).then((data)=>{
  //   console.log(data)
  //   d=data[0];
  //   console.log(d)
  //   if(data==""){
  //     res.send("not register please register after login")
  //   }
  //     res.cookie("data",d).redirect("/show");


  // })

}));

//register form...
app.get("/resis", (req, res) => {
  res.render("register.ejs")
})

//register.....

app.post("/resister",wrapAsync(async (req, res) => {
// console.log(req.file.filename+","+req.file.path)
// let filename=req.file.filename;
// let url=req.file.path;
try {
  
  let {name,emailid,password}= req.body;
  console.log(name+","+emailid+","+password)
  // console.log(User)
  let newuser = new Users({emailid,username:name})

  let registereUser= await Users.register(newuser,`${password}`)
  console.log("this is register user...."+registereUser);

  newuser.save().then((data) => {
    console.log("this is id" + data._id)
    id = data._id;
  });

  req.login(registereUser, function(err) {
  if (err) { return next(err); }
   req.flash("success","welcome to reviveMart");
   return res.redirect("/show");
});

} catch (error) {
  req.flash("error",error.message);
  res.redirect("/resis");
}

  

  // // newuser.image.push({url,filename});
  // let id;
  // newuser.save().then((data) => {
  //   console.log("this is id" + data._id)
  //   id = data._id;
  // });

  // let list = await Listing.find({});
  // //console.log(list)

  // let a;
  // Users.findById(id).then((data) => {
  //   console.log("this is user" + data);
  //   req.flash("success","welcome to reviveMart");

  //   req.session.data= data._id;
  //   res.cookie("data", data).redirect("/show");
  //   // res.redirect("/show")
  //   // res.render("home.ejs",{list,data})
  // })
  // // let newListing= new Listing({...req.body.listing})
  // // newListing.save();

  // //res.redirect("/show")

}))
// jyare routes kaam n kare tyare niche nu comments hatai levi //..........................................................
// //form new add 
// app.get("/add/:id", wrapAsync(async(req, res) => {
//   let { id } = req.params;
//   console.log(id)
//   res.render("profile.ejs", { id });
// }))

// ///add new listings
// app.post('/index/:id',upload.single('listing[image]'), wrapAsync(async (req, res) => {
// console.log(req.file.filename+","+req.file.path)
// let filename=req.file.filename;
// let url=req.file.path;
//   let id = req.params.id;
//   let d;
//   let user;
//   let User = await Users.findById(id).then((data) => {
//     d = data;
//    user=data.name;
//   })

//   let newListing = new Listing({ ...req.body.listing, User })
//   //newListing.save();
//   newListing.image.push({url,filename})
//   newListing.User.push(d)
//   newListing.save();

//    let notification=Notify.insertMany({
//     receiver:"admin",
//     message:`${user} add new please check in`
//    })

//   res.redirect(`/add/${id}`);
// }))
// //delete products

// app.get("/delete/:id", wrapAsync(async (req,res)=>{
//   let id=req.params.id;
//   console.log(id)
//   let del= await Listing.findByIdAndDelete(id).then((data)=>{
//     console.log(data)
//   })
//   res.send("delete for this item");
// }))

// //edit product
// app.get("/edit/:id", wrapAsync(async (req,res)=>{
//   let id=req.params.id;
//   await Listing.findById(id).then((data)=>{
//     console.log(data)
//     res.render("edit.ejs",{data})
//   })
// }))

// //UPDATE

// app.post('/update/:id',upload.single('listing[image]'), wrapAsync(async (req, res) => {
//   console.log(req.file.filename+","+req.file.path)
//   let filename=req.file.filename;
//   let url=req.file.path;
//     let id = req.params.id;
//     let d;
    
  
//     let newListing =  await Listing.findByIdAndUpdate(id,{ ...req.body.listing}).then((data)=>{
      
//       console.log("this is data"+data.image[0].id)
      
//     })
//    Listing.findById(id).then((data)=>{
//     console.log(data);
//    data.image[0]={url,filename};
//    data.save();
  
//   });
  
// res.redirect(`/edit/${id}`)
    
//   }))
//...............................ahi sudhi hatavi comments kaam n kare to j routes ok........................................
//home page
app.get('/show', wrapAsync(async (req, res) => {

console.log("this sesssion id....."+req.session.data)
  // let data = (req.cookies.data)
  // console.log(data)

  //advertize
  let ads;
  if(req.session.item){
     let adss=Ads.find({productname:req.session.item}).then((data)=>{
      console.log(data)
      ads=data
     })
    //res.locals.item =  req.session.item;
  }
  else{
    req.session.item="null";
    ads=[];
}
  console.log("this is item"+req.session.item)
 // res.locals.item=req.session.item;
  //advertize ahi sudhi
//   id = data._id;
// console.log("this is idddddddddd"+id)

  let list = await Listing.find({ status: "Approve"});
  console.log(list)
  // console.log(data)
  
//   let admin1 = await Users.find({ _id: id ,role:"Admin"}).then((d) => {
//     if (d != "") {
//       data = d[0]
//       console.log("this is datassssssssssssssssssssssssssssssssssssssssss")
//       console.log(data)
//       let isAdmin = "true";
//       res.render("home.ejs", { list, data, isAdmin,ads})//{list})
//  }
//  else{
//   console.log("this is testing datas..................")
//   console.log(data)
//   let isAdmin = "false"
  // let newListing= new Listing({...req.body.listing})
  // newListing.save();
  
  console.log(ads)
  let data=req.user;
  console.log(data);
  if(data==undefined){
    
    data=null
  }
  res.render("home.ejs", { list, data,ads })//{list})
 }
  

// console.log(data)
//   let isAdmin = "false"
//   // let newListing= new Listing({...req.body.listing})
//   // newListing.save();
//   res.render("home.ejs", { list, data, isAdmin })//{list})
))

//show page
app.get('/listings/:id', wrapAsync(async (req, res) => {
  
let bidings;
  let { id } = req.params;
  let listing = await Listing.findById(id);
  console.log(listing)
  let bids = await biding.find({ "Productid": id }).populate("Productid").then((bid) => {
    console.log("this is bids")
    bidings=bid;
  })
  let user = await Listing.findById(id).populate("User").then((data) => {
    console.log("userrrrrrrr" + data)
    let name=data.name;
    console.log("pppppp"+name);
    //let ads=Ads.find({productname:name}).then((data)=>{
      //console.log("user ads data.................."+data)
      req.session.item=name;
    //})
     //let item=data.image[0].url;
     //req.session.item=item;
     
    //  res.json(listing)
    res.render("show.ejs", { listing, data ,bidings})

  });

  // console.log(listing.bidings)

  // let newListing= new Listing({...req.body.listing})
  // newListing.save();
}));

///bidings
app.post("/listings/bidings/:id",isLoggedIn, wrapAsync(async (req, res) => {
  let userid = req.user._id;

  let d;
  let info;
  // let User = Users.findById(req.params.userid).then((data) => {
    d = req.user;
  // })
  let listing = await Listing.findById(req.params.id).then((ListingData)=>{
info=ListingData;
  })
  let id = req.params.id
  let bidings = req.body;
  let newbidings = new biding(bidings, d,listing);
  newbidings.User.push(d);
  newbidings.Productid=info;

  console.log(newbidings)
  // listing.bidings.push(newbidings);
  await newbidings.save()
  // await listing.save()
  res.redirect(`/listings/${id}`)
}))


// PROFILE..................................................................................................................................

app.get("/user/products",isLoggedIn,wrapAsync(async (req, res) => {
  let userid = req.user._id;
  let product = Listing.find({ "User": userid }).then((data) => {
    console.log(data)
    res.render("product.ejs", { userid, data })
  })
}));

app.get("/user/mybids",isLoggedIn,wrapAsync(async (req, res) => {
  let userid = req.user._id;
  let user;
    Users.findById(userid).then((users)=>{
      console.log(users)
      user=users
    });
  let bids = await biding.find({ "User": userid }).populate("Productid")
  .then((bid) => {
    console.log(bid);
    
    res.render("mybid.ejs", { bid,user })

  })


}))
//show bids
app.get("/showbids/:id",isLoggedIn,wrapAsync(async(req,res)=>{
  let {id}=req.params;
  let listing = await biding.find({"Productid":id }).populate("Productid").then((data)=>{
    console.log(data)
    res.render("showbids.ejs",{data})
  });
}))

app.get("/user/general", wrapAsync( async(req, res) => {
  let id=req.user._id;
  await Users.findById(id).then((data)=>{
  console.log(data)
  res.render("general.ejs",{data})
  })
  
}))


// upload image
app.post('/upload',upload.single('image'), wrapAsync(async (req, res) => {
  console.log(req.file.filename+","+req.file.path)
  let filename=req.file.filename;
  let url=req.file.path;
    let id = req.user._id;
    
    
  
    let newListing =  await Users.findByIdAndUpdate(id)

    newListing.image={url,filename}
  newListing.save()
res.redirect(`/user/general`)    
  }))

// new


app.get("/new", isLoggedIn,wrapAsync((req, res) => {
  res.render("index.ejs")
}))


//admin panle
app.get("/admin", wrapAsync(async (req, res) => {
  
    res.render("adminprofile.ejs")
  }));


app.get("/products",isLoggedIn,wrapAsync( async (req, res) => {
  
  let product = await Listing.find().populate("User").then((data) => {
    console.log(data)
    res.render("admin.ejs", {data})
  });

}))

app.put("/approve/:_id",isLoggedIn, wrapAsync(async (req, res) => {
  let { _id } = req.params;
  
  console.log(_id)
  let product = await Listing.findByIdAndUpdate(_id, { status: "Approve" }).then((data) => {
    console.log(data)
    res.redirect(`/products`)
  })

}))
app.put("/reject/:_id/",isLoggedIn, wrapAsync(async (req, res) => {
  let { _id } = req.params;
  console.log(_id)
  let product = await Listing.findByIdAndUpdate(_id, { status: "Reject" }).then((data) => {
    console.log(data)
    res.redirect(`/products`)
  })

}))

//user data for admin side
app.get("/userdata", isLoggedIn,wrapAsync(async(req,res)=>{
  let user= await Users.find().then((data)=>{
    console.log(data)
    res.render("users.ejs",{data})
  })
}))


//block user and user all listings for admin
app.put("/block/:_id/", isLoggedIn,wrapAsync(async (req, res) => {
  let {_id} = req.params;
  console.log(_id)
  let product = await Users.findByIdAndUpdate(_id, { status: "Block" }).then((data) => {
    let bids = Listing.findOneAndUpdate({ "User": _id },{status:"block"}).then((bid) => {
      console.log(bid);  
    })
    console.log(data)
    res.redirect("/userdata")
  })

}))


//advertize router ///////////////////////////////

app.get("/newads",wrapAsync((req,res)=>{
  res.render("ads.ejs");
}))

app.post("/ads",upload.single('image'),wrapAsync((req,res)=>{
  let{productname,price,description,productid}=req.body;
  console.log(productname+price+description+productid)

  console.log(req.file.filename+","+req.file.path)
  let filename=req.file.filename;
  let url=req.file.path;
 let newads = new Ads({productname,price,description,productid})
  newads.image.push({url,filename});
  newads.save()
  res.send("ads...")
}))





app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"somethig went wrong please try again"))
})

app.use((err,req,res,next)=>{
  let {statusCode=500,message="somethings went wrong"}=err;
  res.status(statusCode).send(message);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})