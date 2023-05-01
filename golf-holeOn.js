/**
  * Test Function
**/

test = function() {
	var res1 = {"items": [{"course": {"S": "Columbia"}, "name": {"S": "Ryan"}, "serialNumber": {"S": "G030PMXXXXXXXXXX"} }], "Count": 1, "ScannedCount": 1 };
	var res1v2 = {"items": [{"2": {"S": "5"}, "hole-2": {"S": "5"}, "course": {"S": "Columbia"}, "name": {"S": "Ryan"}, "serialNumber": {"S": "G030PMXXXXXXXXXX"} }], "Count": 1, "ScannedCount": 1 };
	var res2 = {"items": [{"1": {"S": "5"}, "hole-1": {"S": "5"}, "course": {"S": "Columbia"}, "name": {"S": "Ryan"}, "serialNumber": {"S": "G030PMXXXXXXXXXX"} }], "Count": 1, "ScannedCount": 1 };
	var res4 = {"items": [{"1": {"S": "5"}, "hole-1": {"S": "5"}, "3": {"S": "5"}, "hole-3": {"S": "5"}, "2": {"S": "5"}, "hole-2": {"S": "5"}, "course": {"S": "Columbia"}, "name": {"S": "Ryan"}, "serialNumber": {"S": "G030PMXXXXXXXXXX"} }], "Count": 1, "ScannedCount": 1 };
	var res13 = {"items": [{"1": {"S": "5"}, "hole-1": {"S": "5"}, "18": {"S": "5"}, "hole-18": {"S": "5"}, "2": {"S": "5"}, "hole-2": {"S": "5"}, "3": {"S": "5"}, "hole-3": {"S": "5"}, "4": {"S": "5"}, "hole-4": {"S": "5"}, "5": {"S": "5"}, "hole-5": {"S": "5"}, "6": {"S": "5"}, "hole-6": {"S": "5"}, "7": {"S": "5"}, "hole-7": {"S": "5"}, "8": {"S": "5"}, "hole-8": {"S": "5"}, "9": {"S": "5"}, "hole-9": {"S": "5"}, "10": {"S": "5"}, "hole-10": {"S": "5"}, "11": {"S": "5"}, "hole-1": {"S": "5"}, "12": {"S": "5"}, "hole-12": {"S": "5"}, "course": {"S": "Columbia"}, "name": {"S": "Ryan"}, "serialNumber": {"S": "G030PMXXXXXXXXXX"} }], "Count": 1, "ScannedCount": 1 };
	var res3 = {"items": [{"1": {"S": "5"}, "hole-1": {"S": "5"}, "18": {"S": "5"}, "hole-18": {"S": "5"}, "2": {"S": "5"}, "hole-2": {"S": "5"}, "course": {"S": "Columbia"}, "name": {"S": "Ryan"}, "serialNumber": {"S": "G030PMXXXXXXXXXX"} }], "Count": 1, "ScannedCount": 1 };

	console.assert(holeOn(res1.items) === 1, 'wrong hole!');
	console.assert(holeOn(res1v2.items) === 1, 'wrong hole!');
	console.assert(holeOn([]) === 1, 'wrong hole!');
	console.assert(holeOn(res2.items) === 2, 'wrong hole!');
	console.assert(holeOn(res4.items) === 4, 'wrong hole!');
	console.assert(holeOn(res13.items) === 13, 'wrong hole!');
	console.assert(holeOn(res3.items) === 3, 'wrong hole!');

	console.assert(holeOn2(res1) === 1, 'wrong hole!');
	console.assert(holeOn2(res1v2) === 1, 'wrong hole!');
	console.assert(holeOn2(res2) === 2, 'wrong hole!');
	console.assert(holeOn2(res4) === 4, 'wrong hole!');
	console.assert(holeOn2(res13) === 13, 'wrong hole!');
	console.assert(holeOn2(res3) === 3, 'wrong hole!');

	console.log('All tests executed');
}

/**
  * Final Solution
**/

holeOn = function(items) {
	// get all holes played
    let holes = items.flatMap(e => Object.keys(e).filter(k => !isNaN(k)));
    // create a sparse array with the max number of holes
    let sparseArray = new Array(18);
    // populate the sparse array according to the holes played
    items.forEach( x => { holes.map(ki => sparseArray[+ki - 1] = x[ki]) } );

    // get the first empty position from the sparse array (indexes start at 0)
    return sparseArray.findIndex(x => x===undefined) + 1;
}


/**
  * Final Solution - direct dynamodb result compatible
**/

holeOn2 = function(result) {
	if (!result.items) {
		console.error('No items list in the response');
	}
	// get all holes played
    let holes = result.items.flatMap(e => Object.keys(e).filter(k => !isNaN(k)));
    // create a sparse array with the max number of holes
    let sparseArray = new Array(18);
    // populate the sparse array according to the holes played
    result.items.forEach( x => { holes.map(ki => sparseArray[+ki - 1] = x[ki]) } );

    // get the first empty position from the sparse array (indexes start at 0)
    return sparseArray.findIndex(x => x===undefined) + 1;
}