// Import AWS SDK
const AWS = require('aws-sdk');

// Create AWS objects
const SNS = new AWS.SNS();
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();
const dynamotable = process.env.DYNAMODBTABLE;
const snsTopicArn = process.env.MY_SNS_TOPIC_ARN;
// Define the handler function
exports.handler = async (event) => {
  try {
    // Log the event
    console.log('Received event:', event);

    // Get the click type
    const clicktype = event.deviceEvent.buttonClicked.clickType;
    console.log('Click type:', clicktype);

    // Get the attributes
    const attributes = event.deviceInfo.attributes;
    const myAttributes = event.placementInfo.attributes;
    console.log('Attributes:', attributes);
    console.log('My attributes:', myAttributes);

    // Get the serial number
    const serialNumber = event.deviceInfo.deviceId;
    console.log('Serial number:', serialNumber);

    // Get the battery life
    const batterylife = event.deviceInfo.remainingLife;
    console.log('Battery life:', batterylife);
    // const phoneNumber = event.placementInfo.attributes.phoneNumber;
    // console.log('Phone number:', phoneNumber);
    // Get the date
    const date = event.deviceEvent.buttonClicked.reportedTime;
    console.log('Date:', date);

    // List the objects in S3
async function listObjectsInS3(serialNumber) {
    try {
      const data = await s3.listObjects({
        Bucket: 'golf-strokes-recorded',
        Prefix: `${serialNumber}/`
        }).promise();
        console.log('Objects in S3:', data.Contents);
      return data;
    } catch (err) {
      console.error('Error listing objects in S3:', err);
      throw err;
    }
  }
  
// Get the number of strokes
async function getNumberOfStrokes(data) {
    if (data === undefined) {
      return 0;
    }
  
    const strokes = data.Contents.length;
    console.log('How many strokes:', strokes);
    return strokes;
  }
  async function queryStokeData(serialNumber) {
    try {
      const data = await dynamodb.query({
        TableName: dynamotable,
        KeyConditionExpression: '#serialNumber = :ser_id',
        ExpressionAttributeNames: {
          '#serialNumber': 'serialNumber'
        },
        ExpressionAttributeValues: {
          ':ser_id': { 'S': serialNumber.toString() }
        },
        ProjectionExpression: 'serialNumber, holeNumber, strokes',
        ScanIndexForward: true
      }).promise();
      
      console.log('Data in DB:', data);
      return data;
    } catch (err) {
      console.error('Error querying DynamoDB:', err);
      throw err;
    }
  }
  // Query DynamoDB
  async function queryDynamoDB(serialNumber) {
    try {
      const data = await dynamodb.query({
        TableName: dynamotable,
        // IndexName: "serialnumber-index",
        KeyConditionExpression: '#serialNumber = :ser_id',
        ExpressionAttributeNames: {
          '#serialNumber': 'serialNumber'
        },
        ExpressionAttributeValues: {
          ':ser_id': { 'S': serialNumber.toString() }
        },
        ProjectionExpression: 'serialNumber, holeNumber',
        ScanIndexForward: false,
        Limit: 1
      }).promise();

        if(data.Items.length > 0) {
          console.log('Previous hole recorded is:', data.Items[0].holeNumber.N);
          return data;
      } else {
          console.log('No entries must be first hole');

          // Return an object with holeNumber set to 0
          return {
              Items: [{
                  holeNumber: { N: "0" }
              }]
          };
      }
    } catch (err) {
        console.error('Error querying DynamoDB:', err);
        throw err;
    }
  }
  
async function updateScorecard(existingData, serialNumber, strokes) {
    try {
  
      if (existingData.Count === 0) {
        // No existing entry found, add the new entry for the first hole
        const firstHoleNumber = 1;
  
        // Add the new entry to the DynamoDB table
        await dynamodb.putItem({
          TableName: dynamotable,
          Item: {
            'serialNumber': { S: serialNumber },
            'holeNumber': { N: firstHoleNumber.toString() },
            'strokes': { N: strokes.toString() }
          }
        }).promise();
  
        console.log('New entry added for the first hole');
        return;
      }
    let nextHoleNumber = 1;
      if (existingData.Count > 0) {
        const oldHoleNumber = parseInt(existingData.Items[0].holeNumber.N);
        nextHoleNumber = oldHoleNumber + 1;
        console.log('Previous Hole number:', oldHoleNumber);
        console.log('New Hole Entry:', nextHoleNumber);
      } else {
        console.log('No data in DB yet for serialNumber');
      }

      await dynamodb.putItem({
        TableName: dynamotable,
        Item: {
          'serialNumber': { S: serialNumber },
          'holeNumber': { N: nextHoleNumber.toString() },
          'strokes': { N: strokes.toString() }
        }
      }).promise();
  
      console.log('New entry added successfully');
    } catch (err) {
      console.error('Error updating scorecard:', err);
      throw err;
    }
  }
  async function deleteObjectsInS3(serialNumber) {
    try {
      const data = await s3.listObjects({
        Bucket: 'golf-strokes-recorded',
        Prefix: `${serialNumber}/`
      }).promise();
  
      if (data.Contents.length === 0) {
        console.log('No objects found in S3 for the given serial number');
        return;
      }
  
      const objectsToDelete = data.Contents.map(obj => ({ Key: obj.Key }));
      const deleteParams = {
        Bucket: 'golf-strokes-recorded',
        Delete: { Objects: objectsToDelete }
      };
  
      await s3.deleteObjects(deleteParams).promise();
      console.log('Objects deleted successfully from S3');
    } catch (err) {
      console.error('Error deleting objects from S3:', err);
      throw err;
    }
  }
  // Handle the DOUBLE click type
  async function handleDoubleClick(event) {
    const serialNumber = event.deviceInfo.deviceId;
  
    // List the objects in S3
    const data = await listObjectsInS3(serialNumber);
  
    // Get the number of strokes
    const strokes = await getNumberOfStrokes(data);
  
    // Query DynamoDB
    const dynamoDBData = await queryDynamoDB(serialNumber);
  
    // Update the scorecard
    await updateScorecard(dynamoDBData, serialNumber, strokes);

    await deleteObjectsInS3(serialNumber);
  }
    // Switch on the click type
    switch (clicktype) {
        case 'SINGLE':
          // Put the object in S3
          console.log('Performing SINGLE click operation');
          await s3
            .putObject({
              Bucket: 'golf-strokes-recorded',
              Key: `${serialNumber}/${date}`,
              Body: 'stroke',
              ContentType: 'application/json',
            })
            .promise();
          console.log(`Added a stroke for ${serialNumber}!`);
          break;
      
        case 'DOUBLE':
          console.log('Performing DOUBLE click operation');
          await handleDoubleClick(event);
          break;

          case 'LONG':
            console.log('Performing LONG click operation');
          
            // Collect holes and strokes from DynamoDB
            const dynamoDBData = await queryStokeData(serialNumber);
          
            // Prepare the message with holes and strokes
            let message = `Serial Number: ${serialNumber}\n\nHoles and Strokes:\n`;
            dynamoDBData.Items.forEach(item => {
              const holeNumber = item.holeNumber.N;
              const strokes = item.strokes.N;
              message += `Hole ${holeNumber}: ${strokes} strokes\n`;
            });
          
            // Create the message parameters
            const snsParams = {
              Message: message,
              Subject: `Holes and Strokes for Serial Number: ${serialNumber}`,
              TopicArn: snsTopicArn,
            //   PhoneNumber: phoneNumber
            };
          
            // Publish the message to SNS
            try {
              const snsResult = await SNS.publish(snsParams).promise();
              console.log('Message published to SNS:', snsResult);
            } catch (error) {
              console.error('Error publishing message to SNS:', error);
              throw error;
            }
          
            console.log('LONG click operation completed');
            break;


      default:
        console.log(`Unknown click type: ${clicktype}`);
        break;
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
