const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const getSignedUrl = (key) => {
    return s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: 60 * 60
    });
};

const uploadFile = async (file, userId) => {
    if (!file || !file.originalname || !file.buffer) {
        throw new Error('Invalid file upload request');
    }
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const key = `profiles/${userId}.${fileExtension}`;
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        console.log('Uploading to S3:', {
            bucket: process.env.AWS_S3_BUCKET,
            region: process.env.AWS_REGION,
            key,
            contentType: file.mimetype,
            fileSize: file.buffer?.length
        });
        await s3.upload(params).promise();
        return key;
    } catch (err) {
        console.error('S3 Upload Error:', err);
        throw new Error('Failed to upload file to S3');
    }
};

module.exports = {
    uploadFile,
    getSignedUrl
};