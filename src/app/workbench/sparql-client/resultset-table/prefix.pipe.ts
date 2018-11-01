import { Pipe, PipeTransform } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

/**
 * Prefixes URIs based with the provided prefixes
 *
 * @usageNotes
 * ```
 * {{ "http://example.org/ns#Something" | prefix:prefixes }} => "ex:Something"
 * ```
 */
@Pipe( { name: "prefix" } )
export class PrefixPipe implements PipeTransform {
	transform( value:string, prefixes:Map<string, string> ):string {
		if( ! prefixes ) throw new Error( "The prefix pipe requires an argument" );

		for( let entry of prefixes.entries() ) {
			const prefix = entry[ 0 ];
			const prefixURI = entry[ 1 ];

			if( ! URI.isBaseOf( prefixURI, value ) ) continue;

			return URI.prefix( value, prefix, prefixURI );
		}

		return `<${value}>`;
	}
}

