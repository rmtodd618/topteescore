const AWS = require('aws-sdk');
const process = require('process');
const sqs = new AWS.SQS({region: process.env.AWS_REGION});
const winston = require('../../utils/logger');

function sendSqsMessage(messageBody, url) {
  let params = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify(messageBody),
    QueueUrl: url,
  };

  return sqs.sendMessage(params).promise();
}

function receiveSqsMessage(url) {
  let params = {
    AttributeNames: [
      'SentTimestamp',
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
      'All',
    ],
    QueueUrl: url,
    VisibilityTimeout: 60,
    WaitTimeSeconds: 15,
  };

  return sqs.receiveMessage(params).promise()
    .then((data) => {
      let response = data.Messages === undefined ? [] : data.Messages;
      winston.debug('Received ', response.length, ' from the ', url, ' queue');
      winston.debug('Receiving messages using parameters: ', params);
      return response;
    });
}


function deleteSqsMessage(message, url) {
  winston.debug('Message from Delete SQS Message: ', message);
  winston.debug('Url from Delete SQS Message: ', url);
  winston.debug('Message Receipt from Delete SQS Message: ', message.ReceiptHandle);

  let deleteParams = {
    QueueUrl: url,
    ReceiptHandle: message.ReceiptHandle,
  };

  return sqs.deleteMessage(deleteParams).promise()
    .then((response) => {
      winston.debug('Delete Message Response: ', response);
      return response;
    })
    .catch((error) => {
      winston.error('Error from Delete Message Response: ', error);
      return error;
    });
}

module.exports.sendSqsMessage = sendSqsMessage;
module.exports.recieveSqsMessage = receiveSqsMessage;
module.exports.deleteSqsMessage = deleteSqsMessage;
