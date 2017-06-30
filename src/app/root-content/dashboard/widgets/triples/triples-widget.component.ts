import { Component, ElementRef, Input, Output, EventEmitter } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";

import { WidgetsService } from "../widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";
import { Widget } from "app/root-content/dashboard/widgets/widget.component";

@Component( {
	selector: "cw-triples-widget",
	templateUrl: "./triples-widget.component.html",
	styleUrls: [],
} )

export class TriplesWidgetComponent {
	carbon:Carbon;
	element:ElementRef;
	widgetsService:WidgetsService;
	errorMessage:Message;
	triplesTotalCount;
	
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
		this.getTriplesCount();
	}

	public refreshWidget() {
		this.errorMessage = null;
		this.triplesTotalCount = null;
		this.getTriplesCount();
	}

	public closeWidget() {
		this.onClose.emit( this.widget );
	}

	public getErrorMessage( error:any ):Message {
		return ErrorMessageGenerator.getErrorMessage( error );
	}

	public errorWidget( error ) {
		this.element.nativeElement.classList.add( "error" );
		this.errorMessage = this.getErrorMessage( error );
		this.onErrorOccurs.emit( this.errorMessage );
	}

	public getTriplesCount() {
		this.widgetsService.getTriplesTotalCount()
			.then( ( count ) => {
				let widget = document.querySelector( ".widget-container--totalTriples" );
				this.triplesTotalCount = count;
				widget.classList.remove( "error" );
			} )
			.catch( ( error:any ) => {
				this.errorWidget( error );
			} );
	}

}