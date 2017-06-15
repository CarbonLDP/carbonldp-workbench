import { Component, Input, Output, EventEmitter, NgZone } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as RDFDocument from "carbonldp/RDF/Document";
import { Error as HTTPError } from "carbonldp/HTTP/Errors";

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


	@Input() carbon:Carbon;
	@Output() onRefreshNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onDisplaySuccessMessage:EventEmitter<string> = new EventEmitter<string>();

	private zone:NgZone;

	constructor( documentsResolverService:DocumentsResolverService, zone:NgZone, carbon:Carbon ) {
		this.documentsResolverService = documentsResolverService;
		this.zone = zone;
		this.carbon = carbon;
	}

	onLoadingDocument( loadingDocument:boolean ):void {
		this.loadingDocument = loadingDocument;
	}

	showLoading( savingDocument:boolean ):void {
		this.savingDocument = savingDocument;
	}

	resolveDocument( uri:string ):void {
		this.loadingDocument = true;
		this.documentsResolverService.get( uri ).then( ( document:RDFDocument.Class ) => {
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

	public handleExternalError( error:HTTPError ):void {
		this.messages.push( ErrorMessageGenerator.getErrorMessage( error ) );
	}

}