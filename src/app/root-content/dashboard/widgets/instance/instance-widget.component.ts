import { Component, ElementRef, Output, EventEmitter } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { C } from "carbonldp/Vocabularies";

import { WidgetsService } from "../widgets.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

@Component( {
	selector: "cw-instance-widget",
	templateUrl: "./instance-widget.component.html",
	styleUrls: [ "./instance-widget.component.scss" ],
} )

export class InstanceWidgetComponent {
	private element:ElementRef;
	private carbonldp:CarbonLDP;
	private widgetsService:WidgetsService;

	carbonldpVersion:string;
	carbonldpURL:string;
	carbonldpBuildDate:Date;
	hide:boolean = false;
	platformMetadata;

	errorMessage:Message;

	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();

	constructor( element:ElementRef, carbonldp:CarbonLDP, widgetsService:WidgetsService ) {
		this.element = element;
		this.carbonldp = carbonldp;
		this.widgetsService = widgetsService;
	}

	ngOnInit():void {
		this.getPlatformMetadata();
	}

	public collapseWidget( $event:MouseEvent ):void {
		$event.stopImmediatePropagation();
		this.hide = ! this.hide;
		if( ! this.hide ) {
			this.refreshWidget();
		}
	}

	public refreshWidget( event?:MouseEvent ): Promise<any> {
		if( event ) event.stopImmediatePropagation();
		this.errorMessage = null;
		this.carbonldpBuildDate = null;
		this.carbonldpVersion = null;

		if( ! this.platformMetadata ) return this.getPlatformMetadata();


		return this.widgetsService.refreshPlatformMetadata( this.platformMetadata ).then( ( platformMetadata ) => {
			this.platformMetadata = platformMetadata;
			this.carbonldpBuildDate = platformMetadata[ "buildDate" ];
			this.carbonldpVersion = platformMetadata[ "version" ];
			this.element.nativeElement.classList.remove( "error" );
		} ).catch( ( error:any ) => {
			this.errorWidget( error );
		} );
	}

	private getPlatformMetadata():Promise<any> {
		// TODO: Remove extendObjectSchema when SDK implements instance with its properties
		this.carbonldp.extendObjectSchema( C.namespace + "PlatformInstance", {
			"version": {
				"@id": C.namespace + "version",
				"@type": "string"
			},
			"buildDate": {
				"@id": C.namespace + "buildDate",
				"@type": "dateTime"
			}
		} );
		this.carbonldp.extendObjectSchema( C.namespace + "Platform", {
			"instance": {
				"@id": C.namespace + "instance",
				"@type": "@id"
			}
		} );

		return this.widgetsService.getPlatformMetadata().then( ( platformMetadata:any ) => {
			this.platformMetadata = platformMetadata;
			this.carbonldpURL = this.carbonldp.baseURI;
			this.carbonldpBuildDate = platformMetadata.instance.buildDate;
			this.carbonldpVersion = platformMetadata.instance.version;
			this.element.nativeElement.classList.remove( "error" );
		} ).catch( ( error:any ) => {
			this.errorWidget( error );
		} );
	}


	private errorWidget( error ) {
		this.element.nativeElement.classList.add( "error" );
		this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		this.onErrorOccurs.emit( this.errorMessage );
	}
}