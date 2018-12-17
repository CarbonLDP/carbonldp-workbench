import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { HTTPError } from "carbonldp/HTTP/Errors";

import { DocumentsResolverService } from "../documents-resolver.service"
import { Message } from "app/common/components/messages-area/message.component";
import { DocumentExplorerLibrary } from "app/workbench/explorer/document-explorer/document-explorer-library";
import { ErrorMessageGenerator } from "app/common/components/messages-area/error/error-message-generator";


@Component( {
	selector: "app-document-deleter",
	templateUrl: "./document-deleter.component.html",
	styleUrls: [ "./document-deleter.component.scss" ],
} )
export class DocumentDeleterComponent implements AfterViewInit {
	private carbonldp:CarbonLDP;
	private element:ElementRef;
	private documentsResolverService:DocumentsResolverService;
	private $element:JQuery;

	$deleteDocumentModal:JQuery;
	errorMessage:Message;
	deleteDocumentFormModel:{ value?:any } = {};
	isDeleting:boolean = false;

	@Input() documentURIs:Array<string> = [];
	@Output() onSuccess:EventEmitter<any> = new EventEmitter<any>();
	@Output() onError:EventEmitter<any> = new EventEmitter<any>();

	constructor( element:ElementRef, carbonldp:CarbonLDP, documentsResolverService:DocumentsResolverService ) {
		this.element = element;
		this.carbonldp = carbonldp;
		this.documentsResolverService = documentsResolverService;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$deleteDocumentModal = this.$element.find( ".delete.document.modal" ).modal( { closable: false } );
	}

	public onSubmitDeleteDocument():void {
		this.isDeleting = true;

		/*
			2018-10-08 @MiguelAraCo
			TODO[performance]: Refactor this to use a queue instead of sending all requests at once
		*/
		let deletePromises = this.documentURIs.map( ( documentURI ) => {
			return this.documentsResolverService.delete( documentURI );
		} );

		Promise.all( deletePromises ).then( () => {
			let parentURIs = this.documentURIs.map( ( documentURI ) => {
				return DocumentExplorerLibrary.getParentURI( documentURI );
			} );
			this.onSuccess.emit( parentURIs );
			this.hide();
		} ).catch( ( error:HTTPError ) => {
			this.onError.emit( error );
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} ).then( () => {
			this.isDeleting = false;
		} );
	}

	public clearErrorMessage():void {
		this.errorMessage = null;
	}

	public show():void {
		this.$deleteDocumentModal.modal( "show" );
	}

	public hide():void {
		this.$deleteDocumentModal.modal( "hide" );
		this.clearErrorMessage();
	}

	public toggle():void {
		this.$deleteDocumentModal.modal( "toggle" );
	}
}

