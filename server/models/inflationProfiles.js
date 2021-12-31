const mongoose = require('mongoose')
const Schema = mongoose.Schema

const inflationProfilesSchema = new Schema(
    {
        inflations: [{
            inflationType: {
                type: String,
            },
            holdingYears: [{
                _id: false,
                year: {
                    type: Number
                },
                inflationPercentage: {
                    type: Number
                }
            }]
        }],
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const inflationProfiles = mongoose.model('inflationProfiles', inflationProfilesSchema)
module.exports = inflationProfiles