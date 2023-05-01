// Import required libraries
const AWS = require('aws-sdk');

// Set AWS region
AWS.config.update({ region: 'us-east-1' }); // Replace with your desired region

// Set up AWS IoT 1-Click and DynamoDB clients
const iot1click = new AWS.IoT1ClickDevicesService();
const dynamodb = new AWS.DynamoDB.DocumentClient(); // Use DocumentClient for simplified interaction with DynamoDB

// Constants
const PROJECT_ARN = '<YOUR_PROJECT_ARN>'; // Replace with your AWS IoT 1-Click project ARN
const DEVICE_ID = '<YOUR_DEVICE_ID>'; // Replace with your AWS IoT 1-Click device ID
const TABLE_NAME = '<YOUR_TABLE_NAME>'; // Replace with your DynamoDB table name

// Function to record golf score in DynamoDB
const recordGolfScore = (playerName, holeNumber, score) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      scoreId: new Date().toISOString(), // Use timestamp as scoreId for uniqueness
      playerName,
      holeNumber,
      score
    }
  };

  dynamodb.put(params, (err, data) => {
    if (err) {
      console.error('Unable to add item to DynamoDB', err);
    } else {
      console.log('Golf score recorded:', params.Item);
    }
  });
};

// Handler function for AWS IoT 1-Click trigger
exports.handler = (event, context, callback) => {
  // Verify that the event is triggered by the correct AWS IoT 1-Click project and device
  if (event.deviceInfo.deviceId === DEVICE_ID && event.deviceInfo.projectArn === PROJECT_ARN) {
    const playerName = 'John Doe'; // Replace with the player name received from the IoT 1-Click device
    const holeNumber = 1; // Replace with the hole number received from the IoT 1-Click device
    const score = 4; // Replace with the score received from the IoT 1-Click device

    // Record golf score in DynamoDB
    recordGolfScore(playerName, holeNumber, score);

    // Send success response to the IoT 1-Click device
    const response = {
      statusCode: 200,
      body: JSON.stringify('Golf score recorded successfully!')
    };
    callback(null, response);
  } else {
    // Send error response to the IoT 1-Click device
    const response = {
      statusCode: 400,
      body: JSON.stringify('Invalid event')
    };
