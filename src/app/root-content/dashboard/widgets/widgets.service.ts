import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import { Class as PlatformMetadata } from "carbonldp/System/PlatformMetadata";
import * as HTTP from "carbonldp/HTTP";
import * as SPARQL from "carbonldp/SPARQL";

@Injectable()
export class WidgetsService {
	carbon:Carbon;

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
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

		return this.carbon.documents.executeSELECTQuery( '', query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			results.bindings.forEach( ( binding )=> {
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

		return this.carbon.documents.executeSELECTQuery( '', query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			results.bindings.forEach( ( binding )=> {
				count = binding[ "count" ];
			} );
			return count;
		} );

	}

	getPlatformMetadata():Promise<any> {
		return this.carbon.getPlatformMetadata();
	}

	refreshPlatformMetadata( platformMetadata:any ):Promise<any> {
		return platformMetadata.refresh().then( ( [platformMetadata]:[PlatformMetadata] ) => {
			return platformMetadata;
		} );
	}

}