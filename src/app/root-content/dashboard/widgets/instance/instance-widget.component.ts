import { Component, ElementRef, Output, EventEmitter } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as NS from "carbonldp/NS";

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
	private carbon:Carbon;
	private widgetsService:WidgetsService;

	carbonldpVersion:string;
	carbonldpURL:string;
	carbonldpBuildDate:Date;
	hide:boolean = false;
	platformMetadata;

	errorMessage:Message;

	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();

	constructor( element:ElementRef, carbon:Carbon, widgetsService:WidgetsService ) {
		this.element = element;
		this.carbon = carbon;
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
		this.carbon.extendObjectSchema( NS.C.namespace + "PlatformInstance", {
			"version": {
				"@id": NS.C.namespace + "version",
				"@type": "string"
			},
			"buildDate": {
				"@id": NS.C.namespace + "buildDate",
				"@type": "dateTime"
			}
		} );
		this.carbon.extendObjectSchema( NS.C.namespace + "Platform", {
			"instance": {
				"@id": NS.C.namespace + "instance",
				"@type": "@id"
			}
		} );

		return this.widgetsService.getPlatformMetadata().then( ( platformMetadata:any ) => {
			this.platformMetadata = platformMetadata;
			this.carbonldpURL = this.carbon.baseURI;
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