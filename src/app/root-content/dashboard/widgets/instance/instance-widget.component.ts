import { Component, ElementRef, Input, Output, EventEmitter } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import { WidgetsService } from "../widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import * as $ from "jquery";

@Component( {
	selector: "cw-instance-widget",
	templateUrl: "./instance-widget.component.html",
	styleUrls: [ ],
})

export class InstanceWidgetComponent {
	private element:ElementRef;
	private $element:JQuery;
	private carbon:Carbon;

	widgetsService:WidgetsService;
	carbonldpPlatform:string = "";
	carbonldpURL:string = "";
	carbonldpBuildDate;
	hide:boolean = true;
	
	errorMessage:Message;
	
	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();
	
	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.carbon = carbon;
		this.widgetsService = widgetsService;
	}

	ngOnInit():void {
		this.$element = $( this.element.nativeElement );
	}

	ngAfterViewInit():void{
		this.carbonldpURL="";
		this.carbonldpBuildDate = "";
		this.carbonldpPlatform = "";
		this.getPlatformMetadata();
	}

	collapseWidget(){
		this.hide = !this.hide;
	}

	refreshWidget(){
		this.getPlatformMetadata();
	}

	getPlatformMetadata(){
		this.carbonldpURL = this.carbon.baseURI;
		this.widgetsService.getPlatformMetadata().then( ( platformMetadata ) => {
			this.carbonldpBuildDate = platformMetadata.buildDate.toDateString();
			this.carbonldpPlatform = platformMetadata.version;
		} )
		.catch( ( error:any ) => {
			this.errorWidget( error );
		} );
	}


	public errorWidget( error ) {
		this.element.nativeElement.classList.add( "error" );
		this.errorMessage = this.getErrorMessage( error );
		this.onErrorOccurs.emit( this.errorMessage );
	}

	public getErrorMessage( error:any ):Message {
		return ErrorMessageGenerator.getErrorMessage( error );
	}
}