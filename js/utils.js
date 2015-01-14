var PCBCOLOR='#347235';
var SILKCOLOR='#FFFFFF';


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

