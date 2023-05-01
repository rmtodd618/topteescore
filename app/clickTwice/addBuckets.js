
var AWS = require("aws-sdk");

var s3Client = new AWS.S3();



exports.handler = (event, context, callback) => {
    console.log("events :", event)
    var serialNumber = event.deviceInfo.deviceId;
    var date = event.deviceEvent.buttonClicked.reportedTime;
    var params = {
        Bucket: 'golf-strokes',
        Marker: serialNumber + '/'
    };

s3Client.listObjects(params, function(err, data) {
    if (err) {
        console.error("Unable to list Items in Bucket. Error JSON:", JSON.stringify(err, null, 2));
    } else {

        console.log ("How Many strokes:"+ Object.keys(data.Contents).length);
        console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        callback(null, {
            statusCode: '200',
            body: Object.keys(data.Contents).length
        });
    }
})};