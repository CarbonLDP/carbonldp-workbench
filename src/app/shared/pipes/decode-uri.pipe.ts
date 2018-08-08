import { Pipe, PipeTransform } from "@angular/core";

@Pipe( {
	name: "decodeURI"
} )
export class DecodeURIPipe implements PipeTransform {
	transform( value:string, args:any[] ):string {
		if( value === void 0 ) throw new Error( "The DecodeURI pipe requires an argument" );
		try {
			return decodeURI( value );
		} catch( e ) {
			return value;
		}
	}
}

