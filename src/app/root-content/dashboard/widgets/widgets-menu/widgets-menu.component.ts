import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Widget } from "../widgets.component";

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

	toggleSelection( e, widget:Widget ) {
		widget.hide = ! widget.hide;
	}
}