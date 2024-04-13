const express = require('express')
const { newRegister, login, logout, getAllUsers, getUsersByDepartment, getTokenFromCookies, deleteUserById } = require('../controllers/User.controllers')
const { protect } = require('../middleware/auth')
const { createStyle, getOnlyTrimeDepartmentWorkByTrimPersonName, getOnlyFabricDepartmentWorkByaFabricPersonName, getAllStyles, updateStyle, deleteStyle, reMarkByDepartment, AssignWorkToAnyDepartmentPerson, getOnlyQcDepartmentWorkByQcPersonName, updateWorkAssignedStatusById } = require('../controllers/stylecontroller')
const Router = express.Router()


//===============================================User Routes
Router.post('/register',newRegister)
Router.post('/Login',login)
Router.post('/Logout',protect,logout)
Router.get('/get-all-user',protect,getAllUsers)
Router.get('/get-user-by-department/:department',getUsersByDepartment)
Router.get('/get-token',getTokenFromCookies)
Router.post('/delete-user/:userId',deleteUserById)

//=============================================== Style Routes

Router.post('/create-style',protect,createStyle)
Router.get('/trim/:trimPersonName', getOnlyTrimeDepartmentWorkByTrimPersonName);
Router.get('/qc/:qc', getOnlyQcDepartmentWorkByQcPersonName);
Router.post('/update-status-work/:id', updateWorkAssignedStatusById);


Router.get('/get-All-styles',protect,getAllStyles)
Router.post('/update-style/:styleId',protect,updateStyle)
Router.post('/remark/:styleId',protect,reMarkByDepartment)
Router.delete('/delete-style/:styleId',protect,deleteStyle)
Router.get('/fabric/:fabricPersonName', getOnlyFabricDepartmentWorkByaFabricPersonName);
Router.post('/Assigned', AssignWorkToAnyDepartmentPerson);













module.exports = Router