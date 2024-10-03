const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adsSchema = new Schema({
    productname: {
      type:String,
    },
    price: {
        type:Number,
      },
      
      description: {
        type:String,

      },
      productid: {
        type:String,

      },
 image: [{
        url:String,
        filename:String
}],
   });
  
module.exports= mongoose.model("Ads", adsSchema);
