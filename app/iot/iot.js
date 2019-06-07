'use strict';

const AWS = require('aws-sdk');

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const lambda = new AWS.Lambda;
var s3 = new AWS.S3();
exports.handler = (event, context, callback) => {
    console.log('Received event:', event.deviceEvent.buttonClicked.clickType);
    var clicktype = event.deviceEvent.buttonClicked.clickType;
    var attributes = event.deviceInfo.attributes;
    var myAttributes = event.placementInfo.attributes;
    var serialNumber = event.deviceInfo.deviceId;
    var batterylife = event.deviceInfo.remainingLife;
    var date = event.deviceEvent.buttonClicked.reportedTime;
    if (clicktype === 'SINGLE') {
        s3.putObject(
            {
            Bucket: 'golf-strokes-recorded',
            Key: serialNumber + '/'+ date,
            Body: 'fail',
            ACL: 'public-read',
            ContentType: 'application/json'
        },  function(err, data) {
            if (err) {
                console.log(err, err.stack);
                callback(null, {
                    statusCode: '500',
                    body: err
                });
            } else {
                callback(null, {
                    statusCode: '200',
                    body: 'Has added a stroke for ' + serialNumber + '!'
                });
            }
        })
    } else if (clicktype === 'DOUBLE') {
        s3.listObjects({
            Bucket: 'golf-strokes-recorded',
            Marker: serialNumber + '/'
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                callback(null, {
                    statusCode: '500',
                    body: err
                });
            } else {
                var strokes = Object.keys(data.Contents).length;
                dynamodb.putItem({
                    TableName: "score_card",
                    Item: {
                        "strokes": {
                            S: strokes
                        },
                        "serialNumber": {
                            S: serialNumber
                        }
                    }
                }, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        callback(null, {
                            statusCode: '500',
                            body: err
                        });
                    } else {
                        callback(null, {
                            statusCode: '200',
                            body: 'Hello ' + serialnumber + '!'
                        });
                    }
                })
            }
        })
        lambda.invoke({
            FunctionName: 'delete_strokes',

            Payload: JSON.stringify(serialNumber, null, 2)
          }, function(error, data) {
            if (error) {
              context.done('error', error);
            }
            if(data.Payload){
             context.succeed(data.Payload)
            }
          });
    } else if (clicktype === 'LONG') {
        const params3 = {
             Message: `${event.serialNumber} - LONG - processed by Lambda\nBattery voltage: ${event.batteryVoltage}`,
             Subject: `Lambda triggered LONG : ${event.serialNumber}`,
             TopicArn: topicArn
         };
         // result will go to function callback
         SNS.publish(params3, callback);
    }
}
;