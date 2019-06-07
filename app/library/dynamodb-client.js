const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;

AWS.config.update({
  region: region,
  endpoint: 'https://dynamodb.us-east-1.amazonaws.com/',
});

let awsDynamoClient = new AWS.DynamoDB.DocumentClient();

function writeStrokesToDynamo(organization) {
  let params = {
    TableName: process.env.SCORE_CARD_TABLE,
    Item: organization,
  };

  return awsDynamoClient.put(params).promise();
}

function removeMechanicalChrisData(organization) {
  let params = {
    TableName: process.env.MECHANICAL_CHRIS_TABLE,
    Key: {
      'id': organization.id,
    },
  };

  return awsDynamoClient.delete(params).promise();
}

function retrieveOnlyOrg(name, month, year) {
  let params = {
    TableName: process.env.MECHANICAL_CHRIS_TABLE,
    Select: 'ALL_ATTRIBUTES',
    ExpressionAttributeValues: {
      ':name': name,
      ':year': year,
      ':month': month,
    },
    FilterExpression: 'billingGroupId = :name AND billingYear = :year AND billingMonth = :month',
  };

  return awsDynamoClient.scan(params).promise()
    .then((data) => {
      if (data.Count !== 1) {
        winston.error('Did not receive a single org: ', data.Items);
        return {data: {}, count: 0};
      } else {
        return {data: data.Items[0], count: data.Count};
      }
    });
}

module.exports.writeOrganizationToMechanicalChris = writeOrganizationToMechanicalChris;
module.exports.removeMechanicalChrisData = removeMechanicalChrisData;
module.exports.retrieveOnlyOrg = retrieveOnlyOrg;
