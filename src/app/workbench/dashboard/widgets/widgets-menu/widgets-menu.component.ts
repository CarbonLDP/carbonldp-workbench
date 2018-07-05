import { Component, Input, ElementRef } from "@angular/core";

import * as $ from "jquery";

import { WidgetsService } from "../widgets.service";
import { Widget } from "../widgets.component";


/*
*  Menu that lists all the Dashboard's Widgets
* */
@Component( {
	selector: "cw-widgets-menu",
	templateUrl: "./widgets-menu.component.html",
	styleUrls: [ "./widgets-menu.component.scss" ],
} )
export class WidgetsMenu {
	$element:JQuery;
	element:ElementRef;
	widgetsService:WidgetsService;

	@Input() widgetsList:Widget[];

	constructor( element:ElementRef, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.initializeDropdown();
	}

	initializeDropdown() {
		this.$element.find( ".ui.dropdown" ).dropdown( {
			action: "nothing"
		} );
	}

	toggleSelection( e, widget:Widget ) {
		widget.hide = ! widget.hide;
	}
}