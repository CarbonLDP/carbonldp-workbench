import { Component, ElementRef, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";

import { WidgetsService } from "../widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-documents-widget",
	templateUrl: "./documents-widget.component.html",
	styleUrls: [ "../widget.component.scss" ],
} )

export class DocumentsWidgetComponent {
	carbon:Carbon;
	element:ElementRef;
	widgetsService:WidgetsService;
	widgetIcon = "/assets/images/documentIcon.png";
	documentsTotalCount;
	messages:any[] = [];

	@Input() emitErrors:boolean = false;
	@Input() widgetHide:boolean;
	@Output() errorOccurs:EventEmitter<any> = new EventEmitter();
	@Output() widgetHideChange:EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbon = carbon;
	}

	ngOnChanges( changes:SimpleChanges ):void {
		if( changes[ "widgetHide" ].currentValue === false ) this.refreshWidget();
	}

	ngAfterViewInit():void {
		this.getDocumentsCount();
	}

	public refreshWidget() {
		let widget = document.querySelector( ".widget-container--totalDocuments" );
		if( widget !== null )  widget.classList.remove( "error" );
		this.documentsTotalCount = null;
		this.getDocumentsCount();
	}

	public closeWidget() {
		this.widgetHideChange.emit( true );
	}

	public errorWidget( error ) {
		let widget = document.querySelector( ".widget-container--totalDocuments" );
		this.widgetIcon = "/assets/images/documentBrokenIcon.png";
		widget.classList.add( "error" );
		if( this.emitErrors )
			this.errorOccurs.emit( this.getErrorMessage( error ) );
		else {
			this.messages.push( this.getErrorMessage( error ) );
		}
	}

	public getErrorMessage( error:any ):Message {
		return ErrorMessageGenerator.getErrorMessage( error );
	}

	public getDocumentsCount() {
		this.widgetsService.getDocumentsTotalCount()
			.then( ( count ) => {
				let widget = document.querySelector( ".widget-container--totalDocuments" );
				this.documentsTotalCount = count;
				this.widgetIcon = "/assets/images/documentIcon.png";
				widget.classList.remove( "error" );
			} )
			.catch( ( error:any ) => {
				this.errorWidget( error );
			} );
	}
}