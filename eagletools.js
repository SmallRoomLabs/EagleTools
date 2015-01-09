
// Return the value of the specified form field as an float and update it back
// to the field to remove any invalid characters
function getAndUpdateNumericFormField(name) {
	var v=parseFloat(document.getElementById(name).value);
	document.getElementById(name).value=v;
	return v;
}


// Return the value of the specified form field as an space trimmed string and 
// update it back to the field trimmed
function getAndUpdateStringFormField(name) {
	var v=document.getElementById(name).value.trim();
	document.getElementById(name).value=v;
	return v;
}


// Converts numeric degrees to radians
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180.0;
  }
}


//
// Redraw the preview canvas according to the values from the form fields
//
function RefreshPreview() {
	// PCB size in mm
	var pcbW=getAndUpdateNumericFormField("pcbw");
	var pcbH=getAndUpdateNumericFormField("pcbh");
	// Circle/arc center position in mm
	var centerX=getAndUpdateNumericFormField("centery");			
	var centerY=getAndUpdateNumericFormField("centerx");
	// Circle/arc radius in mm
	var radius=getAndUpdateNumericFormField("radius");
	// Circle/arc start and end positios in degrees
	// 0=12 o'clock, 90=3 o'clock, 180=6 o'clock
	var angleStart=getAndUpdateNumericFormField("anglestart");
	var angleEnd=getAndUpdateNumericFormField("angleend");
	// How many items/points should there be on the circle/arc
	var angleSteps=getAndUpdateNumericFormField("steps");
	// Size of each item/dot in mm, used for preview only
	var dotsize=6;
	// Name Eagle part to be handled
	var part=getAndUpdateStringFormField("part");
	// If the parts are to be rotated ot not
	var rotateEnable=document.getElementById("rotateenable").checked;
	// The rotation offset for the first part
	var rotateOffset=getAndUpdateNumericFormField("rotateoffset");

//	var partType="circle";
	var partType="rectangle"
	var partColor="magenta";

	console.log("----------------------------");

	var canvas=document.getElementById('preview');
	var ctx=canvas.getContext('2d');

	// Adjust the circle to have 0 degrees on top
	var angleS=angleStart+90.0;
	var angleE=angleEnd+90.0;

	// If a full circle is requested then we need to reduce the step size
	// so the first and last place dosen't overlap
	var fullCircleAdjust=1;
	if (((angleS-angleE)%360)==0) fullCircleAdjust=0;
	console.log("fullCircleAdjust="+fullCircleAdjust+" S="+(angleS%360)+" E="+(angleE%360));

	var angleDelta=(angleE-angleS)/(angleSteps-fullCircleAdjust);
	var angle=angleS;

	// Extract Part name and number
	var myPart=part;
	var myPartNumber=0;
	var multiplier=1;
	while (1) {
		var ch=myPart.substr(-1,1);
		if (ch>='0' && ch<='9') {
			myPartNumber+=parseInt(ch)*multiplier;
			multiplier*=10;
			myPart=myPart.substr(0,myPart.length-1);
		} else {
			break;
		}
	}

	partAngle=rotateOffset;

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle=partColor;
	ctx.strokeStyle=partColor;
	ctx.beginPath();
	var cmd="";
	for (var i=0; i<angleSteps; i++) {
	    var myX = centerX + radius * Math.cos(angle.toRad());
    	var myY = centerY + radius * Math.sin(angle.toRad());
    	cmd+="MOVE '"+myPart+myPartNumber+"' ("+(+myX.toFixed(3))+" "+(+myY.toFixed(3))+");";
    	if (rotateEnable) cmd+="ROTATE =R"+partAngle+" '"+myPart+myPartNumber+"';";
		if (partType=="rectangle") {
			ctx.rect(myX-dotsize/2,myY-dotsize/2,dotsize,dotsize);
			ctx.stroke();
		} else if (partType=="circle") {
			ctx.arc(myX, myY, dotsize, 0, Math.PI*2, true); 
			ctx.stroke();
		}
		angle-=angleDelta;
		partAngle+=angleDelta;
		myPartNumber++;
	}
	ctx.closePath();
	document.getElementById("cmd").value=cmd;
}

RefreshPreview();
