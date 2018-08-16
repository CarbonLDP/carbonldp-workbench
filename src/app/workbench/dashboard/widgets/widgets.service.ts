import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { PlatformMetadata } from "carbonldp/System/PlatformMetadata";
import { SPARQLSelectResults } from "carbonldp/SPARQL/SelectResults";
import { C } from "carbonldp/Vocabularies";

/*
*  Services used by the widgets
* */
@Injectable()
export class WidgetsService {
	carbonldp:CarbonLDP;

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}

	/*
	*  Returns the total number of documents existing in the platform
	* */
	getDocumentsTotalCount():Promise<number> {
		let count;
		let query:string = `
			SELECT ( COUNT (?document) as ?count)
			WHERE{ GRAPH ?document {
					?document a <${C.Document}>
				}
			}
		`;

		return this.carbonldp.documents.executeSELECTQuery( '', query )
			.then( ( results:SPARQLSelectResults ) => {
				results.bindings.forEach( ( binding ) => {
					count = binding[ "count" ];
				} );
				return count;
			} );
	}


	/*
	*  Returns the total number of triples existing in the platform
	* */
	getTriplesTotalCount():Promise<number> {
		let count;
		let query:string = `
			SELECT ( COUNT (?s) as ?count)
			WHERE{ 
				?s ?p ?o .
			}
		`;

		return this.carbonldp.documents.$executeSELECTQuery( '', query )
			.then( ( results:SPARQLSelectResults ) => {
				results.bindings.forEach( ( binding ) => {
					count = binding[ "count" ];
				} );
				return count;
			} );

	}

	/*
	*  Returns the Metadata of the platform
	* */
	getPlatformMetadata():Promise<PlatformMetadata> {
		return this.carbonldp.getPlatformMetadata();
	}

	/*
	*  Refresh the metadata of the platform
	* */
	refreshPlatformMetadata( platformMetadata:PlatformMetadata ):Promise<any> {
		return platformMetadata.$refresh();
	}

}