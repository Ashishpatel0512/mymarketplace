const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
       name: {
      type:String,
       },
       emailid: {
        type:String,
      },
      status: {
        type:String,
        default:"Active"

      },
      role: {
        type:String,
        default:"User"
      },
      image: 
        {
        url:{
          type:String,
        default:"https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-High-Quality-Image.png"
        },
        filename:{
           type:String,
        default:"image.png"
        }
        }
}
 );

 userSchema.plugin(passportLocalMongoose);

  
module.exports= mongoose.model("Users", userSchema);
