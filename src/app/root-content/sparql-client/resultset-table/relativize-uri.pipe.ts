import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

@Pipe( { name: "relative" } )
export class RelativizeURIPipe implements PipeTransform {
	transform( value:string, args:any[] ):string {
		if( args.length === 0 ) throw new Error( "The relative pipe requires an argument" );
		let baseURI:string = "";
		if( typeof args !== "string" ) baseURI = args[ 0 ];
		if( ! value.startsWith( baseURI ) ) return value;
		return URI.getRelativeURI( value, baseURI );
	}
}

