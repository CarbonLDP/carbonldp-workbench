import { Component, EventEmitter } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { RDFDocument } from "carbonldp/RDF/Document";
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
	onRefreshNode:EventEmitter<string> = new EventEmitter<string>();
	onOpenNode:EventEmitter<string> = new EventEmitter<string>();
	onDisplaySuccessMessage:EventEmitter<string> = new EventEmitter<string>();

	selectedDocumentURIs:string[] = [ "" ];
	inspectingDocument:RDFDocument;
	messages:Message[] = [];

	loading:boolean = false;

	constructor(
		private carbonldp:CarbonLDP,
		private documentsResolverService:DocumentsResolverService,
	) {
	}

	setLoading( loading:boolean ) {
		this.loading = loading;
	}

	async resolveDocument( uri:string ) {
		this.loading = true;
		try {
			this.inspectingDocument = await this.documentsResolverService.get( uri );
			this.loading = false;
		} catch( error ) {
			this.handleExternalError( error );
		}
	}

	async refreshDocument( documentURI:string ) {
		return this.resolveDocument( documentURI );
	}

	refreshNode( nodeId:string ) {
		this.onRefreshNode.emit( nodeId );
	}

	openNode( nodeId:string ) {
		this.onOpenNode.emit( nodeId );
	}

	changeSelection( documentURIs:string[] ) {
		this.selectedDocumentURIs = documentURIs;
	}

	onSuccessAccessPoint( $event:any ) {
		this.onRefreshNode.emit( this.selectedDocumentURIs[ 0 ] );
		this.onDisplaySuccessMessage.emit( "<p>The Access Point was created correctly</p>" );
	}

	onSuccessCreateDocument( $event:any ) {
		this.onRefreshNode.emit( this.selectedDocumentURIs[ 0 ] );
		this.onDisplaySuccessMessage.emit( "<p>The child document was created correctly</p>" );
	}

	onSuccessDeleteDocument( $event:any ) {
		this.onRefreshNode.emit( $event );
	}

	handleExternalError( error:HTTPError | Error ) {
		this.messages.push( ErrorMessageGenerator.getErrorMessage( error ) );
	}

}
