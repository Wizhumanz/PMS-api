const mongoose = require("mongoose")
const Schema = mongoose.Schema

const roleSchema = new Schema(
    {
        role: {
            type: String,
            trim: true,
            lower: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const Role = mongoose.model("Role", roleSchema)
module.exports = Role