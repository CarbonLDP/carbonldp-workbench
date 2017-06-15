import { Component, ElementRef } from "@angular/core";
import { Class as Carbon } from "carbonldp/Carbon";
import { Class as PlatformMetadata } from "carbonldp/System/PlatformMetadata";
import * as $ from "jquery";

@Component( {
	selector: "cw-versions-presenter",
	templateUrl: "./versions-presenter.component.html",
	styleUrls: [ "./versions-presenter.component.scss" ],
} )
export class VersionsPresenterComponent {
	private element:ElementRef;
	private $element:JQuery;
	private carbon:Carbon;

	carbonldpSDK:string = "???";
	carbonldpWorkbench:string = "???";
	carbonldpPlatform:string = "???";
	carbonldpURL:string = "";

	constructor( element:ElementRef, carbon:Carbon ) {
		this.element = element;
		this.carbon = carbon;
	}

	ngOnInit():void {
		this.$element = $( this.element.nativeElement );
		this.carbonldpSDK = "v" + this.carbon.version;
		this.carbonldpWorkbench = "v" + process.env.PACKAGES[ "carbonldp-workbench" ];
		this.carbonldpURL = this.carbon.baseURI;
		this.getApiVersion();
	}

	getApiVersion():void {
		this.carbon.getPlatformMetadata().then( ( platformMetadata:PlatformMetadata ) => {
			this.carbonldpPlatform = "v" + platformMetadata.version;
		} ).catch( ( error ) => {
			this.$element.find( "span.platform" ).popup( { hideOnScroll: false } ).popup( "show" );
		} );
	}
}