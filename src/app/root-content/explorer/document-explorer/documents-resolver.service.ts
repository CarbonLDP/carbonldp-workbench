import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Request, Response } from "carbonldp/HTTP";
import { LDP } from "carbonldp/Vocabularies";
import { RDFDocument, RDFDocumentParser } from "carbonldp/RDF/Document";
import { PersistedDocument } from "carbonldp/PersistedDocument";
import * as AccessPoint from "carbonldp/AccessPoint";
import { SPARQLSelectResults } from "carbonldp/SPARQL/SelectResults";

@Injectable()
export class DocumentsResolverService {

	carbonldp:CarbonLDP;

	documents:Map<string, { document:RDFDocument, ETag:string }> = new Map<string, { document:RDFDocument, ETag:string }>();
	private parser:RDFDocumentParser = new RDFDocumentParser();

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}

	get( uri:string ):Promise<RDFDocument | null> {
		if( ! uri ) return <any> Promise.reject( new Error( "Provide the uri" ) );
		let requestOptions:Request.RequestOptions = { sendCredentialsOnCORS: true, };
		if( this.carbonldp.auth.isAuthenticated() ) this.carbonldp.auth.addAuthentication( requestOptions );

		Request.RequestUtils.setAcceptHeader( "application/ld+json", requestOptions );
		Request.RequestUtils.setPreferredInteractionModel( LDP.RDFSource, requestOptions );

		let eTag:string;

		return Request.RequestService.get( uri, requestOptions ).then( ( response:Response.Response ) => {
			eTag = response.getETag();
			return this.parser.parse( response.data );
		} ).then( ( parsedDocuments:any ) => {
			if( ! parsedDocuments[ 0 ] ) return null;

			let parsedDocument:RDFDocument = parsedDocuments[ 0 ];

			this.documents.set( uri, { document: parsedDocument, ETag: eTag } );

			return parsedDocument;
		} ).catch( ( error ) => {
			return Promise.reject( error );
		} );
	}

	getAll():Promise<RDFDocument[]> {
		return new Promise<RDFDocument[]>( ( resolve:( result:any ) => void, reject:( error:Error ) => void ) => {
			let keys = Object.keys( this.documents );
			let values = keys.map( ( v ) => { return this.documents[ v ].document; } );
			resolve( values );
		} );
	}

	createChild( parentURI:string, content:any, childSlug?:string ):Promise<PersistedDocument> {
		return this.carbonldp.documents.createChild( parentURI, content, childSlug ).then(
			( [ createdChild, response ]:[ PersistedDocument, Response.Response ] ) => {
				return createdChild;
			}
		).catch( ( error ) => {
			return Promise.reject( error );
		} );
	}

	createAccessPoint( document:PersistedDocument, accessPoint:AccessPoint.Class, slug?:string ):Promise<PersistedDocument> {
		return document.createAccessPoint( accessPoint, slug ).then(
			( [ createdChild, response ]:[ PersistedDocument, Response.Response ] ) => {
				return createdChild;
			}
		).catch( ( error ) => {
			return Promise.reject( error );
		} );
	}

	getAccessPointsHasMemberRelationProperties( documentURI:string ):Promise<string[]> {
		return this.carbonldp.documents.executeSELECTQuery( documentURI,
			`SELECT ?accessPointURI ?propertyName 
						WHERE {
						      ?accessPointURI <${LDP.membershipResource}> <${documentURI}>.
					          ?accessPointURI <${LDP.hasMemberRelation}> ?propertyName
			            }`
		).then( ( results:SPARQLSelectResults ) => {

			return results.bindings.map( ( value:{ accessPointURI:any, propertyName:any } ) => value.propertyName.id );
		} ).catch( ( error ) => {
			return Promise.reject( error );
		} );
	}

	delete( documentURI:string ):Promise<void> {
		return this.carbonldp.documents.delete( documentURI ).catch( ( error ) => {
			return Promise.reject( error );
		} );
	}

	update( uri:string, body:string ):Promise<RDFDocument> {
		if( ! uri || ! body ) return <any> Promise.reject( new Error( "Provide the required parameters" ) );
		//Refresh document ETag
		let eTag:string = this.documents.get( uri ).ETag;
		return this.callUpdate( uri, body, eTag );
	}

	private callUpdate( uri:string, body:string, eTag:string ):Promise<RDFDocument> {
		let requestOptions:Request.RequestOptions = { sendCredentialsOnCORS: true, };
		if( this.carbonldp.auth.isAuthenticated() ) this.carbonldp.auth.addAuthentication( requestOptions );
		Request.RequestUtils.setAcceptHeader( "application/ld+json", requestOptions );
		Request.RequestUtils.setContentTypeHeader( "application/ld+json", requestOptions );
		Request.RequestUtils.setIfMatchHeader( eTag, requestOptions );
		Request.RequestUtils.setPreferredInteractionModel( LDP.RDFSource, requestOptions );
		return Request.RequestService.put( uri, body, requestOptions ).then( ( response:Response.Response ) => {
			return this.get( uri );
		} ).then( ( parsedDocument:RDFDocument ) => {
			if( ! parsedDocument ) return null;
			return parsedDocument;
		} ).catch( ( error ) => {
			return Promise.reject( error );
		} );
	}
}

