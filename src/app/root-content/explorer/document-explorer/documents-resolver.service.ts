import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as HTTP from "carbonldp/HTTP";
import * as NS from "carbonldp/NS";
import * as RDFDocument from "carbonldp/RDF/Document";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import * as AccessPoint from "carbonldp/AccessPoint";

@Injectable()
export class DocumentsResolverService {

	carbon:Carbon;

	documents:Map<string, { document:RDFDocument.Class, ETag:string }> = new Map<string, { document:RDFDocument.Class, ETag:string }>();
	private parser:RDFDocument.Parser = new RDFDocument.Parser();

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
	}

	get( uri:string ):Promise<RDFDocument.Class | null> {
		if( ! uri ) return <any> Promise.reject( new Error( "Provide the uri" ) );
		let requestOptions:HTTP.Request.Options = { sendCredentialsOnCORS: true, };
		if( this.carbon.auth.isAuthenticated() ) this.carbon.auth.addAuthentication( requestOptions );

		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.RDFSource, requestOptions );

		let eTag:string;

		return HTTP.Request.Service.get( uri, requestOptions ).then( ( response:HTTP.Response.Class ) => {
			eTag = HTTP.Response.Util.getETag( response );
			return this.parser.parse( response.data );
		} ).then( ( parsedDocuments:any ) => {
			if( ! parsedDocuments[ 0 ] ) return null;

			let parsedDocument:RDFDocument.Class = parsedDocuments[ 0 ];

			this.documents.set( uri, { document: parsedDocument, ETag: eTag } );

			return parsedDocument;
		} ).catch( ( error ) => {
			console.error( error );
			return Promise.reject( error );
		} );
	}

	getAll():Promise<RDFDocument.Class[]> {
		return new Promise<RDFDocument.Class[]>( ( resolve:( result:any ) => void, reject:( error:Error ) => void ) => {
			let keys = Object.keys( this.documents );
			let values = keys.map( ( v ) => { return this.documents[ v ].document; } );
			resolve( values );
		} );
	}

	createChild( parentURI:string, content:any, childSlug?:string ):Promise<PersistedDocument.Class> {
		return this.carbon.documents.createChild( parentURI, content, childSlug ).then(
			( [ createdChild, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
				return createdChild;
			}
		).catch( ( error ) => {
			console.error( error );
			return Promise.reject( error );
		} );
	}

	createAccessPoint( document:PersistedDocument.Class, accessPoint:AccessPoint.Class, slug?:string ):Promise<PersistedDocument.Class> {
		return document.createAccessPoint( accessPoint, slug ).then(
			( [ createdChild, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
				return createdChild;
			}
		).catch( ( error ) => {
			console.error( error );
			return Promise.reject( error );
		} );
	}

	delete( documentURI:string ):Promise<HTTP.Response.Class> {
		return this.carbon.documents.delete( documentURI ).catch( ( error ) => {
			console.error( error );
			return Promise.reject( error );
		} );
	}

	update( uri:string, body:string ):Promise<RDFDocument.Class> {
		if( ! uri || ! body ) return <any> Promise.reject( new Error( "Provide the required parameters" ) );
		//Refresh document ETag
		let eTag:string = this.documents.get( uri ).ETag;
		return this.callUpdate( uri, body, eTag );
	}

	private callUpdate( uri:string, body:string, eTag:string ):Promise<RDFDocument.Class> {
		let requestOptions:HTTP.Request.Options = { sendCredentialsOnCORS: true, };
		if( this.carbon.auth.isAuthenticated() ) this.carbon.auth.addAuthentication( requestOptions );
		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setContentTypeHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setIfMatchHeader( eTag, requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.RDFSource, requestOptions );
		return HTTP.Request.Service.put( uri, body, requestOptions ).then( ( response:HTTP.Response.Class ) => {
			return this.get( uri );
		} ).then( ( parsedDocument:RDFDocument.Class ) => {
			if( ! parsedDocument ) return null;
			return parsedDocument;
		} ).catch( ( error ) => {
			console.error( error );
			return Promise.reject( error );
		} );
	}
}

