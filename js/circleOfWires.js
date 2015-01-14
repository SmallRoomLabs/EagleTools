
// Show the relevant form fields of the desired PCB type
function UpdatePCBtype() {
	pcbtype=$("#pcb_type option:selected").val();
	$("#pcb_circle").addClass('hidden');
	$("#pcb_rectangle").addClass('hidden');
	if (pcbtype=="R") $("#pcb_rectangle").removeClass('hidden');
	if (pcbtype=="C") $("#pcb_circle").removeClass('hidden');
	RefreshPreview();
}


// Show the relevant form fields of the desired Part type
function UpdateParttype() {
	parttype=$("#part_type").val();
	$("#part_circle").addClass('hidden');
	$("#part_rectangle").addClass('hidden');
	if (parttype=="R") $("#part_rectangle").removeClass('hidden');
	if (parttype=="C") $("#part_circle").removeClass('hidden');
	RefreshPreview();
}


//
// Redraw the preview canvas according to the values from the form fields
//
function RefreshPreview() {
    // Canvas size for scaling factors
    var canvasW=650;
    var canvasH=650;
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
	var circleStart=getAndUpdateNumericFormField("anglestart");
	var circleLength=getAndUpdateNumericFormField("angleend");
	// How many items/points should there be on the circle/arc
	var angleSteps=getAndUpdateNumericFormField("steps");
	// Name of the wires to be generated
	var wirename=getAndUpdateStringFormField("wirename");
	// Thickness of the wires to be generated
	var wirewidth=1.0;

	// Calculate the correct scaling factor to utilize the maximum of the canvas size
	if (canvasW/pcbW > canvasH/pcbH) {
        var scale=canvasH/pcbH;
	} else {
        var scale=canvasW/pcbW;
	}

	var canvas=document.getElementById('preview');
	var ctx=canvas.getContext('2d');

	// Adjust the circle to have 0 degrees on top
	var circleS=circleStart-90.0;

	// If a full circle is requested then we need to reduce the step size
	// so the first and last place dosen't overlap
//	var fullCircleAdjust=1;
//	if (((angleS-angleE)%360)==0) fullCircleAdjust=0;
//	var angleDelta=(angleE-angleS)/(angleSteps-fullCircleAdjust);
	var angle=circleS;
	var angleDelta=circleLength/angleSteps;

	// Clear canvas and draw the pcb
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle=PCBCOLOR;
	ctx.beginPath();
	if (pcbtype=='R') {
		ctx.fillRect(0, 0, pcbW*scale,pcbH*scale);
		ctx.stroke();
	}
	if (pcbtype=='C') {
		ctx.arc(pcbR*scale, pcbR*scale, pcbR*scale, 0, Math.PI*2, true);
      	ctx.fill();
    }
    ctx.closePath();

    // Calculate and draw the parts 
	ctx.strokeStyle=SILKCOLOR;
	ctx.beginPath();
	var cmd="set wire_bend 2;wire '"+wirename+"' "+wirewidth+" ";
	for (var i=0; i<angleSteps+1; i++) {
		// Calculate for Eagle
	    var x=centerX + radius*Math.cos(angle.toRad());
    	var y=centerY - radius*Math.sin(angle.toRad());
    	if (i==0) {
    		var firstX=x;
    		var firstY=y;
    	}
    	cmd+="("+(+x.toStringMaxDecimals(3))+" "+(+y.toStringMaxDecimals(3))+") ";
    	// Calculate for screen
	    x=centerX + radius*Math.cos(angle.toRad());
    	y=centerY + radius*Math.sin(angle.toRad());
    	// Draw the item on the screen
		if (i==0) {
			var xFirstCanvas=x;
			var yFirstCanvas=y;
			ctx.moveTo(x*scale, y*scale);
		} else {
			ctx.lineTo(x*scale, y*scale);
		}
		// Update angle on circle/arc, component rotation and component name
		angle+=angleDelta;
	}
	// Only close if full circle
//	if (circleLength==360) {
		ctx.lineTo(xFirstCanvas*scale, yFirstCanvas*scale);
		cmd+="("+(+firstX.toStringMaxDecimals(3))+" "+(+firstY.toStringMaxDecimals(3))+")";
	}
	ctx.stroke();
	ctx.closePath();
	cmd+=';';
	// Insert the eagle command into the copy button and the visible div
	document.getElementById("eaglecmds-button").setAttribute("data-clipboard-text", cmd);
	document.getElementById("eaglecmds").innerHTML=cmd;
}


// Initialize & handle the copy-to-clipboard button functionality
 var zcEagle = new ZeroClipboard(document.getElementById("eaglecmds-button"));
 zcEagle.on("ready", function(readyEvent) {
   zcEagle.on("aftercopy", function(event) {
	$('#eaglecmds').css({opacity: 0});
	$('#eaglecmds').animate({opacity: 1}, 500 );
   });
 });


var parttype='R';
var pcbtype='R';
UpdateParttype();
UpdatePCBtype();
RefreshPreview();
