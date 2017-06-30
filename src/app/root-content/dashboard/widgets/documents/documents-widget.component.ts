import { Component, ElementRef, Input, Output, EventEmitter } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";

import { Widget } from "../widgets.component";
import { WidgetsService } from "../widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-documents-widget",
	templateUrl: "./documents-widget.component.html",
	styleUrls: [],
} )

export class DocumentsWidgetComponent {
	carbon:Carbon;
	element:ElementRef;
	errorMessage:Message;
	widgetsService:WidgetsService;
	documentsTotalCount;

	private oldWidgetHide:boolean;

	@Input() widget:Widget;
	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();
	@Output() onClose:EventEmitter<Widget> = new EventEmitter<Widget>();

	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbon = carbon;
	}

	ngDoCheck() {
		if( this.widget.hide != this.oldWidgetHide ) {
			this.oldWidgetHide = this.widget.hide;

			if( ! this.widget.hide ) this.refreshWidget();
		}
	}

	ngAfterViewInit():void {
		this.getDocumentsCount();
	}

	public refreshWidget() {
		this.errorMessage = null;
		this.element.nativeElement.classList.add( "error" );
		this.documentsTotalCount = null;
		this.getDocumentsCount();
	}

	public closeWidget() {
		this.onClose.emit( this.widget );
	}

	public errorWidget( error ) {
		this.element.nativeElement.classList.add( "error" );
		this.errorMessage = this.getErrorMessage( error );
		this.onErrorOccurs.emit( this.errorMessage );
	}

	public getErrorMessage( error:any ):Message {
		return ErrorMessageGenerator.getErrorMessage( error );
	}

	public getDocumentsCount() {
		this.widgetsService.getDocumentsTotalCount()
			.then( ( count ) => {
				let widget = document.querySelector( ".widget-container--totalDocuments" );
				this.documentsTotalCount = count;
				widget.classList.remove( "error" );
			} )
			.catch( ( error:any ) => {
				this.errorWidget( error );
			} );
	}
}