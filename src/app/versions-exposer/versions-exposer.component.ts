import { Component, ElementRef } from "@angular/core";
import { Carbon } from "carbonldp/Carbon";
import * as APIDescription from "carbonldp/APIDescription";
import * as $ from "jquery";

@Component( {
	selector: "versions-exposer",
	templateUrl: "./versions-exposer.component.html",
	styleUrls: [ "./versions-exposer.component.scss" ],
} )
export class VersionsExposerComponent {
	private element:ElementRef;
	private $element:JQuery;
	private carbon:Carbon;

	carbonldpSDK:string = "???";
	carbonldpPanel:string = "???";
	carbonldpWorkbench:string = "???";
	carbonldpPlatform:string = "???";
	carbonldpURL:string = "";

	constructor( element:ElementRef, carbon:Carbon ) {
		this.element = element;
		this.carbon = carbon;
	}

	ngOnInit():void {
		this.$element = $( this.element.nativeElement );
		this.carbonldpSDK = process.env.PACKAGES[ "carbonldp" ];
		this.carbonldpPanel = process.env.PACKAGES[ "carbonldp-panel" ];
		this.carbonldpWorkbench = process.env.PACKAGES[ "carbonldp-workbench" ];
		this.carbonldpURL = this.carbon.getSetting( "http.ssl" ) ? "https" : "http" + "://" + this.carbon.getSetting( "domain" );
		this.getApiVersion();
	}

	getApiVersion():void {
		this.carbon.getAPIDescription().then( ( apiDescription:APIDescription.Class ) => {
			this.carbonldpPlatform = apiDescription.version;
		} ).catch( ( error ) => {
			this.$element.find( "span.platform" ).popup( { hideOnScroll: false } ).popup( "show" );
		} );
	}
}