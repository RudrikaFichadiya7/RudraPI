let multer = require('multer');

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads');
	},
	filename: function (req, file, cb) {
		// console.log('Here local ====== ', file);
		cb(null, file.originalname);
		// req.originalFileName = file.originalname;
	}
});

let upload = multer({ storage: storage });
module.exports = upload;
