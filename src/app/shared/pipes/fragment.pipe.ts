import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

@Pipe( {
	name: "fragment"
} )
export class FragmentPipe implements PipeTransform {
	transform( value:string, args:any[] ):string {
		if( value === void 0 ) throw new Error( "The fragment pipe requires an argument" );
		if( ! URI.hasFragment( value ) ) return value;

		let parts:string[] = value.split( "#" );
		value = "".concat( parts[ 0 ] ).concat( "#" + parts[ 1 ] );
		
		return URI.getFragment( value );
	}
}

