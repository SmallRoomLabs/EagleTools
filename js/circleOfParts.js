"use strict";

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

	var F=getAllFormElements('theform');

	// // PCB size in mm
	// var pcbW=getAndUpdateNumericFormField("pcbw");
	// var pcbH=getAndUpdateNumericFormField("pcbh");
	// var pcbR=getAndUpdateNumericFormField("pcbr");
	// // Circle/arc center position in mm
	// var centerX=getAndUpdateNumericFormField("centerx");			
	// var centerY=getAndUpdateNumericFormField("centery");
	// // Circle/arc radius in mm
	// var radius=getAndUpdateNumericFormField("radius");
	// // Circle/arc start and end positios in degrees
	// // 0=12 o'clock, 90=3 o'clock, 180=6 o'clock
	// var angleStart=getAndUpdateNumericFormField("anglestart");
	// var angleEnd=getAndUpdateNumericFormField("angleend");
	// // How many items/points should there be on the circle/arc
	// var angleSteps=getAndUpdateNumericFormField("steps");
	// // Name Eagle part to be handled
	// var part=getAndUpdateStringFormField("part");
	// // If the parts are to be rotated ot not
	// var rotateEnable=document.getElementById("rotateenable").checked;
	// // The rotation offset for the first part
	// var rotateOffset=getAndUpdateNumericFormField("rotateoffset");
	// // The part size 
	// var partR=getAndUpdateNumericFormField("partradius");
	// var partW=getAndUpdateNumericFormField("partw");
	// var partH=getAndUpdateNumericFormField("parth");

	console.log(F);
	console.log("pcbw,h="+F.pcbw+' '+F.pcbh);
		
	// Calculate the correct scaling factor to utilize the maximum of the canvas size
	if (canvasW/F.pcbW > canvasH/F.pcbH) {
        var scale=canvasH/F.pcbh;
	} else {
        var scale=canvasW/F.pcbw;
	}

	var canvas=document.getElementById('preview');
	var ctx=canvas.getContext('2d');

	// Adjust the circle to have 0 degrees on top
	var angleS=F.anglestart-90.0;
	var angleE=F.angleend-90.0;

	// If a full circle is requested then we need to reduce the step size
	// so the first and last place dosen't overlap
	var fullCircleAdjust=1;
	if (((angleS-angleE)%360)==0) fullCircleAdjust=0;
	var angleDelta=(angleE-angleS)/(F.steps-fullCircleAdjust);
	var angle=angleS;

	// Extract Part name and number
	var myPart=F.part;
	var myPartNumber=0;
	var multiplier=1;
	while (1) {
		var ch=myPart.substr(-1,1);
		if (ch>='0' && ch<='9') {
			myPartNumber+=parseInt(ch)*multiplier;
			multiplier*=10;
			myPart=myPart.substr(0,myPart.length-1).toLowerCase();
		} else {
			break;
		}
	}

	// Pre-rotate the part
	var partAngle=-F.rotateoffset;

	drawBlankPCB(ctx, F, scale, PCBCOLOR);

    // Calculate and draw the parts 
	ctx.fillStyle=SILKCOLOR;
	ctx.strokeStyle=SILKCOLOR;
	ctx.beginPath();
	var cmd="";
	for (var i=0; i<F.steps; i++) {
		// Calculate for Eagle
	    var x=F.centerx + F.radius*Math.cos(angle.toRad());
    	var y=F.centerx - F.radius*Math.sin(angle.toRad());
    	cmd+="mov '"+myPart+myPartNumber+"' ("+(+x.toStringMaxDecimals(3))+" "+(+y.toStringMaxDecimals(3))+");";
    	if (F.enable) cmd+="ro =R"+partAngle.toStringMaxDecimals(3)+" '"+myPart+myPartNumber+"';";
    	// Calculate for screen
	    x=F.centerx + radius*Math.cos(angle.toRad());
    	y=F.centery + radius*Math.sin(angle.toRad());
    	// Draw the item on the screen
		ctx.beginPath();
		if (F.part_type=="R") {
			drawRotatedRect(ctx, x*scale, y*scale, F.partw*scale, F.parth*scale, -partAngle);
		} else if (F.part_type=="C") {
			ctx.arc(x*scale, y*scale, F.partradius*scale, 0, Math.PI*2, true); 
			ctx.stroke();
		}
		ctx.closePath();
		// Update angle on circle/arc, component rotation and component name
		angle+=angleDelta;
		partAngle-=angleDelta;
		myPartNumber++;
	}
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


//
// Build the HTML code to put into the form 
//
var form='';


form+=generateFormSelect('PCB type', 'pcb_type', 'UpdatePCBtype()',
	'R','Rectangular',
	'C','Circular'
);

	form+=generateFormEntry('PCB W,H','pcb_rectangle',
		'pcbw', 'number', null, null, null, 80, 'RefreshPreview()',
		'pcbh', 'number', null, null, null, 80, 'RefreshPreview()'
	);

	form+=generateFormEntry('PCB Radius','pcb_circle',
		'pcbr', 'number', null, null, null, 40, 'RefreshPreview()',
		null, null, null, null, null, null, null
	);

form+=generateFormEntry('Circle Start,Length','',
	"anglestart", "number", 0, 360, 45, 0, "RefreshPreview()",
	"angleend",   "number", 0, 360, 45, 360, "RefreshPreview()"
);

form+=generateFormEntry('Center X,Y','',
	"centerx", "number", null, null, null, 40, "RefreshPreview()",
	"centery", "number", null, null, null, 40, "RefreshPreview()"
);

form+=generateFormEntry('Circle radius','',
	"radius", "number", null, null, null, 40, "RefreshPreview()",
	null, null, null, null, null, null, null
);

form+=generateFormEntry('No of steps','',
	"steps", "number", 1, 256, 1, 24, "RefreshPreview()",
	null, null, null, null, null, null, null
);

form+=generateFormEntry('Part Name','',
		"part", "text", null, null, null, "LED1", "RefreshPreview()",
		null, null, null, null, null, null, null
);

// TODO : Replace this with a checkbox generator
form+=generateFormSelect('Rotate part enable', 'rotateenable', 'RefreshPreview()',
	'0','Disabled',
	'1','Enabled'
);

form+=generateFormEntry('Rotate part offset','',
		"rotateoffset", "number", 0, 360, 45, 0, "RefreshPreview()",
		null, null, null, null, null, null, null
);

form+=generateFormSelect('Part type', 'part_type', 'UpdateParttype()',
	'R','Rectangular',
	'C','Circular'
);

	form+=generateFormEntry('Part Width,Height','part_rectangle',
		"partw", "number", null, null, null, 3, "RefreshPreview()",
		"parth", "number", null, null, null, 6, "RefreshPreview()"
	);

	form+=generateFormEntry('Part Radius','part_circle',
		"partradius", "number", 1, 100, 0.5, 2.5, "RefreshPreview()",
		null, null, null, null, null, null, null
	);

$("#theform").html(form);



var parttype='R';
var pcbtype='R';
UpdateParttype();
UpdatePCBtype();
RefreshPreview();

