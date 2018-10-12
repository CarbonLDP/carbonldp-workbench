import { Component, ElementRef, EventEmitter, HostBinding, Input, Output } from "@angular/core";

import { CarbonLDP } from "carbonldp";

import { Widget } from "app/workbench/dashboard/widgets/widgets.component";
import { WidgetsService } from "../widgets.service";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";


/*
*  Widget that displays the existing triples in a Carbon LDP instance
* */
@Component( {
	selector: "cw-triples-widget",
	templateUrl: "./triples-widget.component.html",
	styleUrls: [ "./triples-widget.component.scss" ]
} )
export class TriplesWidgetComponent {
	carbonldp:CarbonLDP;

	element:ElementRef;
	$element:JQuery;
	widgetsService:WidgetsService;

	triplesTotalCount:number;

	private oldWidgetHide:boolean;

	@Input() widget:Widget;
	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();
	@Output() onClose:EventEmitter<Widget> = new EventEmitter<Widget>();
	@HostBinding( "class.error" ) hasError:boolean = false;

	constructor( element:ElementRef, carbonldp:CarbonLDP, widgetsService:WidgetsService ) {
		this.element = element;
		this.carbonldp = carbonldp;
		this.widgetsService = widgetsService;
	}

	ngDoCheck() {
		if( this.widget.hide != this.oldWidgetHide ) {
			this.oldWidgetHide = this.widget.hide;

			if( ! this.widget.hide ) this.refreshWidget();
		}
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.getTriplesCount();
	}

	refreshWidget():void {
		this.getTriplesCount();
	}

	closeWidget():void {
		this.onClose.emit( this.widget );
	}

	resetWidget():void {
		this.hasError = false;
		this.triplesTotalCount = null;
	}

	private getTriplesCount():void {
		this.resetWidget();
		this.widgetsService
			.getTriplesTotalCount()
			.then( ( count:number ) => {
				this.triplesTotalCount = count;
			} )
			.catch( ( error:any ) => {
				this.hasError = true;
				this.onErrorOccurs.emit( ErrorMessageGenerator.getErrorMessage( error ) );
			} );
	}

}