import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Class as PlatformMetadata } from "carbonldp/System/PlatformMetadata";
import { SPARQLSelectResults } from "carbonldp/SPARQL/SelectResults";

@Injectable()
export class WidgetsService {
	carbonldp:CarbonLDP;

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}

	getDocumentsTotalCount():Promise<number> {
		let count;
		let query:string = `
				SELECT ( COUNT (?document) as ?count)
				WHERE{ GRAPH ?document {
						?document a <https://carbonldp.com/ns/v1/platform#Document>
					}
				}
			`;

		return this.carbonldp.documents.executeSELECTQuery( '', query ).then( ( results:SPARQLSelectResults ) => {
			results.bindings.forEach( ( binding ) => {
				count = binding[ "count" ];
			} );
			return count;
		} );

	}

	getTriplesTotalCount():Promise<number> {
		let count;
		let query:string = `
				PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
				SELECT ( COUNT (?s) as ?count)
				WHERE{ 
					?s ?p ?o .
				}
			`;

		return this.carbonldp.documents.executeSELECTQuery( '', query ).then( ( results:SPARQLSelectResults ) => {
			results.bindings.forEach( ( binding ) => {
				count = binding[ "count" ];
			} );
			return count;
		} );

	}

	getPlatformMetadata():Promise<any> {
		return this.carbonldp.getPlatformMetadata();
	}

	refreshPlatformMetadata( platformMetadata:any ):Promise<any> {
		return platformMetadata.refresh().then( ( [ platformMetadata ]:[ PlatformMetadata ] ) => {
			return platformMetadata;
		} );
	}

}