import { Component, Output, HostBinding, ElementRef, EventEmitter } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { PlatformMetadata } from "carbonldp/System/PlatformMetadata";

import { WidgetsService } from "../widgets.service";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";


/*
*  Widget that displays specific data of the Carbon LDP instance
* */
@Component( {
	selector: "cw-instance-widget",
	templateUrl: "./instance-widget.component.html",
	styleUrls: [ "./instance-widget.component.scss" ],
} )
export class InstanceWidgetComponent {
	private carbonldp:CarbonLDP;
	private widgetsService:WidgetsService;

	carbonldpVersion:string;
	carbonldpURL:string;
	carbonldpBuildDate:Date;
	hide:boolean = false;
	platformMetadata:PlatformMetadata;

	@Output() onErrorOccurs:EventEmitter<any> = new EventEmitter();
	@HostBinding( "class.error" ) hasError:boolean = false;

	constructor( carbonldp:CarbonLDP, widgetsService:WidgetsService ) {
		this.carbonldp = carbonldp;
		this.widgetsService = widgetsService;
	}

	ngOnInit():void {
		this.getPlatformMetadata();
	}

	collapseWidget( $event:MouseEvent ):void {
		$event.stopImmediatePropagation();
		this.hide = ! this.hide;
		if( ! this.hide ) {
			this.refreshWidget();
		}
	}

	resetWidget():void {
		this.hasError = false;
		this.carbonldpVersion = null;
		this.carbonldpBuildDate = null;
	}

	setValues( version:string, buildDate:Date ):void {
		this.carbonldpURL = this.carbonldp.baseURI;
		this.carbonldpVersion = version;
		this.carbonldpBuildDate = buildDate;
	}

	refreshWidget( event?:MouseEvent ):Promise<any> {
		if( event ) event.stopImmediatePropagation();
		this.resetWidget();

		return ! this.platformMetadata ? this.getPlatformMetadata() : this.refreshPlatformMetadata();
	}

	private refreshPlatformMetadata():Promise<any> {
		this.resetWidget();
		return this.widgetsService.refreshPlatformMetadata( this.platformMetadata )
			.then( ( platformMetadata:PlatformMetadata ) => {
				this.platformMetadata = platformMetadata;
				this.setValues( platformMetadata.instance.version, platformMetadata.instance.buildDate )
			} ).catch( ( error:any ) => {
				this.hasError = true;
				this.onErrorOccurs.emit( ErrorMessageGenerator.getErrorMessage( error ) );
			} );
	}

	private getPlatformMetadata():Promise<any> {
		this.resetWidget();
		return this.widgetsService.getPlatformMetadata()
			.then( ( platformMetadata:PlatformMetadata ) => {
				this.platformMetadata = platformMetadata;
				this.setValues( platformMetadata.instance.version, platformMetadata.instance.buildDate )
			} ).catch( ( error:any ) => {
				this.hasError = true;
				this.onErrorOccurs.emit( ErrorMessageGenerator.getErrorMessage( error ) );
			} );
	}
}