
// Show the relevant form fields of the desired PCB type
function UpdatePCBtype() {
	pcbtype=$("#pcb_type option:selected").val();
	$("#pcb_circle").addClass('hidden');
	$("#pcb_rectangle").addClass('hidden');
	if (pcbtype=="R") $("#pcb_rectangle").removeClass('hidden');
	if (pcbtype=="C") $("#pcb_circle").removeClass('hidden');
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
	if (canvasW/F.pcbw > canvasH/F.pcbh) {
        var scale=canvasH/F.pcbh;
	} else {
        var scale=canvasW/F.pcbw;
	}

	var canvas=document.getElementById('preview');
	var ctx=canvas.getContext('2d');

	// Adjust the circle to have 0 degrees on top
	var circleS=F.anglestart-90.0;
	var angle=circleS;
	var angleDelta=F.angleend/F.text.length;


 	drawBlankPCB(ctx, F, scale, PCBCOLOR);

    // Calculate and draw the parts 
	ctx.font = F.textsize*10+'px "Courier New", Courier, monospace';
	ctx.fillStyle = SILKCOLOR;
	ctx.beginPath();
	var cmd="";//"set wire_bend 2;wire '"+F.wirename+"' "+F.wirewidth+" ";
	for (var i=0; i<F.text.length; i++) {
		// // Calculate for Eagle
	    var x=F.centerx + F.radius*Math.cos(angle.toRad());
     	var y=F.centery - F.radius*Math.sin(angle.toRad());
  //   	if (i==0) {
  //   		var firstX=x;
  //   		var firstY=y;
  //   	}
  //   	cmd+="("+(+x.toStringMaxDecimals(3))+" "+(+y.toStringMaxDecimals(3))+") ";
 
  		cmd+="text '"+F.text.substring(i,i+1)+"'  R"+(-angle-90).toStringMaxDecimals(3)+" ("+x.toStringMaxDecimals(3)+" "+y.toStringMaxDecimals(3)+") ;";
  //   	// Calculate for screen
	    x=F.centerx + F.radius*Math.cos(angle.toRad());
  	   	y=F.centery + F.radius*Math.sin(angle.toRad());
		ctx.save();
		ctx.translate((x-0)*scale,y*scale);
		ctx.rotate((angle+90).toRad());
		ctx.fillText(F.text.substring(i,i+1) ,0,0);
		ctx.restore();

		if (i==0) {
			ctx.moveTo(x*scale, y*scale);
		} else {
			ctx.lineTo(x*scale, y*scale);
		}
		// Update angle on circle/arc, component rotation and component name
		angle+=angleDelta;
	}
	ctx.stroke();

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

form+=generateFormEntry('Circle Start,Length','',
	"anglestart", "number", 0, 360, 15, 270, "RefreshPreview()",
	"angleend",   "number", 0, 360, 15, 180, "RefreshPreview()"
);

form+=generateFormEntry('Center X,Y','',
	"centerx", "number", null, null, null, 40, "RefreshPreview()",
	"centery", "number", null, null, null, 40, "RefreshPreview()"
);

form+=generateFormEntry('Circle radius','',
	"radius", "number", null, null, null, 35, "RefreshPreview()",
	null, null, null, null, null, null, null
);

form+=generateFormEntry('Text','',
	"text", "text", null, null, null, "SmallRoomLabs", "RefreshPreview()",
	null, null, null, null, null, null, null
);

form+=generateFormEntry('Text size','',
	"textsize", "number", 0.5, 20.0, 0.5, 4.0, "RefreshPreview()",
	null, null, null, null, null, null, null
);

form+=generateFormEntry('Layer','',
	"layer", "text", null, null, null, "TOP", "RefreshPreview()",
	null, null, null, null, null, null, null
);


$("#theform").html(form);

var pcbtype='R';
UpdatePCBtype();
RefreshPreview();
