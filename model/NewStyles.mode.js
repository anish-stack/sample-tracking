const mongoose = require('mongoose');


const remark = mongoose.Schema({

    WhichDepartment:{
        type:String
    },
    NameOfPerson:{
        type:String
    },
    remark:{
        type:String
    }

},{timestamps:true})
const StautsSchemna = mongoose.Schema({

    comment:{
        type:String
    },
    whichDepartemt:{
        type:String
    },
    PersonName:{
        type:String
    }

},{timestamps:true})

const WorkAssignToDepartemntSchema = mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    NameOfPerson: {
        type: String,
        required: true
    },
    Comment: {
        type: String
    },
    WorkId: {
        type: String,
    },
    StyleName: {
        type: String
    },
    stauts:{
        type: String,
        default:"pending"
    },
    stautsDate:{
        type:String
    },
    Reviews:{
        type:String
    },
    WorkGiveBy:{
        type: String,
        required: true
    },
    WorkAssignDate:{
        type: Date,
        default: Date.now
    }
});

const StyleSchema = mongoose.Schema({
    styleName: {
        type: String,
        required: true
    },
    srfNo: {
        type: String,
        required: true
    },
    numberOfPcs: {
        type: Number,
        required: true
    },
    assignDate: {
        type: Date,
        default: Date.now
    },
    color:{
        type:[String]
    },
    endDate: {
        type: Date
    },
    sampleType: {
        type: String
    },
    trimSource: {
        type: Boolean
    },
    TrimeDepartmentPersonName:{
        type:String
    },
    trimDepartmentMsg: {
        type: String
    },
    fabricSource: {
        type: Boolean
    },
    fabricDepartmentMsg: {
        type: String
    },
    FabricDepartmentPersonName:{
        type:String
    },
    buyers: {
        type: String,
        enum: [
            "Primark",
            "George",
            "Nutmag",
            "Next",
            "Pourmoi",
            "Lipsy",
            "Mango",
            "Asos",
            "Noon",
            "Brownie"
        ],
        default:"Primark"
    },
    remark:[remark],
    merchentId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    WorkAssigned:[WorkAssignToDepartemntSchema],
    status: [StautsSchemna]
}, );

const Style = mongoose.model('Style', StyleSchema);

module.exports = Style;
