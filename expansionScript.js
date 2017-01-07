var can = $("#universeCanvas")[0];
var canw = can.width;
var canh = can.height;
var c = can.getContext("2d");

var PLANETS_NUMBER = 10;
var planetsArray = [];                           						//Contains all the planet inside the universe

begin()

function begin(){
    
	var start = null; 													// start will contains actual time expressed in milliseconds
	var t = null;

	var next = function(time)
	{
		if(!start){
			start = time; 												// set start during the first "next()" call
			setUniversePlanets();										// creating the planets(their radius, position..)
			setPlanetsLink();											// creating links between planets(at least 1-per planet)
		}
		t = (time - start)/1000.0; 										// In every loop t will be the seconds passed from previous iteration
		start = time;

		
		c.clearRect(0, 0, canw, canh);
		planetsArray.map(drawLinks);									// Drawing links between planets
		planetsArray.map(drawPlanet);									// Drawing planets


		window.requestAnimationFrame(next);
	}
	window.requestAnimationFrame(next);
}

function setUniversePlanets(){
	var pos_x = -1;
	var pos_y = -1;
	var rad;
    for(i=0; i<PLANETS_NUMBER; ++i){
		rad = Math.floor((Math.random() * 30)) + 15;												//creating random radius between 20 and 50
		
		pos_x = Math.floor((Math.random()*canw/PLANETS_NUMBER - 10))+(canw/PLANETS_NUMBER-10)*i;	// We divide the canvas in #PLANETS_NUMBER vertical strips. Then we generate one random number in every strip. This will be the x position
		if(pos_x>1150) pos_x -= 50;																	//when x is too close to the canvas right edge we move x to the left
		if(pos_x<50) pos_x += 50																	//when x is too close to the canvas left edge we move x to the right

		/* We generate a random y position. If the planet created collides with another one, we generate a new y coordinate*/
		while(pos_y == -1){
			pos_y =  Math.floor((Math.random() * canh));
			if(pos_y>550) pos_y -= 50;																// When y is too close to bottom edge, we move y up								
			if(pos_y<50) pos_y += 50																// When y is too close to top edge, we move y down

			for(j=0; j<i; ++j){																					// We look up for collision only with the planet that were previously created
				var jth_planet = planetsArray[j];
				var dist = Math.sqrt(Math.pow(pos_x-jth_planet.x, 2) + Math.pow(pos_y-jth_planet.y, 2));		// Calculating distance between current planet and the other
				if(dist<(rad+jth_planet.radius+ 30)){
					pos_y = -1;
					break;
				}
			}
		}
			
		planetsArray.push({																			// No more collisions, we can add the planet to planetsArray
			x: pos_x,
			y: pos_y,
			radius: rad,
			colorTheme: "#3322FF",
			closerPlanets: null
		});
		pos_x = -1;
		pos_y = -1;
    }
}

function setPlanetsLink(){
	var maxDist = Math.sqrt(Math.pow(canw,2) + Math.pow(canh, 2));
	var currentPlanet = null;
	var nextPlanet = null;
	var firstIndex = -1;
	var secondIndex = -1;
	var thirdIndex = -1;
	var firstDist = maxDist;
	var secondDist = maxDist;
	var thirdDist = maxDist;
	var currentDist = -1;

	//Looking for the 3 closest planets
	for(i=0; i<PLANETS_NUMBER; ++i){
		currentPlanet = planetsArray[i];
		for(j=0; j<PLANETS_NUMBER; ++j){

			if(i!=j){																			// Otherwise, the distance will be 0!
				nextPlanet = planetsArray[j];
				currentDist = Math.sqrt(Math.pow(currentPlanet.x-nextPlanet.x, 2) + Math.pow(currentPlanet.y - nextPlanet.y, 2));
				//console.log(currentDist);

				if(currentDist < firstDist){													// When currentDist < firstDist, the j-th planet is the closest so we have to:
					thirdDist = secondDist;														// move the 2nd closest planet as the 3rd closest planet
					thirdIndex = secondIndex;
					secondDist = firstDist;														// move the 1st closest planet as the 2nd closest planet
					secondIndex = firstIndex;

					firstDist = currentDist;													// set the j-th planet as the closest!
					firstIndex = j;		
				}
				else{																			// Otherwise we have to check whether currentDist < secondDist.. 
					if(currentDist < secondDist){
						thirdDist = secondDist;
						thirdIndex = secondIndex;

						secondDist = currentDist;
						secondIndex = j;
					}
					else{
						if(currentDist < thirdDist){
							thirdDist = currentDist;
							thirdIndex = j;
						}
					}
				}
			}	
		}
		planetsArray[i].closerPlanets = [firstIndex, secondIndex, thirdIndex];
		//console.log("Piu' vicini:" + firstIndex + " " + secondIndex + " " + thirdIndex);
		
		var firstIndex = -1;
		var secondIndex = -1;
		var thirdIndex = -1;
		var firstDist = maxDist;
		var secondDist = maxDist;
		var thirdDist = maxDist;
	}

	/*
	*	Now we eliminate wrong links:
	*	currentPlanet is the planet whom you are checking links
	*	planet2check is the target of a link
	*	planetInters is the planet that MAYBE is intersected by the link between currentPlanet and planet2Check
	*
	*		 _______										 _______										 _______
	*		|		|_______________________________________|_______|______________________________________	|		|
	*		|_______|										|_______|										|_______|
	*		currentPlanet									planetInters									planet2Check
	*/
	var newLinksArray = [];
	var planet2check = null;
	var planetInters = null
	var m;																						// m between centers
	var q;
	var m_perp;																					// m of the perpendicular line between centers
	var flpr;																					// find line parameter result: array containg [m,q]
	var intersPoint;																			// point of the intersection
	var wrongLinksArray = [0,0,0];

	for(i=0; i<PLANETS_NUMBER; ++i){
		//console.log("i= " + i);
		currentPlanet = planetsArray[i];

		for(j=1; j<currentPlanet.closerPlanets.length; ++j){
			planet2check = planetsArray[currentPlanet.closerPlanets[j]];
			for(k=0; k<j; ++k){
				planetInters = planetsArray[currentPlanet.closerPlanets[k]];
				flpr = findLineParameters(currentPlanet.x, currentPlanet.y, planet2check.x, planet2check.y);
				m = flpr[0];
				q = flpr[1];
				
				m_perp = -1/(m);										// Line angular coefficient, perpendicular to the link
				q_perp = planetInters.y - m_perp*planetInters.x;		// Line intercept coefficient

				intersPoint = lineIntersection(m, q, m_perp, q_perp);	// Intersection between the link and the perpendicular line
				
				// When the distance between the intersection point and the center of planetInters is less than radius+50 we mark this link as a wrong link
				if(distanceBetweenPoints(intersPoint, [planetInters.x, planetInters.y]) < (planetInters.radius + 50 )) wrongLinksArray[j] = 1;
			}
		}
		if(wrongLinksArray[2] == 1)currentPlanet.closerPlanets.splice(2,1);
		if(wrongLinksArray[1] == 1)currentPlanet.closerPlanets.splice(1,1);
			
		wrongLinksArray = [0,0,0];
	}

	//Now we let know a planet all is links, because right now, a planet A couldn't know that is linked with another planet B because A
	//has its closer planets(and B isn't one of them), but A could be one of the closer planets from B's point of view
	/*for(i=0; i<PLANETS_NUMBER; ++i){
		currentPlanet = planetsArray[i];
		for(j=0; j<PLANETS_NUMBER; ++j){
			if(i!=j){
				nextPlanet = planetsArray[j];
				console.log(nextPlanet.closerPlanets.length);
				for(k=0; k<nextPlanet.closerPlanets.length; k++){
					if(nextPlanet.closerPlanets[k] == i){
						if(!alreadyConnected(i,j)){
							//currentPlanet.closerPlanets.push(j);
						} 
					}
				}
			}
		}
	}*/

	// Now we handle the problem about isolated sub-systems
	var fullyConnected = false;
	var reachable = new Array(PLANETS_NUMBER);						//The array of the reachable planets
	var reachableQueue = [];
	var nextInQueue;
	reachable[0] = true;
	//while(!fullyConnected){
		currentPlanet = planetsArray[0];			//We check whether from the first planet we can reach the last one
		for(j=1; j<reachable.length; ++j) reachable[j] = false;
		for(j=0; j<currentPlanet.closerPlanets.length; ++j ) {
			reachable[currentPlanet.closerPlanets[j]] = true;			//Getting the neighbours, setting them as reachable
			reachableQueue.push(currentPlanet.closerPlanets[j])			//Adding the neighbours to the queue we have to check
		}

		while(reachableQueue.length != 0){
			nextIndexInQueue = reachableQueue.shift();						//Taking the first element of the queue
			console.log("Next index: " + nextIndexInQueue);
			nextPlanet = planetsArray[nextIndexInQueue];
			for(j=0; j<nextPlanet.closerPlanets.length; ++j){
				if(reachable[nextPlanet.closerPlanets[j]]==false){			//If we haven't visited this neighbour yet, now it's time to do it
					reachable[nextPlanet.closerPlanets[j]] = true;
					reachableQueue.push(nextPlanet.closerPlanets[j]);
				}
			}
		}
		if(checkReachable(reachable)) console.log("Fully connected!");
		else console.log("Not connected! :(");

	//}
	
}

//Check whether b is in the closerPlanets list of a
function alreadyConnected(a, b){
	var alrConn = false;
	for(i=0; i<planetsArray[a].closerPlanets.length; ++i){
		if(planetsArray[a].closerPlanets[i] == b){
			alrConn = true;
			break;
		}
	}

	return alrConn;
}

function checkReachable(a){
	var boolVal = true
	for(i=0; i<a.length; ++i){
		if(a[i]==false){
			boolVal = false;
			break;
		}
	}
	return boolVal;
}



function drawPlanet(p){
	//console.log("disegno");
	c.beginPath();
	c.arc(p.x, p.y, p.radius, 0, 2*Math.PI); 
	c.fillStyle = p.colorTheme;
	c.fill();
}

function drawLinks(p){
	var nextPlanet = null;
	for(i=0; i<(p.closerPlanets.length); ++i){
		nextPlanet = planetsArray[p.closerPlanets[i]];
		c.strokeStyle = "#55CC11";
		c.lineWidth = 3;
		c.beginPath();
		c.moveTo(p.x, p.y);
		c.lineTo(nextPlanet.x, nextPlanet.y);
		c.stroke();
	}
}


window.onresize = function(){
	can.height = canh = $("#autoscale")[0].clientHeight;
	can.width = canw = $("#autoscale")[0].clientWidth;
};

$("#universeCanvas").mousedown(function(e){
	console.log("CLICKED!" + e.offsetX + " " + e.offsetY);
});