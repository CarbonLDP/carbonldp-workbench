import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

@Pipe( { name: "URIToSlug" } )
export class URIToSlugPipe implements PipeTransform {
	transform( uri:string ):string {

		return ! uri ? uri : URI.getSlug( uri );
	}
}
