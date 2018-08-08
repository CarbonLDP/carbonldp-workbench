import { Component, Input, Output, EventEmitter } from "@angular/core";

import { CarbonLDP } from "carbonldp";

import { CustomWidget } from "../../widgets.component";
import { WidgetsService } from "../../widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-custom-counter-widget",
	templateUrl: "./custom-count-widget.component.html",
	styleUrls: [ "./custom-count-widget.component.scss" ]
} )

export class CustomCountWidgetComponent {
	carbonldp:CarbonLDP;
	widgetsService:WidgetsService;
	errorMessage:Message;
	customTotalCount: number;
	widgetElement: Element;

	private oldWidgetHide:boolean;

	@Input() widget:CustomWidget;
	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();
	@Output() onClose:EventEmitter<CustomWidget> = new EventEmitter<CustomWidget>();

	constructor( carbonldp:CarbonLDP, widgetsService:WidgetsService ) {
		this.widgetsService = widgetsService;
		this.carbonldp = carbonldp;
	}

	ngDoCheck() {
		if( this.widget.hide != this.oldWidgetHide ) {
			this.oldWidgetHide = this.widget.hide;
			if( ! this.widget.hide ) this.refreshWidget();
		}
	}

	ngOnInit():void {
		this.widgetElement = document.querySelector( ".widget-container--totalCounter--"+this.widget.id );
		this.getCustomCount();
	}

	public refreshWidget() {
		this.errorMessage = null;
		this.customTotalCount = null;
		this.getCustomCount();
	}

	public closeWidget() {
		this.onClose.emit( this.widget );
	}

	public getErrorMessage( error:any ):Message {
		return ErrorMessageGenerator.getErrorMessage( error );
	}

	public errorWidget( error ) {
		this.widgetElement.classList.add( "error" )
		this.errorMessage = this.getErrorMessage( error );
		this.onErrorOccurs.emit( this.errorMessage );
	}

	public getCustomCount() {
		this.widgetsService.getCustomTotalCount( this.widget.query, this.widget.mainVariable )
			.then( ( count ) => {
				this.customTotalCount = count;
				this.widgetElement.classList.remove( "error" );
			} )
			.catch( ( error:any ) => {
				this.errorWidget( error );
			} );
	}

}