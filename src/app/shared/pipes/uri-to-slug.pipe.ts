import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

@Pipe( { name: "URIToSlug" } )
export class URIToSlugPipe implements PipeTransform {
	transform( uri:string ):string {

		if( ! uri ) throw new Error( "The URI-to-slug pipe requires a string" );
		if( ! URI.isAbsolute( uri ) ) throw new Error( "The URI-to-slug pipe requires an absolute URI" );

		return URI.getSlug( uri );
	}
}
