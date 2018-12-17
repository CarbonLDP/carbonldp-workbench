import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";

@Pipe( {
	name: "cssVar"
} )
export class CSSVarPipe implements PipeTransform {
	constructor(
		private sanitizer:DomSanitizer,
	) {}

	transform( value:string, varName:string ):SafeStyle {
		if( typeof value === "undefined" || value === null ) return "{}";

		if( typeof varName === "undefined" ) throw new Error( "The cssVar pipe requires the variable name to set" );

		return this.sanitizer.bypassSecurityTrustStyle( `
			--${varName}: ${value}
		` );
	}
}

