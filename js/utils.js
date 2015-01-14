var PCBCOLOR='#347235';
var SILKCOLOR='#FFFFFF';



// Return the value of the specified form field as an float and update it back
// to the field to remove any invalid characters
function getAndUpdateNumericFormField(name) {
	var v=parseFloat($('#'+name).val());
	$('#'+name).val(v);
	return v;
}


// Return the value of the specified form field as an space trimmed string and 
// update it back to the field trimmed
function getAndUpdateStringFormField(name) {
	var v=$('#'+name).val().trim();
	$('#'+name).val(v);
	return v;
}


//
// Converts numeric degrees to radians
//
if (typeof(Number.prototype.toRad) === "undefined") {
	Number.prototype.toRad = function() {
		return this * Math.PI / 180.0;
	}
}


//
// Converts a number to maximum X decimals and removes trailing
// zeros and the decimal dot if possible
//
if (typeof(Number.prototype.toStringMaxDecimals) === "undefined") {
	Number.prototype.toStringMaxDecimals=function(decimals) {
		if (this) {
			var decimal = this.toFixed(decimals);
			// Remove trailing 0es
			while (decimal.lastIndexOf("0") == decimal.length-1) {
				decimal = decimal.substring(0, decimal.length-1);
			}
			// Remove trailing dot
			if (decimal.lastIndexOf(".") == decimal.length-1) {
				decimal = decimal.substring(0, decimal.length-1);
			}
			return decimal;
		}
		return this;
	}
}


//
//
//
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

    ctx.fillStyle=SILKCOLOR;
    ctx.fill();

    // restore the context to its untranslated/unrotated state
    ctx.restore();
}
