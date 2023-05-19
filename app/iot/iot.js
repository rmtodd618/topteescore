'use strict';

const AWS = require('aws-sdk');

const SNS = new AWS.SNS();
const dynamodb = new AWS.DynamoDB();
const lambda = new AWS.Lambda();
const s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
    console.log('Received event:', event.deviceEvent.buttonClicked.clickType);
    const clicktype = event.deviceEvent.buttonClicked.clickType;
    const attributes = event.deviceInfo.attributes;
    const myAttributes = event.placementInfo.attributes;
    const serialNumber = event.deviceInfo.deviceId;
    const batterylife = event.deviceInfo.remainingLife;
    const date = event.deviceEvent.buttonClicked.reportedTime;
    if (clicktype === 'SINGLE') {
        s3.putObject(
            {
            Bucket: 'golf-strokes',
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
            Bucket: 'golf-strokes',
            Marker: serialNumber + '/'
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                callback(null, {
                    statusCode: '500',
                    body: err
                });
            } else {
                dynamodb.query({
                    TableName: "score-card",
                    IndexName: "serialNumber-index",
                    KeyConditionExpression: '#serialNumber = :ser_id',
                    ExpressionAttributeNames: {
                      '#serialNumber': 'serialNumber'
                    },
                    ExpressionAttributeValues: {
                        ':ser_id': { S: serialNumber }
                      }
                }, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        callback(null, {
                            statusCode: '500',
                            body: err
                        });
                    } else {
                        switch(data.hole-1) {
                            case 0:
                              // code block
                              break;
                            case 1:
                              // code block
                              break;
                            default:
                              // code block
                        }
                        var strokes = Object.keys(data.Contents).length;
                        dynamodb.putItem({
                            TableName: "score-card",
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
                                    body: 'Hello ' + serialNumber + '!'
                                });
                            }
                            lambda.invoke({
                                FunctionName: 'delete_strokes',
                                Payload: JSON.stringify(serialNumber, null, 2)
                            }, function(error, data) {
                                if (error) {
                                    callback('Error invoking delete_strokes function: ' + error);
                                }
                                if(data.Payload){
                                    context.succeed(data.Payload);
                                }
                            });
                        });
                    }
                });
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
