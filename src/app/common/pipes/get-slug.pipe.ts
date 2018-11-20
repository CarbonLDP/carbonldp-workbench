import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

@Pipe( {
	name: "getSlug"
} )
export class GetSlugPipe implements PipeTransform {
	transform( value:string, args:any[] ):string {
		if( value === void 0 ) throw new Error( "The fragment pipe requires an argument" );
		return URI.getSlug( value );
	}
}

