import { Component, ElementRef, Input, Output, EventEmitter } from "@angular/core";

import { CarbonLDP } from "carbonldp";

import { CustomWidget } from "app/root-content/dashboard/widgets/widgets.component";
import { WidgetsService } from "app/root-content/dashboard/widgets/widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-custom-widgets",
	templateUrl: "./custom-widgets.component.html",
	styleUrls: [ "./custom-widgets.component.scss" ]
} )

export class CustomWidgetsComponent {
	carbonldp:CarbonLDP;
	element:ElementRef;
	widgetsService:WidgetsService;
	errorMessage:Message;

	private oldWidgetHide:boolean;

	@Input() widget:CustomWidget;
	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();
	@Output() onClose:EventEmitter<CustomWidget> = new EventEmitter<CustomWidget>();

	constructor( element:ElementRef, carbonldp:CarbonLDP, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbonldp = carbonldp;
	}

	ngDoCheck() {
		// if( this.widget.hide != this.oldWidgetHide ) {
		// 	this.oldWidgetHide = this.widget.hide;
		//
		// 	if( ! this.widget.hide ) this.refreshWidget();
		// }
	}

	ngOnInit():void {
	}


	public closeWidget( widget:CustomWidget) {
		this.onClose.emit( widget );
	}

	get isCustomWidget(){
		return !!this.widget.type
	}
	public errorWidget( error ) {
		this.onErrorOccurs.emit( error );
	}

}