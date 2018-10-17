import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

@Pipe( { name: "uri" } )
export class URIPipe implements PipeTransform {
	transform( value:string ):string {
		if( URI.isPrefixed( value ) ) return value;

		return `<${ value }>`;
	}
}

