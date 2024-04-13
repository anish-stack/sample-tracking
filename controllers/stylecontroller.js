const Style = require('../model/NewStyles.mode');
const User = require('../model/User.model');
const sendEmail = require('../utils/sendMail'); // Assuming you have a function to send emails

exports.createStyle = async (req, res) => {
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not logged in.' });
        }

        // Check if the user exists and has the appropriate permissions (e.g., is a merchent)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }


        // Collect data from request body
        const {
            styleName,
            srfNo,
            numberOfPcs,
            assignDate,
            endDate,
            sampleType,
            trimSource,
            color,
            TrimeDepartmentPersonName,
            trimDepartmentMsg,
            fabricSource,
            fabricDepartmentMsg,
            FabricDepartmentPersonName,
            buyers
        } = req.body;
        console.log(req.body)
        // Check for required fields
        if (!styleName || !srfNo || !numberOfPcs) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        // Check if trim department person name exists and get their email
        let trimDepartmentPersonEmail = '';
        if (trimSource && TrimeDepartmentPersonName) {
            const trimDepartmentUser = await User.findOne({ userName: TrimeDepartmentPersonName });
            if (trimDepartmentUser) {
                trimDepartmentPersonEmail = trimDepartmentUser.email;
            } else {
                return res.status(400).json({ success: false, message: 'Trim department person not found.' });
            }
        }

        // Check if fabric department person name exists and get their email
        let fabricDepartmentPersonEmail = '';
        if (fabricSource && FabricDepartmentPersonName) {
            const fabricDepartmentUser = await User.findOne({ userName: FabricDepartmentPersonName });
            if (fabricDepartmentUser) {
                fabricDepartmentPersonEmail = fabricDepartmentUser.email;
            } else {
                return res.status(400).json({ success: false, message: 'Fabric department person not found.' });
            }
        }

        // Create new style object
        const newStyle = new Style({
            styleName,
            srfNo,
            numberOfPcs,
            assignDate,
            endDate,
            sampleType,
            trimSource,
            TrimeDepartmentPersonName,
            trimDepartmentMsg,
            fabricSource,
            FabricDepartmentPersonName,
            fabricDepartmentMsg,
            buyers,
            color,
            merchentId: userId,
        });

        // Save the style
        await newStyle.save();

        // Send emails to trim and fabric department persons
        if (trimDepartmentPersonEmail) {
            await sendEmail({ email: trimDepartmentPersonEmail, subject: 'New Style Assigned', message: trimDepartmentMsg });
        }
        if (fabricDepartmentPersonEmail) {
            await sendEmail({ email: fabricDepartmentPersonEmail, subject: 'New Style Assigned', message: fabricDepartmentMsg });
        }

        res.status(201).json({ success: true, message: 'Style created successfully.' });
    } catch (error) {
        console.error('Error in creating style:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.updateStyle = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not logged in.' });
        }

        // Check if the user exists and has the appropriate permissions (e.g., is a merchant)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }


        // Collect data from request body
        const { styleId } = req.params; // Assuming styleId is provided in the request parameters
        const updateFields = req.body;
        console.log(styleId)
        console.log(updateFields)

        // Check if styleId is provided
        if (!styleId) {
            return res.status(400).json({ success: false, message: 'Please provide the style ID.' });
        }

        // Check if updateFields is empty
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide fields to update.' });
        }

        // Update the style document
        const updatedStyle = await Style.findByIdAndUpdate(styleId, updateFields, { new: true });
        console.log("updatedStyle", updatedStyle)
        // Check if the style exists
        if (!updatedStyle) {
            return res.status(404).json({ success: false, message: 'Style not found.' });
        }

        res.status(200).json({ success: true, data: updatedStyle, message: 'Style updated successfully.' });
    } catch (error) {
        console.error('Error in updating style:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.deleteStyle = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not logged in.' });
        }

        // Check if the user exists and has the appropriate permissions (e.g., is a merchant)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }



        // Collect style ID from request parameters
        const { styleId } = req.params;

        // Check if styleId is provided
        if (!styleId) {
            return res.status(400).json({ success: false, message: 'Please provide the style ID.' });
        }

        // Find and delete the style document
        const deletedStyle = await Style.findByIdAndDelete(styleId);

        // Check if the style exists
        if (!deletedStyle) {
            return res.status(404).json({ success: false, message: 'Style not found.' });
        }

        res.status(200).json({ success: true, message: 'Style deleted successfully.' });
    } catch (error) {
        console.error('Error in deleting style:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getOnlyTrimeDepartmentWorkByTrimPersonName = async (req, res) => {
    try {
        const trimPersonName = req.params.trimPersonName;

        // Find styles assigned to the trim department person
        const trimDepartmentWork = await Style.find({ trimSource: true, TrimeDepartmentPersonName: trimPersonName }, '-buyers -merchentId -fabricSource -fabricDepartmentMsg -FabricDepartmentPersonName');

        if (trimDepartmentWork.length === 0) {
            return res.status(404).json({ success: false, message: 'No work assigned for the trim department person.' });
        }

        res.status(200).json({ success: true, data: trimDepartmentWork });
    } catch (error) {
        console.error('Error in fetching trim department work:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getOnlyFabricDepartmentWorkByaFabricPersonName = async (req, res) => {
    try {
        const fabricPersonName = req.params.fabricPersonName;

        // Find styles assigned to the fabric department person, excluding buyers, merchentId, and trimDepartmentMsg fields
        const fabricDepartmentWork = await Style.find({ fabricSource: true, FabricDepartmentPersonName: fabricPersonName }, '-buyers -merchentId -trimDepartmentMsg -trimSource -TrimeDepartmentPersonName');

        if (fabricDepartmentWork.length === 0) {
            return res.status(404).json({ success: false, message: 'No work assigned for the fabric department person.' });
        }

        res.status(200).json({ success: true, data: fabricDepartmentWork });
    } catch (error) {
        console.error('Error in fetching fabric department work:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getOnlyQcDepartmentWorkByQcPersonName = async (req, res) => {
    try {
        const fabricPersonName = req.params.qc;

        // Constructing the query to filter documents based on WorkAssigned array
        const query = { 'WorkAssigned.NameOfPerson': fabricPersonName };

        // Find styles assigned to the fabric department person, excluding certain fields
        const fabricDepartmentWork = await Style.find(query, '-buyers -merchentId -trimDepartmentMsg -fabricDepartmentMsg -FabricDepartmentPersonName -fabricSource -trimSource -TrimeDepartmentPersonName');

        if (fabricDepartmentWork.length === 0) {
            return res.status(404).json({ success: false, message: 'No work assigned for the fabric department person.' });
        }

        // Filter the WorkAssigned array to include only the data that matches fabricPersonName
        const filteredData = fabricDepartmentWork.map(doc => ({
            ...doc.toObject(),
            WorkAssigned: doc.WorkAssigned.filter(item => item.NameOfPerson === fabricPersonName)
        }));

        res.status(200).json({ success: true, data: filteredData });
    } catch (error) {
        console.error('Error in fetching fabric department work:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
// exports.getOnlyQcDepartmentWorkByQcPersonName = async (req, res) => {
//     try {
//         const fabricPersonName = req.params.qc;

//         // Constructing the query to filter documents based on WorkAssigned array
//         const query = { 'WorkAssigned.NameOfPerson': fabricPersonName };

//         // Find styles assigned to the fabric department person, excluding certain fields
//         const fabricDepartmentWork = await Style.find(query, '-buyers -merchentId -trimDepartmentMsg -fabricDepartmentMsg -FabricDepartmentPersonName -fabricSource -trimSource -TrimeDepartmentPersonName');

//         if (fabricDepartmentWork.length === 0) {
//             return res.status(404).json({ success: false, message: 'No work assigned for the fabric department person.' });
//         }

//         // Filter the WorkAssigned array to include only the data that matches fabricPersonName
//         const filteredData = fabricDepartmentWork.map(doc => ({
//             ...doc.toObject(),
//             WorkAssigned: doc.WorkAssigned.filter(item => item.NameOfPerson === fabricPersonName)
//         }));

//         res.status(200).json({ success: true, data: filteredData });
//     } catch (error) {
//         console.error('Error in fetching fabric department work:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };

exports.updateWorkAssignedStatusById = async (req, res) => {
    try {
        const workAssignedId = req.params.id;

        // Find the style document containing the matching WorkAssigned object
        const style = await Style.findOne({
            'WorkAssigned._id': workAssignedId,
            'WorkAssigned.WorkGiveBy': 'Qc-Manager'
        });

        if (!style) {
            return res.status(404).json({ success: false, message: 'Style not found with the provided WorkAssigned ID and WorkGiveBy value.' });
        }
        const {status} = req.body
        // Find the WorkAssigned object with the provided ID
        const workAssigned = style.WorkAssigned.find(work => work._id == workAssignedId);

        if (!workAssigned) {
            return res.status(404).json({ success: false, message: 'WorkAssigned object not found with the provided ID.' });
        }
        // if(workAssigned.stauts === "completed"){
        //     return res.status(402).json({
        //         success: false, message: 'Already Status updated .' 
        //     })
        // }
        // Update the status of the WorkAssigned object to 'completed'
        workAssigned.stauts = 'completed';
        workAssigned.stautsDate = new Date()
        workAssigned.Reviews=status.Reviews

        // Save the updated document
        await style.save();

        res.status(200).json({ success: true, message: 'Status updated successfully.' });
    } catch (error) {
        console.error('Error updating work assigned status:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getAllStyles = async (req, res) => {
    try {
        // Check if the user is authenticated
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not logged in.' });
        }

        // Check if the user exists and has the appropriate permissions (e.g., is a merchent)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }


        // If the user is a merchent, fetch all styles
        const styles = await Style.find();
        const stylesCount = await Style.countDocuments();
        res.status(200).json({ success: true, data: styles, count: stylesCount });
    } catch (error) {
        console.error('Error in fetching styles:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.reMarkByDepartment = async (req, res) => {
    try {
        const { styleId } = req.params;

        // Check if the style exists
        const style = await Style.findById(styleId);
        if (!style) {
            return res.status(404).json({ message: "Style not found" });
        }

        const userId = req.user.id
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not logged in.' });
        }

        // Check if the user exists and has the appropriate permissions (e.g., is a merchent)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        // Get the user's department from the request
        const userDepartment = user.department;

        // Extract remark from the request body
        const { remark } = req.body;

        // Add remark to the style
        style.remark.push({
            WhichDepartment: userDepartment,
            NameOfPerson: user.userName,
            remark: remark
        });

        // Save the updated style
        await style.save();

        res.status(200).json({ message: "Remark added successfully" });
    } catch (error) {
        console.error("Error in reMarkByDepartment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.AssignWorkToAnyDepartmentPerson = async (req, res) => {
    try {
        console.log("I am hit")
        const { department, NameOfPerson, Comment, WorkId, WorkGiveBy,  } = req.body.WorkAssigned;
        console.log(req.body.WorkAssigned);

        // Check if the Style with the given WorkId exists
        const checkStyle = await Style.findById(WorkId);
        if (!checkStyle) {
            return res.status(404).json({ message: 'Style not found' });
        }
        console.log(checkStyle)
        // Push the new work assignment to the checkStyle document
        checkStyle.WorkAssigned.push({
            department,
            NameOfPerson,
            Comment,
            WorkId,
            
            WorkGiveBy,
            StyleName: checkStyle.styleName || "Unknown Style"
        });

        // Save the changes to the database
        await checkStyle.save();
        // console.log(checkStyle)

        res.status(200).json({ message: 'Work assigned successfully', data: checkStyle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};