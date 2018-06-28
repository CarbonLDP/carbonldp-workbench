import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

@Pipe( { name: "prefix" } )
export class PrefixURIPipe implements PipeTransform {
	transform( value:string, args:any[] ):string {
		if( args.length === 0 ) throw new Error( "The relative pipe requires an argument" );
		let prefixes:{ [ prefix:string ]:string } = args[ 0 ];

		for( let prefix in prefixes ) {
			if( ! prefixes.hasOwnProperty( prefix ) ) continue;
			let prefixURI:string = prefixes[ prefix ];

			if( ! URI.isBaseOf( prefixURI, value ) ) continue;

			return URI.prefix( value, prefix, prefixURI );
		}

		return `<${ value }>`;
	}
}

