const express = require("express");
const{GenerateSlip,Addsalaryinfo,Updatesalaryinfo,usersalarybyitsid}=require('./payrollcontroller')

const router = express.Router();

router.post("/Generate",GenerateSlip)
router.post("/usersalaryinfo/add",Addsalaryinfo)
router.put("/usersalaryinfo/update",Updatesalaryinfo)
router.get("/usersalaryinfo/:id",usersalarybyitsid)

module.exports = router;