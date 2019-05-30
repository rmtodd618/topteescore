'use strict';

const AWS = require('aws-sdk');

const EMAIL = process.env.email;
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const lambda = new AWS.Lambda;
exports.handler = (event, context, callback) => {
    console.log(event);
    console.log('Received event:', event.deviceEvent.buttonClicked.clickType);
    var clicktype = event.deviceEvent.buttonClicked.clickType;
    var attributes = event.deviceInfo.attributes;
    var myAttributes = event.placementInfo.attributes;
    var serialnumber = event.deviceInfo.deviceId;
    var batterylife = event.deviceInfo.remainingLife;
    var date = event.deviceEvent.buttonClicked.reportedTime;
    if (clicktype === 'SINGLE') {
        dynamodb.putItem({
            TableName: "strokes",
            Item: {
                "name": {
                    S: date
                },
                "serialNumber": {
                    S: serialnumber
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
    } else if (clicktype === 'DOUBLE') {
        // WRITE TO A NEW DB and clear the one before
        dynamodb.query({
            TableName: "strokes",
            IndexName: "serialNumber-index",
            KeyConditionExpression: 'serialNumber = :ser_id',
            ExpressionAttributeValues: { ':ser_id': { S: serialnumber }}
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                callback(null, {
                    statusCode: '500',
                    body: err
                });
            } else {
                const params2 = {
                    Message: `You recorded ${data.Count} Stroke that hole - Battery life: ${batterylife}`,
                    PhoneNumber: myAttributes.phoneNumber
                };
                SNS.publish(params2, callback);
                callback(null, {
                    statusCode: '200',
                    body: data.Count
                });
            }
        })
        lambda.invoke({
            FunctionName: 'delete_strokes',

            Payload: JSON.stringify(serialnumber, null, 2)
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
};