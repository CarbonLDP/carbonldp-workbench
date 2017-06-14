import { Component, ElementRef } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";

import { WidgetsService } from "./widgets.service";

import "semantic-ui/semantic";

@Component({
	selector: "cw-widgets",
	templateUrl: "./widget.component.html",
	styleUrls: [ "./widget.component.scss" ],
})

export class WidgetComponent{
	carbon:Carbon;
	element:ElementRef;
	widgetsService:WidgetsService;
	documentsTotalCount;
	triplesTotalCount;


	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbon = carbon;
	}

	ngOnInit():void {
		this.widgetsService.getDocumentsTotalCount().then( ( count ) => { this.documentsTotalCount = count; });
		this.widgetsService.getTriplesTotalCount().then( ( count ) => { this.triplesTotalCount = count; });
	}
	
	public refreshDocumentsCount(){
		this.widgetsService.getDocumentsTotalCount().then( ( count ) => { this.documentsTotalCount = count; });
	}

	public refreshTriplesCount(){

		this.widgetsService.getTriplesTotalCount().then( ( count ) => { this.triplesTotalCount = count; });
	}

	public close(e, widgetName){
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

		this.widgetsService.closeWidget(widget, widgetsMenuItem);

	}


}