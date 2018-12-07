import { Component, EventEmitter, Input, NgZone, Output } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { RDFDocument } from "carbonldp/RDF";
import { HTTPError } from "carbonldp/HTTP/Errors";

import { DocumentsResolverService } from "./documents-resolver.service";
import { ErrorMessageGenerator } from "app/common/components/messages-area/error/error-message-generator";
import { Message } from "app/common/components/messages-area/message.component";


@Component( {
	selector: "app-document-explorer",
	templateUrl: "./document-explorer.component.html",
	styleUrls: [ "./document-explorer.component.scss" ],
} )

export class DocumentExplorerComponent {

	selectedDocumentURI:string = "";
	selectedDocumentURIs:Array<string> = [ "" ];
	loadingDocument:boolean = false;
	savingDocument:boolean = false;
	inspectingDocument:RDFDocument;
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
		this.documentsResolverService.get( uri )
			.catch( ( error ) => {
				this.handleExternalError( error );
			} ).then( ( document:RDFDocument ) => {
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

	public changeSelection( documentURIs:Array<string> ) {
		this.selectedDocumentURIs = documentURIs;
		this.selectedDocumentURI = documentURIs[ 0 ];
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

	public handleExternalError( error:HTTPError | Error ):void {
		this.messages.push( ErrorMessageGenerator.getErrorMessage( error ) );
	}

}
