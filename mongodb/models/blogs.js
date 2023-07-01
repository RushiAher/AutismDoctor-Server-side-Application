const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    imgurl:{type:String},
    date:{type:Date,default:Date.now}   
})

const Blogs = mongoose.model("Blog", blogSchema);

module.exports = Blogs;