import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Widget } from "../widget.component";

import * as $ from "jquery";

import { WidgetsService } from "../widgets.service";

@Component( {
	selector: "cw-widgets-menu",
	templateUrl: "./widgets-menu.component.html",
	styleUrls: [ "./widgets-menu.component.scss" ],
} )

export class WidgetsMenu {
	widgetsService:WidgetsService;

	@Input() widgetsList:Widget[];
	@Output() widgetsListChange:EventEmitter<Widget[]> = new EventEmitter<Widget[]>();

	constructor( widgetsService:WidgetsService ) {
		this.widgetsService = widgetsService;
	}

	ngOnInit():void {
		this.initializeDropdown();
	}

	initializeDropdown() {
		$( ".ui.dropdown" ).dropdown( {
			action: "nothing"
		} );
	}

	toggleSelection( e, widgetId ) {
		let widget:Element;
		this.widgetsList[ widgetId - 1 ][ "hide" ] = ! this.widgetsList[ widgetId - 1 ][ "hide" ];
		this.widgetsListChange.emit( this.widgetsList );

	}
}