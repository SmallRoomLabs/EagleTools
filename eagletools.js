
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


// Show the relevant form fields of the desired PCB type
function UpdatePCBtype() {
	pcbtype=document.getElementById("pcb_type").value;
	if (pcbtype=="rectangle") {
		document.getElementById("pcb_rectangle").style.display='block';
		document.getElementById("pcb_circle").style.display='none';
	}
	if (pcbtype=="circle") {
		document.getElementById("pcb_rectangle").style.display='none';
		document.getElementById("pcb_circle").style.display='block';
	}
	RefreshPreview();
}


// Show the relevant form fields of the desired Part type
function UpdateParttype() {
	parttype=document.getElementById("part_type").value;
	if (parttype=="rectangle") {
		document.getElementById("part_rectangle").style.display='block';
		document.getElementById("part_circle").style.display='none';
	}
	if (parttype=="circle") {
		document.getElementById("part_rectangle").style.display='none';
		document.getElementById("part_circle").style.display='block';
	}
	RefreshPreview();
}


function drawRotatedRect(ctx, x,y,width,height,degrees) {
    // first save the untranslated/unrotated context
    ctx.save();

    ctx.beginPath();
    // move the rotation point to the center of the rect
    ctx.translate( x, y );
    // rotate the rect
    ctx.rotate(degrees*Math.PI/180);

    // draw the rect on the transformed context
    // Note: after transforming [0,0] is visually [x,y]
    //       so the rect needs to be offset accordingly when drawn
    ctx.rect( -width/2, -height/2, width,height);

    ctx.fillStyle="gold";
    ctx.fill();

    // restore the context to its untranslated/unrotated state
    ctx.restore();

}


//
// Redraw the preview canvas according to the values from the form fields
//
function RefreshPreview() {
    // Canvas size for scaling factors
    var canvasW=400;
    var canvasH=400;
	// PCB size in mm
	var pcbW=getAndUpdateNumericFormField("pcbw");
	var pcbH=getAndUpdateNumericFormField("pcbh");
	var pcbR=getAndUpdateNumericFormField("pcbr");
	// Circle/arc center position in mm
	var centerX=getAndUpdateNumericFormField("centerx");			
	var centerY=getAndUpdateNumericFormField("centery");
	// Circle/arc radius in mm
	var radius=getAndUpdateNumericFormField("radius");
	// Circle/arc start and end positios in degrees
	// 0=12 o'clock, 90=3 o'clock, 180=6 o'clock
	var angleStart=getAndUpdateNumericFormField("anglestart");
	var angleEnd=getAndUpdateNumericFormField("angleend");
	// How many items/points should there be on the circle/arc
	var angleSteps=getAndUpdateNumericFormField("steps");
	// Name Eagle part to be handled
	var part=getAndUpdateStringFormField("part");
	// If the parts are to be rotated ot not
	var rotateEnable=document.getElementById("rotateenable").checked;
	// The rotation offset for the first part
	var rotateOffset=getAndUpdateNumericFormField("rotateoffset");
	console.log(rotateOffset);
	// The part size 
	var partR=getAndUpdateNumericFormField("partradius");
	var partW=getAndUpdateNumericFormField("partw");
	var partH=getAndUpdateNumericFormField("parth");
	
	var partColor="red";

	
	// Calculate the correct scaling factor to utilize the maximum of the canvas size
	if (canvasW/pcbW > canvasH/pcbH) {
        var scale=canvasH/pcbH;
	} else {
        var scale=canvasW/pcbW;
	}

	var canvas=document.getElementById('preview');
	var ctx=canvas.getContext('2d');

	// Adjust the circle to have 0 degrees on top
	var angleS=angleStart-90.0;
	var angleE=angleEnd-90.0;

	// If a full circle is requested then we need to reduce the step size
	// so the first and last place dosen't overlap
	var fullCircleAdjust=1;
	if (((angleS-angleE)%360)==0) fullCircleAdjust=0;
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

	// Pre-rotate the part
	partAngle=-rotateOffset;

	// Clear canvas and draw the pcb
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle='#58FA58';
	ctx.beginPath();
	if (pcbtype=='rectangle') {
		ctx.fillRect(0, 0, pcbW*scale,pcbH*scale);
		ctx.stroke();
	}
	if (pcbtype=='circle') {
		ctx.arc(centerX*scale, centerY*scale, pcbR*scale, 0, Math.PI*2, true);
      	ctx.fill();
    }
    ctx.closePath();

    // Calculate and draw the parts 
	ctx.fillStyle=partColor;
	ctx.strokeStyle=partColor;
	ctx.beginPath();
	var cmd="";
	for (var i=0; i<angleSteps; i++) {
		// Calculate for Eagle
	    var x=centerX + radius*Math.cos(angle.toRad());
    	var y=centerY - radius*Math.sin(angle.toRad());
    	cmd+="MOVE '"+myPart+myPartNumber+"' ("+(+x.toFixed(3))+" "+(+y.toFixed(3))+");";
    	if (rotateEnable) cmd+="ROTATE =R"+partAngle.toFixed(3)+" '"+myPart+myPartNumber+"';";
    	// Calculate for screen
	    x=centerX + radius*Math.cos(angle.toRad());
    	y=centerY + radius*Math.sin(angle.toRad());
    	// Draw the item on the screen
		ctx.beginPath();
		if (parttype=="rectangle") {
			drawRotatedRect(ctx, x*scale, y*scale, partW*scale, partH*scale, -partAngle);
		} else if (parttype=="circle") {
			ctx.arc(x*scale, y*scale, partR*scale, 0, Math.PI*2, true); 
			ctx.stroke();
		}
		ctx.closePath();
		// Update angle on circle/arc, component rotation and component name
		angle+=angleDelta;
		partAngle-=angleDelta;
		myPartNumber++;
	}
	// Insert the eagle command into the copy button and the visible div
	document.getElementById("copy-button").setAttribute("data-clipboard-text", cmd);
	document.getElementById("cmd").innerHTML=cmd;
}


// Initialize & handle the copy-to-clipboard button functionality
var zcEagle = new ZeroClipboard(document.getElementById("copy-button"));
zcEagle.on("ready", function(readyEvent) {
  zcEagle.on("aftercopy", function(event) {
	var mycolor=document.getElementById("cmd").style.color;
	document.getElementById("cmd").style.color="#FF0000";
	setTimeout(function(){document.getElementById("cmd").style.color=mycolor;},300);
  });
});


var parttype='rectangle';
var pcbtype='rectangle';
RefreshPreview();
