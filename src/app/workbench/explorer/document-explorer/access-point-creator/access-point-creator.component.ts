import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";
import { NgForm } from "@angular/forms";

import { CarbonLDP } from "carbonldp";
import { Response, Errors } from "carbonldp/HTTP";
import { PersistedDocument } from "carbonldp/PersistedDocument";
import { AccessPointBase } from "carbonldp/AccessPoint";

import { DocumentsResolverService } from "../documents-resolver.service"
import { Message } from "app/shared/messages-area/message.component";
import { DocumentExplorerLibrary } from "app/workbench/explorer/document-explorer/document-explorer-library";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-access-point-creator",
	templateUrl: "./access-point-creator.component.html",
} )

export class AccessPointCreatorComponent implements AfterViewInit {

	private carbonldp:CarbonLDP;
	private element:ElementRef;
	private $element:JQuery;
	private $createAccessPointModal:JQuery;

	private documentsResolverService:DocumentsResolverService;
	private errorMessage:Message;
	private createAccessPointFormModel:{ slug:string, hasMemberRelation:string, isMemberOfRelation:string } = {
		slug: "",
		hasMemberRelation: "",
		isMemberOfRelation: ""
	};

	public visible:boolean = true;

	@Input() parentURI:string = "";
	@Output() onSuccess:EventEmitter<any> = new EventEmitter<any>();
	@Output() onError:EventEmitter<any> = new EventEmitter<any>();


	constructor( element:ElementRef, carbonldp:CarbonLDP, documentsResolverService:DocumentsResolverService ) {
		this.element = element;
		this.carbonldp = carbonldp;
		this.documentsResolverService = documentsResolverService;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$createAccessPointModal = this.$element.find( ".create.accesspoint.modal" ).modal( { closable: false } );
	}

	private onSubmitAccessPoint( data:{ slug:string, hasMemberRelation:string, isMemberOfRelation:string }, $event:any, form:NgForm ):void {
		$event.preventDefault();
		let slug:string = data.slug;
		let accessPoint:AccessPointBase = {
			hasMemberRelation: data.hasMemberRelation
		};
		if( ! ! data.isMemberOfRelation ) accessPoint.isMemberOfRelation = data.isMemberOfRelation;

		this.carbonldp.documents.get( this.parentURI ).then( ( document:PersistedDocument ) => {
			return this.documentsResolverService.createAccessPoint( document, accessPoint, slug );
		} ).then( ( document:PersistedDocument ) => {
			this.onSuccess.emit( document );
			form.resetForm();
			this.hide();
		} ).catch( ( error:Errors.HTTPError ) => {
			this.onError.emit( error );
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} );
	}

	private clearErrorMessage():void {
		this.errorMessage = null;
	}

	private getSanitizedSlug( slug:string ):string {
		return DocumentExplorerLibrary.getSanitizedSlug( slug );
	}

	private slugLostFocus( evt:any ):void {
		evt.target.value = DocumentExplorerLibrary.getAppendedSlashSlug( evt.target.value );
	}

	public show():void {
		this.$createAccessPointModal.modal( "show" );
	}

	public hide():void {
		this.hideForm();
	}

	private hideForm():void {
		this.$createAccessPointModal.modal( "hide" );
		this.clearErrorMessage();
		this.createAccessPointFormModel.slug = "";
		this.createAccessPointFormModel.hasMemberRelation = "";
		this.createAccessPointFormModel.isMemberOfRelation = "";
	}

	public toggle():void {
		this.$createAccessPointModal.modal( "toggle" );
	}

}
