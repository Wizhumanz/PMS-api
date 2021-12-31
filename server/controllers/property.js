const fs = require("fs")
const csv = require("csvtojson")
const mongoose = require('mongoose')
const { promisify } = require('util')
const json2csv = require('json2csv').parse;
const Property = require('../models/property')
const inflationProfiles = require('../models/inflationProfiles')
const unlinkAsync = promisify(fs.unlink)
const XLSX = require('xlsx')

const emailController = require("../controllers/email");

module.exports = {
  createProperty: async (req, res) => {
    try {
      let property = await new Property(req.body);

      property.userId = mongoose.Types.ObjectId(req.authUser._id);
      if (!(await property.save())) {
        return res.status(400).send({ message: "Error adding new property" });
      } else {
        let defaultHoldingYears = [];
        for (let i = 1; i <= property.holdingPeriod; i++) {
          defaultHoldingYears.push({
            year: i,
            inflationPercentage: 0,
          });
        }

        const defaultInflations = {
          inflations: [
            {
              inflationType: "General Inflation",
              holdingYears: defaultHoldingYears,
            },
            {
              inflationType: "Expenses Inflation",
              holdingYears: defaultHoldingYears,
            },
            {
              inflationType: "Market Inflation",
              holdingYears: defaultHoldingYears,
            },
          ],
          propertyId: property._id,
        };

        const propertyInflations = await new inflationProfiles(defaultInflations);
        propertyInflations.save();

        return res.status(200).send({ message: property });
      }
    } catch (error) {
      res.status(400).send({ message: error.name });
    }
  },

  updateProperty: async (req, res) => {
    try {
      await Property.updateOne(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res
        .status(200)
        .send({ property: await Property.findOne({ _id: req.params.id }) });
    } catch (error) {
      res.status(400).send({ message: error.name });
    }
  },

  updateMultipleProperties: async (req, res) => {
    try {
      await Property.updateMany(
        { _id: {$in: req.body.ids} },
        { $set: {"group": {"name": req.body.group.name, "backgroundColor": req.body.group.backgroundColor, "color": req.body.group.color}} },
      );
      return res.status(200).send({ properties: await Property.find({ userId: req.authUser._id }) });
    } catch (error) {
      res.status(400).send({ message: error.name });
    }
  },

  deleteProperty: async (req, res) => {
    try {
      await Property.deleteOne({ _id: req.params.id });
      return res.status(200).send({ message: "property removed successfully" });
    } catch (error) {
      res.status(400).send({ message: error.name });
    }
  },

  deleteMultipleProperties: async (req, res) => {
    try {
      await Property.deleteMany(req.body);
      return res.status(200).send({ message: req.body });
    } catch (error) {
      res.status(400).send({ message: error.name });
    }
  },

  getSingleProperty: async (req, res) => {
    try {
      return res.status(200).send({
        property: await Property.findOne({ _id: req.params.id }).populate(
          "userId",
          "firstName lastName email"
        ),
      });
    } catch (error) {
      res.status(400).send({ message: error.name });
    }
  },

  getAllProperties: async (req, res) => {
    try {
      return res.status(200).send({
        properties: await Property.find({ userId: req.authUser._id }),
      });
    } catch (error) {
      res.status(400).send({ message: error.name });
    }
  },

  importAllPropertiesCSV: async (req,res) => {
    try{
      csv()
        .fromFile(req.file.path)
        .then(async csvData => {
          let promiseArray = []
          let existingPropertyNames = []
          let undefinedFields = []
          let saveError = false
          let resSent = false

          // Check for duplicate names within the properties in the file
          let propertyNames = csvData.map((property) => property.name)

          let namesMap = {};
          for (let i = 0; i < propertyNames.length; i++) {
      
              if (namesMap[propertyNames[i]]) {
                  resSent = true;
                  existingPropertyNames.push(propertyNames[i])
              }
      
              namesMap[propertyNames[i]] = true;
          }

          csvData.forEach(async (property) => {
            promiseArray.push(new Promise(async (resolve) => {
              const propertyData = {'name': property.name, 'dateCreated': property.dateCreated,
              'holdingPeriod': property.holdingPeriod, 'propType': property.propType, 
              'analysisStart': property.analysisStart, 'sizeByMonth': {'size': property.initialSize, 'month': 0}, 'userId': req.authUser._id}

              const rejected = await rejectProperties(propertyData, undefinedFields, resSent, existingPropertyNames, saveError)
              undefinedFields = rejected.undefinedFields
              existingPropertyNames = rejected.existingPropertyNames
              saveError = rejected.saveError

              // Cannot set resSent from true to false
              if (!resSent) {
                resSent = rejected.resSent
              }

              resolve()
            }))
          })
          await unlinkAsync(req.file.path)
          await Promise.all(promiseArray)

          return returnImportMessage(res, undefinedFields, resSent, existingPropertyNames, saveError)
        })

    } catch(error) {
        res.status(400).send({message: [error.name]});
    }
  },

  importAllPropertiesXLSX: async (req, res) => {
    try {
      const workbook = XLSX.readFile(req.file.path)
      const excelFile = workbook.Sheets[workbook.SheetNames[0]]

      var range = XLSX.utils.decode_range(excelFile['!ref']).e.r;

      let resSent = false
      let promiseArray = []
      let existingPropertyNames = []
      let undefinedFields = []
      let saveError = false

      // Check for duplicate names within the properties in the file
      let propertyNames = []
      for (let row = 2; row <= range+1; row++) {
        propertyNames.push(excelFile[`A${row}`].v)
      }

      let namesMap = {};
      for (let i = 0; i < propertyNames.length; i++) {
  
          if (namesMap[propertyNames[i]]) {
              resSent = true;
              existingPropertyNames.push(propertyNames[i])
          }
  
          namesMap[propertyNames[i]] = true;
      }

      for (let row = 2; row <= range+1; row++) {
        promiseArray.push(new Promise(async (resolve) => {
          const propertyData = {'name': excelFile[`A${row}`].v, 'dateCreated': excelFile[`B${row}`].v,
                'holdingPeriod': excelFile[`C${row}`].v, 'propType': excelFile[`D${row}`].v, 
                'analysisStart': excelFile[`E${row}`].v, 'sizeByMonth': {'size': excelFile[`F${row}`].v, 'month': 0}, 'userId': req.authUser._id}
          
          const rejected = await rejectProperties(propertyData, undefinedFields, resSent, existingPropertyNames, saveError)
          undefinedFields = rejected.undefinedFields
          existingPropertyNames = rejected.existingPropertyNames
          saveError = rejected.saveError

          // Cannot set resSent from true to false
          if (!resSent) {
            resSent = rejected.resSent
          }

          resolve()
        }))
      }
      await unlinkAsync(req.file.path)
      await Promise.all(promiseArray)

      return returnImportMessage(res, undefinedFields, resSent, existingPropertyNames, saveError)
    } catch (error) {
      res.status(400).send({message: [error.name]});
    }
  },

  propertySupport: async (req, res) => {
    try {
      emailController.supportEmail(process.env.DEV_EMAIL, req, res);
      return res.status(200).send({message: "Support email sent successfully"});
    } catch (error) {
      return res.status(400).send({message: "An error occured"});
    }
  },

  shareProperty: async (req, res) => {
    try {
      emailController.sharePropertyEmail(req, res, await Property.findOne({_id: req.params.id}));
      return res.status(200).send({message: "Property details shared successfully"});
    } catch (error) {
      return res.status(400).send({message: "An error occured"});
    }
  },

  exportPropertyCSV: async (req, res) => {
    try {
      const property = await Property.findOne({ _id: req.params.id });
      const propertyCSV = json2csv([
        {
          propertyName: property.name,
          createdDate: property.dateCreated,
          holdingPeriod: property.holdingPeriod,
          propertyType: property.propType,
          analysisDate: property.analysisStart,
          initialSize: property.sizeByMonth.size[0],
          address: property.address,
          city: property.city,
          state: property.state,
          country: property.country,
          zipCode: property.zipCode,
        },
      ]);
      res.setHeader(
        "Content-disposition",
        "attachment; filename=property-data.csv"
      );
      res.set("Content-Type", "text/csv");
      return res.status(200).send(propertyCSV);
    } catch (error) {
      return res.status(400).send({ mesage: "An error occured" });
    }
  },

  getInflation: async (req, res) => {
    try {
      const inflations = await inflationProfiles.find({ "propertyId": req.params.id });
      return res.status(200).send({ message: inflations[0].inflations });
    } catch (error) {
      return res.status(404).send(error);
    }
  },

  updateInflation: async (req, res) => {
    try {
      await inflationProfiles.findOneAndUpdate(
        { "propertyId": req.params.id },
        req.body
      );
      return res.status(200).send({ message: req.body });
    } catch (error) {
      return res.status(404).send(error);
    }
  },
};

function joinSentence(array, oxford_comma) {
  if (array.length > 1) {
    var lastWord = " and " + array.pop();
    if (oxford_comma && array.length > 1) {
      lastWord = "," + lastWord;
    }
  } else {
    var lastWord = "";
  }
  return array.join(", ") + lastWord;
}

async function rejectProperties(propertyData, undefinedFields, resSent, existingPropertyNames, saveError) {
  // Reject properties with empty fields
  Object.entries(propertyData).forEach(([key, value]) => {
      if (key === "sizeByMonth") {
        value.size == undefined ? undefinedFields.push("initialSize") : null
      } else {
        value == undefined ? undefinedFields.push(key) : null
      }
    }
  )
  if (undefinedFields.length > 0) {
    resSent = true
  }

  // Reject properties with existing name
  if (await Property.findOne({name: propertyData.name})) {
    resSent = true
    existingPropertyNames.push(propertyData.name)
  }

  if (!resSent && existingPropertyNames.length === 0 && !await new Property(propertyData).save()) {
    resSent = true
    saveError = true
  }

  return {undefinedFields, resSent, existingPropertyNames, saveError}
}

function returnImportMessage(res, undefinedFields, resSent, existingPropertyNames, saveError) {
  if (!resSent) {
    return res.status(200).send({message: "Property imported successfully"});
  } else {
    let messages = []
    if (existingPropertyNames.length > 0) {
      messages.push((existingPropertyNames.length > 1 ? "Duplicate names: " : "Duplicate name: ") + `${joinSentence([...new Set(existingPropertyNames)], true)}`)
    } 
    
    if (undefinedFields.length > 0) {
      messages.push(`${joinSentence([...new Set(undefinedFields)], true)} should exist.`)
    }

    if (saveError) {
      messages.push("Error importing new properties")
    }
    return res.status(400).send({message: messages});
  }
}
