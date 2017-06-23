import { Component, ElementRef } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";

import { WidgetsService } from "../widgets.service";

import "semantic-ui/semantic";

@Component({
	selector: "cw-triples-widget",
	templateUrl: "./triples-widget.component.html",
	styleUrls: [],
})

export class TriplesWidgetComponent{
	carbon:Carbon;
	element:ElementRef;
	widgetsService:WidgetsService;
	triplesTotalCount;


	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbon = carbon;
	}

	ngOnInit():void {
		this.widgetsService.getTriplesTotalCount().then( ( count ) => { this.triplesTotalCount = count; });
	}
	

	public refreshTriplesCount(){

		this.widgetsService.getTriplesTotalCount().then( ( count ) => { this.triplesTotalCount = count; });
	}

	public close(e, widgetName){
		
		let widget = document.querySelector(".widget-container--totalTriples");
		let widgetsMenuItem = document.querySelector(".widgetsMenu-item--totalTriples");
		

		this.widgetsService.closeWidget(widget, widgetsMenuItem);

	}


}