import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { RequestOptions, RequestService, RequestUtils, Response } from "carbonldp/HTTP";
import { LDP } from "carbonldp/Vocabularies";
import { RDFDocument } from "carbonldp/RDF";
import { JSONLDParser } from "carbonldp/JSONLD";
import { Pointer } from "carbonldp/Pointer";
import { Document } from "carbonldp/Document";
import { BaseAccessPoint } from "carbonldp/AccessPoint";
import { _getErrorResponseParserFn } from "carbonldp/DocumentsRepository";

@Injectable()
export class DocumentsResolverService {

	carbonldp:CarbonLDP;

	documents:Map<string, { document:RDFDocument, ETag:string }> = new Map<string, { document:RDFDocument, ETag:string }>();
	private parser:JSONLDParser = new JSONLDParser();

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}

	get( uri:string ):Promise<RDFDocument | null> {
		if( ! uri ) return <any>Promise.reject( new Error( "Provide the uri" ) );
		let requestOptions:RequestOptions = { sendCredentialsOnCORS: true, };
		// TODO: ADD authentication `addAuthentication( requestOptions )` if authenticated

		RequestUtils.setAcceptHeader( "application/ld+json", requestOptions );
		RequestUtils.setPreferredInteractionModel( LDP.RDFSource, requestOptions );

		let eTag:string;

		return RequestService.get( uri, requestOptions ).then( ( response:Response ) => {
			eTag = response.getETag();
			return this.parser.parse( response.data );
		} ).then( ( object:object[] ) => {
			if( ! object[ 0 ] ) return null;
			let parsedDocument:RDFDocument = RDFDocument.getDocuments( object )[ 0 ];

			this.documents.set( uri, { document: parsedDocument, ETag: eTag } );

			return parsedDocument;
		} ).catch( _getErrorResponseParserFn( this.carbonldp.registry ) );
	}

	getAll():Promise<RDFDocument[]> {
		return new Promise<RDFDocument[]>( ( resolve:( result:any ) => void, reject:( error:Error ) => void ) => {
			let keys = Object.keys( this.documents );
			let values = keys.map( ( v ) => { return this.documents[ v ].document; } );
			resolve( values );
		} );
	}

	createChild( parentURI:string, content:any, childSlug?:string ):Promise<Document> {
		return this.carbonldp.documents.$create( parentURI, content, childSlug ).then(
			( createdChild:Document ) => {
				return createdChild;
			}
		);
	}

	createAccessPoint( document:Document, accessPoint:BaseAccessPoint, slug?:string ):Promise<Document> {
		return document.$create( accessPoint, slug ).then(
			( createdChild:Document ) => {
				return createdChild;
			} );
	}

	async getAccessPointsHasMemberRelations( documentURI:string ):Promise<string[]> {
		const results = await this.carbonldp.documents.$executeSELECTQuery<{ accessPointURI:Pointer, propertyName:Pointer }>( documentURI,
			`SELECT ?accessPointURI ?propertyName 
						WHERE {
						      ?accessPointURI <${LDP.membershipResource}> <${documentURI}>.
					          ?accessPointURI <${LDP.hasMemberRelation}> ?propertyName
			            }`
		);

		return results.bindings.map( ( binding ) => binding.propertyName.$id );
	}

	delete( documentURI:string ):Promise<void> {
		return this.carbonldp.documents.$delete( documentURI );
	}

	update( uri:string, body:string ):Promise<RDFDocument> {
		if( ! uri || ! body ) return <any>Promise.reject( new Error( "Provide the required parameters" ) );
		//Refresh document ETag
		let eTag:string = this.documents.get( uri ).ETag;
		return this.callUpdate( uri, body, eTag );
	}

	private callUpdate( uri:string, body:string, eTag:string ):Promise<RDFDocument> {
		let requestOptions:RequestOptions = { sendCredentialsOnCORS: true, };
		// TODO: ADD authentication `addAuthentication( requestOptions )` if authenticated
		RequestUtils.setAcceptHeader( "application/ld+json", requestOptions );
		RequestUtils.setContentTypeHeader( "application/ld+json", requestOptions );
		RequestUtils.setIfMatchHeader( eTag, requestOptions );
		RequestUtils.setPreferredInteractionModel( LDP.RDFSource, requestOptions );
		return RequestService.put( uri, body, requestOptions ).then( ( response:Response ) => {
			return this.get( uri );
		} ).then( ( parsedDocument:RDFDocument ) => {
			if( ! parsedDocument ) return null;
			return parsedDocument;
		} ).catch( _getErrorResponseParserFn( this.carbonldp.registry ) );
	}
}

