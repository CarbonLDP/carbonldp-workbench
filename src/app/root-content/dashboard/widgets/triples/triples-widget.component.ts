import { Component, ElementRef, Input, Output, EventEmitter } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";

import { WidgetsService } from "../widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-triples-widget",
	templateUrl: "./triples-widget.component.html",
	styleUrls: [],
} )

export class TriplesWidgetComponent {
	carbon:Carbon;
	element:ElementRef;
	widgetsService:WidgetsService;
	widgetIcon = "/assets/images/triplesIcon.png";
	triplesTotalCount;
	messages:any[] = [];

	@Input() emitErrors:boolean = false;
	@Output() errorOccurs:EventEmitter<any> = new EventEmitter();

	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbon = carbon;
	}

	ngAfterViewInit():void {
		this.getTriplesCount();
	}


	public refreshTriplesCount() {
		this.getTriplesCount();
	}

	public getTriplesCount() {
		this.widgetsService.getTriplesTotalCount()
			.then( ( count ) => {
				let widget = document.querySelector( ".widget-container--totalDocuments" );
				this.triplesTotalCount = count;
				this.widgetIcon = "/assets/images/triplesIcon.png";
				widget.classList.remove( "error" );
			} )
			.catch( ( error:any ) => {
				let widget = document.querySelector( ".widget-container--totalTriples" );
				this.widgetIcon = "/assets/images/triplesBrokenIcon.png";
				widget.classList.add( "error" );
				if( this.emitErrors ) {
					this.errorOccurs.emit( this.getErrorMessage( error ) );
				} else {
					this.messages.push( this.getErrorMessage( error ) );
				}
			} );
	}

	public close( e, widgetName ) {

		let widget = document.querySelector( ".widget-container--totalTriples" );
		let widgetsMenuItem = document.querySelector( ".widgetsMenu-item--totalTriples" );


		this.widgetsService.closeWidget( widget, widgetsMenuItem );

	}

	public getErrorMessage( error:any ):Message {
		return ErrorMessageGenerator.getErrorMessage( error );
	}


}