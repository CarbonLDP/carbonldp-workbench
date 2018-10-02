import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";
import { NgForm } from "@angular/forms";

import { CarbonLDP } from "carbonldp";
import { Errors } from "carbonldp/HTTP";
import { Document } from "carbonldp/Document";
import { AccessPoint, BaseAccessPoint } from "carbonldp/AccessPoint";

import { DocumentsResolverService } from "../documents-resolver.service"
import { Message } from "app/shared/messages-area/message.component";
import { DocumentExplorerLibrary } from "app/workbench/explorer/document-explorer/document-explorer-library";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";


/*
*  Creates Access Points via the Document Explorer
* */
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
		let baseAccessPoint:BaseAccessPoint = {
			hasMemberRelation: data.hasMemberRelation
		};
		if( ! ! data.isMemberOfRelation ) baseAccessPoint.isMemberOfRelation = data.isMemberOfRelation;
		let accessPoint = AccessPoint.create( baseAccessPoint );

		this.carbonldp.documents.$get( this.parentURI ).then( ( document:Document ) => {
			return this.documentsResolverService.createAccessPoint( document, accessPoint, slug );
		} ).then( ( document:Document ) => {
			this.onSuccess.emit( document );
			form.resetForm();
			this.hide();
		} ).catch( async ( error:Errors.HTTPError ) => {
			ErrorMessageGenerator.getErrorMessage( error, this.carbonldp ).then( ( errorMessage ) => {
				this.onError.emit( error );
				this.errorMessage = errorMessage;
			} );
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
