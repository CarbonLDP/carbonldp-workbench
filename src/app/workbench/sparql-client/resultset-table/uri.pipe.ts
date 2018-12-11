import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF";

/**
 * Formats non-prefixed URIs as Turtle-style URIs `<http://.../>`
 */
@Pipe( { name: "uri" } )
export class URIPipe implements PipeTransform {
	transform( value:string ):string {
		if( URI.isPrefixed( value ) ) return value;

		return `<${value}>`;
	}
}

