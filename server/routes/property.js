const express = require('express')
const auth = require('../middlewares/auth')
const propertyCtrl = require('../controllers/property');
const router = new express.Router()
const multer = require('multer')

const storage = multer.diskStorage({ 
  destination: function(req, file, cb) {cb(null, 'server/uploads/')},
  filename: function(req, file, cb) {cb(null, file.fieldname + '-' + Date.now())}
});
const upload = multer({ storage })

router.post('/api/property/new', auth, async (req, res) => {
  propertyCtrl.createProperty(req, res);
})

router.put('/api/property/edit/:id', auth, async (req, res) => {
  propertyCtrl.updateProperty(req, res);
})

router.put('/api/property/edit', auth, async (req, res) => {
  propertyCtrl.updateMultipleProperties(req, res);
})

router.delete('/api/property/delete/:id', auth, async (req, res) => {
  propertyCtrl.deleteProperty(req, res);
})

router.delete('/api/property/delete', auth, async (req, res) => {
  propertyCtrl.deleteMultipleProperties(req, res);
})

router.get('/api/property/single/:id', auth, async (req, res) => {
  propertyCtrl.getSingleProperty(req, res);
})

router.get('/api/property/all', auth, async (req, res) => {
  propertyCtrl.getAllProperties(req, res);
})

router.post('/api/property/importCSV', auth, upload.single('csv'), async (req, res) => {
  propertyCtrl.importAllPropertiesCSV(req, res);
})

router.post('/api/property/importXLSX', auth, upload.single('xlsx'), async (req, res) => {
  propertyCtrl.importAllPropertiesXLSX(req, res);
})

router.post('/api/property/support', auth, async (req, res) => {
  propertyCtrl.propertySupport(req, res);
})

router.post('/api/property/:id/share', auth, async (req, res) => {
  propertyCtrl.shareProperty(req, res);
})

router.get('/api/property/:id/csv', async (req, res) => {
  propertyCtrl.exportPropertyCSV(req, res);
})

router.get('/api/property/:id/inflation', async (req, res) => {
  propertyCtrl.getInflation(req, res);
})

router.post('/api/property/:id/update-inflation', async (req, res) => {
  propertyCtrl.updateInflation(req, res);
})

module.exports = router