import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema ({
    videoFile: {
        type: String, // cloudnary se lenge
        required: true,
    },
    thumbnail: {
        type: String,   // cloudnary se lenge
        required: true,
    },
    title: {
        type: String,   
        required: true,
    },
    description: {
        type: String,   
        required: true,
    },
    duration: {
        type: Number,   // duration hum cloudnary se lenge
        required: true,
    },
    views: {
        type: Number,   // cloudnary se lenge
        default: 0,
    },
    isPublisher: {
        type: Boolean,
        required: true,
        default: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, {timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)