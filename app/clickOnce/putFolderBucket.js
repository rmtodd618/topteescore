
var AWS = require("aws-sdk");

var s3Client = new AWS.S3();

exports.handler = (event, context, callback) => {
    console.log("events :", event)
    var serialNumber = event.deviceInfo.deviceId;
    var date = event.deviceEvent.buttonClicked.reportedTime;
    var params = {
        Bucket: 'golf-strokes',
        Key: serialNumber + '/'+ date,
        Body: 'fail',
        ACL: 'public-read',
        ContentType: 'application/json'
    };
console.log("Attempting a conditional delete...",params);
s3Client.putObject(params, function(err, data) {
    if (err) {
        console.error("Unable to add item to s3 bucket Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Stroke added to s3bucket succeeded:", JSON.stringify(data, null, 2));
    }
})};