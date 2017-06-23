import { Component, ElementRef } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";

import { WidgetsService } from "../widgets.service";

import "semantic-ui/semantic";

@Component({
	selector: "cw-documents-widget",
	templateUrl: "./documents-widget.component.html",
	styleUrls: [ "../widget.component.scss" ],
})

export class DocumentsWidgetComponent{
	carbon:Carbon;
	element:ElementRef;
	widgetsService:WidgetsService;
	documentsTotalCount;


	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.widgetsService = widgetsService;
		this.carbon = carbon;
	}

	ngOnInit():void {
		this.widgetsService.getDocumentsTotalCount().then( ( count ) => { this.documentsTotalCount = count; });
	}

	public refreshDocumentsCount(){
		this.widgetsService.getDocumentsTotalCount().then( ( count ) => { this.documentsTotalCount = count; });
	}

	public close(e, widgetName){
		let widget = document.querySelector(".widget-container--totalDocuments");
		let widgetsMenuItem = document.querySelector(".widgetsMenu-item--totalDocuments");
		
		this.widgetsService.closeWidget(widget, widgetsMenuItem);

	}


}