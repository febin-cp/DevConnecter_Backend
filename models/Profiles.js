const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    website:{
        type: String
    },
    location:{
        type: String
    },
    status:{
        type:String,
        required: true
    },
    skills:{
        type: [String],
        required: true
    },
    bio:{
        type: String
    },
    githubusername:{
        type: String
    },
    experience:[{
        title:{
            type: String,
            required: true
        },
        company:{

            type: String,
            required: true
        },
        from:{
            type: Date,
            required: true
        },
        to:{
            type: Date
        },
        current:{
            type: Boolean,
            default: false
        },
        description: {
            type: String
        }
    }],
    education:[{
        school:{
            type: String,
            required: true
        },
        degree:{
            type: String,
            required: true
        },
        from:{
            type: Date,
            required: true
        },
        to:{
            type: String,
            required: true
        }
    }],
    social:{
        youtube:{
            type: String,
        },
        facebook:{
            type: String,
        },
        twitter:{
            type: String,
        },
        linkedin:{
            type: String,
        }
    },
    date:{
        type: Date,
        default:Date.now
    }
})
module.exports = Profiles = mongoose.model('profile',profileSchema);