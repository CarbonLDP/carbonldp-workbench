import { from, Observable } from "rxjs";
import { map, tap, flatMap } from "rxjs/operators";

import { Injectable } from "@angular/core";

import { RDFDocument } from "carbonldp/RDF";
import { RequestOptions, RequestService, RequestUtils } from "carbonldp/HTTP";
import { LDP } from "carbonldp/Vocabularies";
import { JSONLDParser } from "carbonldp/JSONLD";

import { DocumentsStore } from "./documents.store";
import { DocumentsQuery } from "./documents.query";

@Injectable( { providedIn: "root" } )
export class DocumentsService {
	private parser:JSONLDParser = new JSONLDParser();

	constructor(
		private documentsQuery:DocumentsQuery,
		private documentsStore:DocumentsStore,
	) {}

	fetchOne( id:string ):Observable<RDFDocument> {
		if( this.documentsQuery.hasEntity( id ) ) return this.documentsQuery.selectEntity( id );
		else return this.retrieveOne( id )
			.pipe(
				tap( document => this.documentsStore.add( document ) ),
			);
	}

	setActive( id:string ) {
		this.documentsStore.setActive( id );
	}

	private retrieveOne( id:string ):Observable<RDFDocument> {
		const requestOptions:RequestOptions = {};

		RequestUtils.setAcceptHeader( "application/ld+json", requestOptions );
		RequestUtils.setPreferredInteractionModel( LDP.RDFSource, requestOptions );

		return from( RequestService.get( id, requestOptions ) )
			.pipe(
				flatMap( response => from( this.parser.parse( response.data ) ) ),
				map( object => RDFDocument.getDocuments( object ) ),
				// FIXME: Validate
				map( documents => documents[ 0 ] ),
			);
	}
}
