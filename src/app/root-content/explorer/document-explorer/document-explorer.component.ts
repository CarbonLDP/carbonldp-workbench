import { Component, Input, Output, EventEmitter, NgZone } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import * as RDFDocument from "carbonldp/RDF/Document";
import * as Response from "carbonldp/HTTP/Response";
import { HTTPError } from "carbonldp/HTTP/Errors";

import { DocumentsResolverService } from "./documents-resolver.service";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import { Message } from "app/shared/messages-area/message.component";

import "semantic-ui/semantic";


@Component( {
	selector: "cw-document-explorer",
	templateUrl: "./document-explorer.component.html",
	styleUrls: [ "./document-explorer.component.scss" ],
} )

export class DocumentExplorerComponent {

	selectedDocumentURI:string = "";
	loadingDocument:boolean = false;
	savingDocument:boolean = false;
	inspectingDocument:RDFDocument.Class;
	documentsResolverService:DocumentsResolverService;
	messages:Message[] = [];


	@Input() carbonldp:CarbonLDP;
	@Output() onRefreshNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onDisplaySuccessMessage:EventEmitter<string> = new EventEmitter<string>();

	private zone:NgZone;

	constructor( documentsResolverService:DocumentsResolverService, zone:NgZone, carbonldp:CarbonLDP ) {
		this.documentsResolverService = documentsResolverService;
		this.zone = zone;
		this.carbonldp = carbonldp;
	}

	onLoadingDocument( loadingDocument:boolean ):void {
		setTimeout( () => {this.loadingDocument = loadingDocument;}, 1 );
	}

	showLoading( savingDocument:boolean ):void {
		this.savingDocument = savingDocument;
	}

	resolveDocument( uri:string ):void {
		this.zone.run( () => {this.loadingDocument = true;} );
		this.documentsResolverService.get( uri ).catch( ( error ) => {
			this.handleExternalError( error );
		} ).then( ( document:RDFDocument.Class ) => {
			this.zone.run( () => {
				this.inspectingDocument = document;
				this.loadingDocument = false;
			} );
		} );
	}

	refreshDocument( documentURI:string ):void {
		this.resolveDocument( documentURI );
	}

	refreshNode( nodeId:string ):void {
		this.onRefreshNode.emit( nodeId );
	}

	openNode( nodeId:string ):void {
		this.onOpenNode.emit( nodeId );
	}

	public changeSelection( documentURI:string ) {
		this.selectedDocumentURI = documentURI;
	}

	public onSuccessAccessPoint( $event:any ):void {
		this.onRefreshNode.emit( this.selectedDocumentURI );
		this.onDisplaySuccessMessage.emit( "<p>The Access Point was created correctly</p>" );
	}

	public onSuccessCreateDocument( $event:any ):void {
		this.onRefreshNode.emit( this.selectedDocumentURI );
		this.onDisplaySuccessMessage.emit( "<p>The child document was created correctly</p>" );
	}

	public onSuccessDeleteDocument( $event:any ):void {
		this.onRefreshNode.emit( $event );
	}

	public handleExternalError( error:HTTPError | Response.Response ):void {
		if( error instanceof Response.Response ) {
			this.carbonldp.documents._parseErrorResponse( error ).catch( ( parsedError:HTTPError ) => {
				this.messages.push( ErrorMessageGenerator.getErrorMessage( parsedError ) );
			} );
		} else {
			this.messages.push( ErrorMessageGenerator.getErrorMessage( error ) );
		}
	}

}