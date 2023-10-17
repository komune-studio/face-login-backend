
// Load dependencies
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');


//put on other file
aws.config = new aws.Config();
aws.config.accessKeyId = process.env.SPACES_ACCESS_KEY_ID
aws.config.secretAccessKey = process.env.SPACES_SECRET_ACCESS_KEY

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(process.env.AWS_ENDPOINT);

// Creating s3 instance
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.SPACES_BUCKET_NAME,
        acl:'private',
        key: (req: any, file: any, cb: (arg0: null, arg1: string) => void) => {
            let preparedKey = `intellivent-registration/uploads/${Date.now()}-${file.originalname}`
            cb(null, preparedKey)
        }
    })
}).single('upload')

const uploadMultiple = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.SPACES_BUCKET_NAME,
        acl:'private',
        key: (req: any, file: any, cb: (arg0: null, arg1: string) => void) => {
            console.log("this is called")
            let preparedKey = `intellivent-registration/uploads/${Date.now()}-${file.originalname}`
            cb(null, preparedKey)
        }
    })
}).array('uploads')

const upload_public = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.SPACES_BUCKET_NAME,
        acl: 'public-read',
        key: function (req:any, file: any, cb: any) {
            let entity = req.info.entity || "unknown";
            let preparedKey = `intellivent-registration/uploads/${entity}/${Date.now()}-${file.originalname}`
            console.log(req.info, "Prepared key: " + preparedKey)
            cb(null, preparedKey);
        }
    })
}).single('upload')

const upload_public_image = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.SPACES_BUCKET_NAME,
        acl: 'public-read',
        key: function (req:any, file: any, cb: any) {
            let entity = req.info.entity || "unknown";
            let preparedKey = `intellivent-registration/uploads/${entity}/${Date.now()}-${file.originalname}`
            console.log(req.info, "Prepared key: " + preparedKey)
            cb(null, preparedKey);
        }
    }),
    fileFilter: (req: any, file: any, cb: any) => {
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(new Error("File format should be PNG,JPG,JPEG"), false); // if validation failed then generate error
        }
    }
}).single('upload')

// const upload_public_material = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: process.env.SPACES_BUCKET_NAME,
//         acl: 'public-read',
//         key: function (req:any, file: any, cb: any) {
//             let entity = req.info.entity || "unknown";
//             let preparedKey = `intellivent-registration/uploads/${entity}/${Date.now()}-${file.originalname}`
//             console.log(req.info, "Prepared key: " + preparedKey)
//             cb(null, preparedKey);
//         }
//     }),
//     fileFilter: (req: any, file: any, cb: any) => {
//         if (
//             file.mimetype === "image/png" ||
//             file.mimetype === "image/jpg" ||
//             file.mimetype === "image/jpeg" ||
//             file.mimetype === "application/pdf" ||
//             file.mimetype === "application/zip" ||
//             file.mimetype === "image/svg+xml"
//         ) {
//             cb(null, true);
//         } else {
//             cb(new Error("File format should be PNG,JPG,JPEG, PDF, ZIP"), false); // if validation failed then generate error
//         }
//     }
// }).single('upload')

const upload_public_multi = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.SPACES_BUCKET_NAME,
        acl: 'public-read',
        key: function (req:any, file: any, cb: any) {
            let entity = req.info.entity || "unknown";
            let preparedKey = `intellivent-registration/uploads/${entity}/${Date.now()}-${file.originalname}`
            console.log(req.info, "Prepared key: " + preparedKey)
            cb(null, preparedKey);
        }
    })
}).array('uploads')

const uploadWithoutMulter = (key:string, body:any, contentType:string)=>{
    return s3.upload({
        Body: body,
        Key: key,
        ACL: 'public-read',
        Bucket: process.env.SPACES_BUCKET_NAME,
        ContentType: contentType
    }).promise()
}

const listObjects = (delimiter: string, prefix:string)=>{
    return s3.listObjects({
        Bucket: process.env.SPACES_BUCKET_NAME,
        Delimiter: delimiter,
        Prefix: prefix
    }).promise()
}

export default {
    upload,
    uploadMultiple,
    upload_public, upload_public_multi, upload_public_image,
    s3,
    uploadWithoutMulter,
    listObjects
}
