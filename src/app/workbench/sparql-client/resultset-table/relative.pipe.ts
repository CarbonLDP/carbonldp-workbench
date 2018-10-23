import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

/**
 * If the provided URI has the provided base, returns its relative URI
 */
@Pipe( { name: "relative" } )
export class RelativePipe implements PipeTransform {
	transform( value:string, base:string ):string {
		if( ! base ) throw new Error( "The relative pipe requires an argument" );

		if( ! value.startsWith( base ) ) return value;

		return URI.getRelativeURI( value, base );
	}
}

