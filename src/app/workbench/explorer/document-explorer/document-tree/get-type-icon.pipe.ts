import { Pipe, PipeTransform } from "@angular/core";

import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { faShareSquare } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-regular-svg-icons";

import { C } from "carbonldp/Vocabularies";

/**
 * Returns an FontAwesome icon based on the <code>rdf:type</code>s of a resource
 */
@Pipe( {
	name: "getTypeIcon"
} )
export class GetTypeIconPipe implements PipeTransform {
	transform( types:string[] ):IconDefinition {
		if( types.includes( C.AccessPoint ) ) {
			return faShareSquare;
		} else return faFile;
	}
}
