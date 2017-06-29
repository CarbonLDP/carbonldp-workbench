import { Component, ElementRef, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";

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
	
	@Input() widgetHide:boolean;
	@Output() errorOccurs:EventEmitter<any> = new EventEmitter();
	@Output() widgetHideChange:EventEmitter<boolean>=new EventEmitter<boolean>();

	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbon = carbon;
	}
	
	ngOnChanges( changes:SimpleChanges ):void{
		if( changes["widgetHide"].currentValue === false ) this.refreshWidget();
	}
	
	ngAfterViewInit():void {
		this.getTriplesCount();
	}

	public refreshWidget() {
		let widget = document.querySelector( ".widget-container--totalTriples" );
		if( widget !== null ) widget.classList.remove("error");
		this.triplesTotalCount = null;
		this.getTriplesCount();
	}

	public closeWidget() {
		this.widgetHideChange.emit(true);
	}

	public getErrorMessage( error:any ):Message {
		return ErrorMessageGenerator.getErrorMessage( error );
	}

	public errorWidget( error ) {
		let widget = document.querySelector( ".widget-container--totalTriples" );
		this.widgetIcon = "/assets/images/triplesBrokenIcon.png";
		widget.classList.add( "error" );
		this.errorOccurs.emit( this.getErrorMessage( error ) );
	}

	public getTriplesCount() {
		this.widgetsService.getTriplesTotalCount()
			.then( ( count ) => {
				let widget = document.querySelector( ".widget-container--totalTriples" );
				this.triplesTotalCount = count;
				this.widgetIcon = "/assets/images/triplesIcon.png";
				widget.classList.remove( "error" );
			} )
			.catch( ( error:any ) => {
				this.errorWidget( error );

			} );
	}

}