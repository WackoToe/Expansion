$("#universeCanvas").mousedown(function(e)
{
	var planIndSel;                                         //planIndSel is the index of the planet selected, returned by the function bodySelected
	var cp;
	var p;
	planIndSel = bodySelected(e.offsetX, e.offsetY);
	//console.log("The index is: " + planIndSel);
	//.children()[0]
	cp = $("#planetInfo");
	if(planIndSel != -1) {
        p = planetsArray[planIndSel];
        cp.radius = p.radius;
		cp.show();
		console.log(cp.radius);
    }
	else{
		cp.hide();
	}
});

function bodySelected(x, y){
	var s1=0;
	var _planSel = -1;					                    //Variable that tell us whether a planet is selected
	for(s1=0; s1<planetsArray.length; ++s1){
		if(Math.sqrt((x-planetsArray[s1].x)*(x-planetsArray[s1].x) + (y-planetsArray[s1].y)*(y-planetsArray[s1].y)) < planetsArray[s1].radius){
			_planSel = s1;
			break;
		}
	}
	return _planSel;
}