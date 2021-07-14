import mongoose from "mongoose"

const {Schema, model} = mongoose

const blogSchema = new Schema({
  category: {type: String, required: true},
  title: {type: String, required: true},
  cover: {type: String, default: ""},
  readTime: {
    value: {type: Number, required: true},
    unit: {type: String, default: "minute"}
  },
  author: {type: Schema.Types.ObjectId, ref:"authors"},
  content: {type: String, required: true},
  comments:[{ type: Schema.Types.ObjectId, ref:"comments"}]
},
{timestamps: true},
)

blogSchema.static("findBlogPostwithAuthorAndComments", async function(){
  
})



export default model("blogposts", blogSchema)
