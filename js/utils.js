var PCBCOLOR='#347235';
var SILKCOLOR='#FFFFFF';
var CRLF='\r\n';


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


//
//
//
function textIfNotNull(vari,valu) {
    if (valu===null) return '';
    return vari+'='+valu+' ';
}

//
//
//
function generateFormEntry(
		label, id0,
		id1, type1, min1, max1, step1, val1, onchange1,
		id2, type2, min2, max2, step2, val2, onchange2
	) {
	var html='';
	html+='<div class="form-group" id="'+id0+'">'+CRLF;
	html+='  <label for="'+id1+'" class="control-label">'+label+'</label>'+CRLF;
	html+='    <div style="display:block">'+CRLF;
	html+='      <input id="'+id1+'" type="'+type1+'" class="form-control formfit2" ';
	html+=textIfNotNull('min',min1);
	html+=textIfNotNull('max',max1);
	html+=textIfNotNull('step',step1);
	html+=textIfNotNull('value',val1);
	html+=textIfNotNull('onchange',onchange1);
	html+='/>'+CRLF;
    if (id2!==null) {
    	html+='x'+CRLF;
        html+='      <input id="'+id2+'" type="'+type2+'" class="form-control formfit2" ';
		html+=textIfNotNull('min',min2);
		html+=textIfNotNull('max',max2);
		html+=textIfNotNull('step',step2);
		html+=textIfNotNull('value',val2);
		html+=textIfNotNull('onchange',onchange2);
		html+='/>'+CRLF;
    }
	html+='    </div>'+CRLF;
	html+='  </div>'+CRLF;
	html+=''+CRLF;
	return html;
}



function generateFormSelect(label, id, onchange) {
	var html='';
	html+='<div class="form-group">'+CRLF;
    html+='<label for="'+id+'" class="control-label">'+label+'</label>'+CRLF;
    html+='  <select id="'+id+'" class="form-control" onchange="'+onchange+'">'+CRLF;
    for (var i = 3; i < arguments.length; i+=2) {
	    html+='    <option value="'+arguments[i]+'">'+arguments[i+1]+'</option>'+CRLF;
	}
    html+='  </select>'+CRLF;
    html+='</div>'+CRLF;
    return html;
}
