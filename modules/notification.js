const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notifySchema = new Schema({
    receiver: {
      type:String,
    },
   message: {
        type:String,
      },
      createAt:{
        type:Date,
        default:Date.now()
    
    }
}
 );
  
module.exports= mongoose.model("Notify", notifySchema);
