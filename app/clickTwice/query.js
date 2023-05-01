
var AWS = require("aws-sdk");

var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});



exports.handler = (event, context, callback) => {
    console.log("events :", event)
    var serialNumber = event.deviceInfo.deviceId;
    var date = event.deviceEvent.buttonClicked.reportedTime;
    var params = {
        Bucket: 'golf-strokes',
        Marker: serialNumber + '/'
    };
        dynamodb.query({
            TableName: tablename,
            IndexName: "serialNumber-index",
            KeyConditionExpression: 'serialNumber = :ser_id',
            ExpressionAttributeValues: { ':ser_id': { S: serialNumber }}
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                callback(null, {
                    statusCode: '500',
                    body: err
                });
            } else {

                           console.log ("How Many strokes:"+ Object.keys(data.Contents).length);
                           console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                           callback(null, {
                               statusCode: '200',
                               body: Object.keys(data.Contents).length
                           });
                       }
})};