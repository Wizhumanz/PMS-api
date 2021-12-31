const mongoose = require('mongoose')
const Schema = mongoose.Schema

const propertySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        dateCreated: {
            type : String,
            default: new Date().toISOString().split('T')[0]
        },
        holdingPeriod: {
            type: Number,
            validate : {
                validator : Number.isInteger,
                message   : '{VALUE} is not an integer value'
            }
        },
        propType: {
            type: String,
            enum : ['Industrial','Office','Multifamily','Self-storage','Retail','Other'],
            default: 'Other'
        },
        analysisStart: {
            type : String,
        },
        sizeByMonth: {
            size: {
                type : [Number],
            },
            month: {
                type: [Number],
            }          
        },
        currencyUnit: {
            type: String,
            enum : ['$','€','£','¥'],
            default: '$'
        },
        sizeUnit: {
            type: String,
            enum : ['SF','SQM'],
            default: 'SF'
        },
        address: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        zipCode: {
            type: String,
        },
        country: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
        },
        group: {
            name: {
                type: String,
                trim: true,
                default: ""
            },
            backgroundColor: {
                type: String,
                default: ""
            },
            color: {
                type: String,
                default: ""
            }
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'User id is required'],
            ref: "User",
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const Property = mongoose.model('Property', propertySchema)
module.exports = Property