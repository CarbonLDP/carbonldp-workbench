import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";

import { BehaviorSubject } from "rxjs";

import { SPARQLQuery } from "app/workbench/sparql-client/models";

@Injectable()
export class WIPQueryService {
	static get LOCAL_STORAGE_ID():string {
		return "sparqlClient-WIPQuery";
	}

	private readonly WIPQuery:SPARQLQuery;
	// Observable to notify of changes to the query.
	private readonly WIPQuery$:BehaviorSubject<SPARQLQuery>;

	constructor( @Inject( PLATFORM_ID ) private platformID:Object ) {
		// Use a LocalStorageMap if the environment is the browser, otherwise an empty SPARQLObject
		this.WIPQuery = isPlatformBrowser( this.platformID )
			? this.restore( WIPQueryService.LOCAL_STORAGE_ID )
			: isPlatformServer( this.platformID )
				? { endpoint: "", content: "", }
				: null;
		if( this.WIPQuery === null ) throw new Error( "Unsupported environment" );

		this.WIPQuery$ = new BehaviorSubject<SPARQLQuery>( this.WIPQuery );
	}

	getWipQuery() {
		return this.WIPQuery$;
	}

	//set the element on localStorage
	saveWipQuery( query:SPARQLQuery ) {
		if( ! ("localStorage" in window) ) throw new Error( "The environment doesn't support LocalStorage" );
		const serialization:string = JSON.stringify( query );
		window.localStorage.setItem( WIPQueryService.LOCAL_STORAGE_ID, serialization );

	}

	//get for the element on localStorage or return an empty query object
	private restore( id:string ):SPARQLQuery {
		if( ! ("localStorage" in window) ) throw new Error( "The environment doesn't support LocalStorage" );
		const savedSerialization:string | null = window.localStorage.getItem( id );
		return savedSerialization !== null
			? JSON.parse( savedSerialization )
			: { endpoint: "", content: "", };
	}
}
