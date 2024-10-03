const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const listingSchema = new Schema({
  name: {
    type:String,
    required: true,
  },
  description: String,
  image:[ {
    url:String,
    filename:String
// type:String,    
//     default:
//       "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    
  }],
  price: Number,
  catagory: String,
  age: Number,
status:{
  type:String,
  default:"pending"

},
other:String,

  createAt:{
    type:Date,
    default:Date.now()

},
  // bidings:[{
  //   type:Schema.Types.ObjectId,
  //   ref:"biding"
  // }]
  // ,
  User:[{
    type:Schema.Types.ObjectId,
    ref:"Users"
  }]
});



// listingSchema.post("findOneAndDelete",async(listing)=>{
//   if(listing){
//   await reviews.deleteMany({_id :{$in:listing.reviews}})
//   }
// })



const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;