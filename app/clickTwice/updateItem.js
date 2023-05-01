
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
    var hole = "1";
      var params = {
        TableName: tablename,
        Key: {
            "name": {S: 'Ryan'}
        },
        UpdateExpression: "SET #hole = :strokes",
        ExpressionAttributeNames: {
            "#hole": hole
        },
        ExpressionAttributeValues: {
          ":strokes": { "S": "5" }
        },
        ReturnValues: "UPDATED_NEW"
      };
      dynamodb.updateItem(params, function(err, data) {
        if (err) console.log("Unable to update item. Error: ", JSON.stringify(err, null, 2));
        else console.log("Updated item succeeded: ", JSON.stringify(data, null, 2));
      });
    };