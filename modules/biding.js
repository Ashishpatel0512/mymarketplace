const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bidingSchema = new Schema({
    // name: {
    //   type:String,
    // },
    bidamount: {
  type:Number,

    },
  
    message: {
        type:String,
      },
      buyer: {
        type:String,
      },
    contact: {
        type:String,
      },
    createAt:{
        type:Date,
        default:Date.now()
    },
   
        seller: {
          type:String,
        },
        
    User:[{
      type:Schema.Types.ObjectId,
      ref:"Users"
    }]
    ,Productid:{
      type:Schema.Types.ObjectId,
      ref:"Listing"
    },
  });
  
module.exports= mongoose.model("biding", bidingSchema);
