import {Schema, model} from "mongoose"


const userSchema = new Schema({
    user:{type: String, required: true},
    comments:{ type: Schema.Types.ObjectId, ref:"comments"}
})