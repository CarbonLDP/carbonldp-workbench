import { Component } from "@angular/core";

import * as $ from "jquery";

import { WidgetsService } from "./widgets.service";

@Component({
	selector: "cw-widgets-menu",
	templateUrl: "./widgets-menu.component.html",
	styleUrls: [ "./widgets-menu.component.scss" ],
})

export class WidgetsMenu{
	widgetsService:WidgetsService;

	constructor( widgetsService:WidgetsService ){
		this.widgetsService	= widgetsService;
	}

	ngOnInit():void{
		this.initializeDropdown();
	}

	initializeDropdown(){
		$(".ui.dropdown").dropdown( {
			action: "nothing"
		});
	}

	toggleSelection(e, widgetName){
		let widget:Element;
		let widgetsMenuItem:Element;
		if( widgetName === "Triples") {
			widget = document.querySelector(".widget-container--totalTriples");
			widgetsMenuItem = document.querySelector(".widgetsMenu-item--totalTriples");
		} else if ( widgetName === "Documents" ){
			widget = document.querySelector(".widget-container--totalDocuments");
			widgetsMenuItem = document.querySelector(".widgetsMenu-item--totalDocuments");
		} else {
			return false;
		}

		this.widgetsService.toggleWidget(widget, widgetsMenuItem);
	}
}