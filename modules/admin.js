const express = require('express')
//  const app = express()
//  const port = 3000
const mongoose=require ("mongoose");
const Schema = mongoose.Schema;

// main().then(()=>{
//   console.log("connected to database");
// }).catch(err => console.log(err));

// async function main() {
// await mongoose.connect('mongodb://127.0.0.1:27017/marketplace');
// }




const userSchema = new Schema({
    name: {
      type:String,
    },
   emailid: {
        type:String,
      },
      password: {
        type:String,
      },
   });
  

   module.exports= mongoose.model("Admins", userSchema);


  //  app.get("/",(req,res)=>{

  //   let admin1=new Admins({
  //       name:"Ashish",
  //       emailid:"anpatel0512@gmail.com",
  //       password:"anpatel@"
  //   })
// admin1.save();
// res.send("hello")
//    })


  //  app.listen(port, () => {
  //   console.log(`Example app listening on port ${port}`)
  // })

