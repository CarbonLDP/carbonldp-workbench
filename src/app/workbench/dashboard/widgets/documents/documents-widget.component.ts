import { Component, ElementRef, EventEmitter, HostBinding, Input, Output } from "@angular/core";

import { CarbonLDP } from "carbonldp";

import { Widget } from "../widgets.component";
import { WidgetsService } from "../widgets.service";
import { ErrorMessageGenerator } from "app/common/components/messages-area/error/error-message-generator";


/*
*  Widget that displays the total number of Document in a Carbon LDP instance
* */
@Component( {
	selector: "cw-documents-widget",
	templateUrl: "./documents-widget.component.html",
	styleUrls: [ "./documents-widget.component.scss" ]
} )
export class DocumentsWidgetComponent {
	private element:ElementRef;
	private carbonldp:CarbonLDP;
	private widgetsService:WidgetsService;

	documentsTotalCount:number;

	private oldWidgetHide:boolean;

	@Input() widget:Widget;
	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();
	@Output() onClose:EventEmitter<Widget> = new EventEmitter<Widget>();
	@HostBinding( "class.error" ) hasError:boolean = false;

	constructor( element:ElementRef, carbonldp:CarbonLDP, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbonldp = carbonldp;
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

	refreshWidget() {
		this.resetWidget();
		this.getDocumentsCount();
	}

	closeWidget() {
		this.onClose.emit( this.widget );
	}

	private resetWidget():void {
		this.hasError = false;
		this.documentsTotalCount = null;
	}

	private getDocumentsCount() {
		this.resetWidget();
		this.widgetsService.getDocumentsTotalCount()
			.then( ( count ) => {
				this.documentsTotalCount = count;
			} )
			.catch( ( error:any ) => {
				this.hasError = true;
				this.onErrorOccurs.emit( ErrorMessageGenerator.getErrorMessage( error ) );
			} );
	}
}