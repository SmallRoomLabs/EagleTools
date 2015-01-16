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
		
	// Calculate the correct scaling factor to utilize the maximum of the canvas size
	if (canvasW/F.pcbW > canvasH/F.pcbH) {
        var scale=canvasH/F.pcbh;
	} else {
        var scale=canvasW/F.pcbw;
	}

	var canvas=document.getElementById('preview');
	var ctx=canvas.getContext('2d');

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

	drawBlankPCB(ctx, F, scale, PCBCOLOR);

    // Calculate and draw the parts 
	ctx.fillStyle=SILKCOLOR;
	ctx.strokeStyle=SILKCOLOR;
	ctx.beginPath();
	var cmd="";
	var ix=0;
	var iy=0;
	for (var i=0; i<F.countx*F.county; i++) {
		// Calculate for Eagle
	    var x=F.startx+ix*F.spacingx;
    	var y=F.starty+iy*F.spacingy;
    	cmd+="mov '"+myPart+myPartNumber+"' ("+(+x.toStringMaxDecimals(3))+" "+(+y.toStringMaxDecimals(3))+");";
    	if (F.rotateenable) cmd+="ro =R"+F.rotateoffset.toStringMaxDecimals(3)+" '"+myPart+myPartNumber+"';";
    	// Calculate for screen
	    x=F.startx+ix*F.spacingx;
    	y=F.pcbh-F.starty-iy*F.spacingy;
    	// Draw the item on the screen
		ctx.beginPath();
		if (F.part_type=="R") {
			drawRotatedRect(ctx, x*scale, y*scale, F.partw*scale, F.parth*scale, F.rotateoffset);
		} else if (F.part_type=="C") {
			ctx.arc(x*scale, y*scale, F.partradius*scale, 0, Math.PI*2, true); 
			ctx.stroke();
		}
		ctx.closePath();
		// Update component name
		myPartNumber++;
		ix++;
		if (ix>=F.countx) {
			ix=0;
			iy++;
		}
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
	$('#eaglecmds').animate({opacity: 1}, 300);
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

form+=generateFormEntry('Start position X,Y','',
	"startx", "number", null, null, null, 10, "RefreshPreview()",
	"starty", "number", null, null, null, 10, "RefreshPreview()"
);

form+=generateFormEntry('Spacing X,Y','',
	"spacingx", "number", null, null, null, 10, "RefreshPreview()",
	"spacingy", "number", null, null, null, 10, "RefreshPreview()"
);

form+=generateFormEntry('Part count X,Y','',
	"countx", "number", null, null, null, 2, "RefreshPreview()",
	"county", "number", null, null, null, 2, "RefreshPreview()"
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

form+=generateFormEntry('Rotate part angle','',
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

