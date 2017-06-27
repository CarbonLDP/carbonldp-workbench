import { Component, ElementRef, Input, Output, EventEmitter } from "@angular/core";

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
	@Output() errorOccurs:EventEmitter<any> = new EventEmitter();

	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbon = carbon;
	}

	ngAfterViewInit():void {
		this.getDocumentsCount();
	}

	public refreshDocumentsCount() {
		this.getDocumentsCount();
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

	public close( e, widgetName ) {
		let widget = document.querySelector( ".widget-container--totalDocuments" );
		let widgetsMenuItem = document.querySelector( ".widgetsMenu-item--totalDocuments" );

		this.widgetsService.closeWidget( widget, widgetsMenuItem );

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
}