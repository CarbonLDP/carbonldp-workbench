import { Component, ElementRef, Input, Output, EventEmitter } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import { WidgetsService } from "../widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import * as $ from "jquery";

@Component( {
	selector: "cw-instance-widget",
	templateUrl: "./instance-widget.component.html",
	styleUrls: [ "./instance-widget.component.scss" ],
} )

export class InstanceWidgetComponent {
	private element:ElementRef;
	private $element:JQuery;
	private carbon:Carbon;

	widgetsService:WidgetsService;
	carbonldpVersion:string = "";
	carbonldpURL:string = "";
	carbonldpBuildDate:Date = null;
	hide:boolean = true;
	platformMetadata;

	errorMessage:Message;

	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();

	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.carbon = carbon;
		this.widgetsService = widgetsService;
	}

	ngAfterViewInit():void {
		this.getPlatformMetadata();
	}

	collapseWidget() {
		this.hide = ! this.hide;
		if( ! this.hide ) {
			this.refreshWidget();
		}
	}

	refreshWidget() {
		this.errorMessage = null;
		this.carbonldpBuildDate = null;
		this.carbonldpVersion = null;

		if( ! this.platformMetadata ) return this.getPlatformMetadata()


		this.widgetsService.refreshPlatformMetadata( this.platformMetadata ).then( ( platformMetadata )=> {
			this.platformMetadata = platformMetadata;
			this.carbonldpBuildDate = platformMetadata[ "buildDate" ];
			this.carbonldpVersion = platformMetadata[ "version" ];
		} ).catch( ( error:any ) => {
			this.errorWidget( error );
		} );
	}

	getPlatformMetadata() {
		this.element.nativeElement.classList.remove( "error" );

		this.widgetsService.getPlatformMetadata().then( ( platformMetadata ) => {
			this.carbonldpURL = this.carbon.baseURI;
			this.platformMetadata = platformMetadata;
			this.carbonldpBuildDate = platformMetadata[ "buildDate" ];
			this.carbonldpVersion = platformMetadata[ "version" ];
		} ).catch( ( error:any ) => {
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