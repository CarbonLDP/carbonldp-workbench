import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import { Error as HTTPError } from "carbonldp/HTTP/Errors";

import { DocumentsResolverService } from "../documents-resolver.service"
import { Message } from "app/shared/messages-area/message.component";
import { DocumentExplorerLibrary } from "src/app/root-content/explorer/document-explorer/document-explorer-library";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-document-deleter",
	templateUrl: "./document-deleter.component.html",
	styleUrls: [ "./document-deleter.component.scss" ],
} )

export class DocumentDeleterComponent implements AfterViewInit {

	private carbon:Carbon;
	private element:ElementRef;
	private $element:JQuery;

	$deleteDocumentModal:JQuery;

	private documentsResolverService:DocumentsResolverService;
	public errorMessage:Message;

	public deleteDocumentFormModel:{ value?:any } = {};
	@Input() documentURI:string = "";
	@Output() onSuccess:EventEmitter<any> = new EventEmitter<any>();
	@Output() onError:EventEmitter<any> = new EventEmitter<any>();


	constructor( element:ElementRef, carbon:Carbon, documentsResolverService:DocumentsResolverService ) {
		this.element = element;
		this.carbon = carbon;
		this.documentsResolverService = documentsResolverService;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$deleteDocumentModal = this.$element.find( ".delete.document.modal" ).modal( { closable: false } );
	}

	public onSubmitDeleteDocument( data:{}, $event:any ):void {
		this.documentsResolverService.delete(  this.documentURI ).then( ( result ) => {
			this.onSuccess.emit( DocumentExplorerLibrary.getParentURI( this.documentURI ) );
			this.hide();
		} ).catch( ( error:HTTPError ) => {
			this.onError.emit( error );
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} );
	}

	private clearErrorMessage():void {
		this.errorMessage = null;
	}

	public show():void {
		this.$deleteDocumentModal.modal( "show" );
	}

	public hide():void {
		this.hideDeleteDocumentForm();
	}

	public hideDeleteDocumentForm():void {
		this.$deleteDocumentModal.modal( "hide" );
		this.clearErrorMessage();
	}

	public toggle():void {
		this.$deleteDocumentModal.modal( "toggle" );
	}

}

