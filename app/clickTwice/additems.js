function ClicksAdded (serialNumber){
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
        var returnData = Object.keys(data.Contents).length;
        console.log("returndata", returnData);
        return returnData;
    }
})}