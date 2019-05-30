
var AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});



exports.handler = (event, context, callback) => {
    console.log("events :", event)
    var serialNumber = event;
    var params = {
        RequestItems: {
            'strokes':[
                {
                  DeleteRequest: {
                    Key: {
                      'serialNumber' : {
                        S: event
                        }
                    }
                  }
            }]
        }
    };
console.log("Attempting a conditional delete...",serialNumber);
dynamodb.batchWriteItem(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
})};