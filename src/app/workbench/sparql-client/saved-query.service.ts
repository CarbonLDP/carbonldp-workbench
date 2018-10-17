import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";

import { BehaviorSubject, Observable } from "rxjs";

import { LocalStorageMap } from "app/workbench/sparql-client/local-storage-map";
import { UUIDUtils } from "carbonldp/Utils";

import { SPARQLQuery } from "app/workbench/sparql-client/models";

@Injectable()
export class SavedQueryService {
	static get LOCAL_STORAGE_ID():string {
		return "sparqlClient-savedQueries";
	}

	private readonly savedQueries:Map<string, SPARQLQuery>;
	private readonly savedQueries$:BehaviorSubject<SPARQLQuery[]>;

	constructor( @Inject( PLATFORM_ID ) private platformID:Object ) {
		this.savedQueries = isPlatformBrowser( this.platformID )
			? new LocalStorageMap( SavedQueryService.LOCAL_STORAGE_ID )
			: isPlatformServer( this.platformID )
				? new Map()
				: null;
		if( this.savedQueries === null ) throw new Error( "Unsupported environment" );

		this.savedQueries$ = new BehaviorSubject<SPARQLQuery[]>( Array.from( this.savedQueries.values() ) );
	}

	findByName( name:string ):Promise<SPARQLQuery> {
		return Promise.resolve().then( () => {
			return Array.from( this.savedQueries.values() )
				.find( query => query.name === name );
		} );
	}

	getAll():Observable<SPARQLQuery[]> {
		return this.savedQueries$;
	}

	save( query:SPARQLQuery ):Promise<SPARQLQuery> {
		if( query.id ) {
			// The query already exists
			return this
				.findByName( query.name )
				.then( existingQuery => {
					if( existingQuery && query.id !== existingQuery.id ) throw new Error( "A query with the same name already exists" );

					this.savedQueries.set( query.id, query );
					this.signalUpdate();

					return query;
				} );
		} else {
			// The query doesn't exist
			return this
				.findByName( query.name )
				.then( existingQuery => {
					if( existingQuery ) throw new Error( "A query with the same name already exists" );

					query.id = UUIDUtils.generate();

					this.savedQueries.set( query.id, query );
					this.signalUpdate();
					return query;
				} );
		}
	}

	replace( original:SPARQLQuery, replacement:SPARQLQuery ):Promise<SPARQLQuery> {
		original = Object.assign( original, replacement, {
			id: original.id,
			name: original.name,
		} );

		return Promise.resolve()
			.then( () => {
				if( replacement.id ) {
					// The replacement already exists and needs to be deleted before replacing the target
					return this.delete( replacement );
				}
			} )
			.then( () => {
				return this.save( original );
			} );
	}

	delete( query:SPARQLQuery ):Promise<void> {
		if( this.savedQueries.delete( query.id ) ) this.signalUpdate();
		return Promise.resolve();
	}

	private signalUpdate() {
		this.savedQueries$.next( Array.from( this.savedQueries.values() ) );
	}
}