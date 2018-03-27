import { Component, ElementRef } from "@angular/core";
import { CarbonLDP } from "carbonldp";
import { PlatformMetadata } from "carbonldp/System/PlatformMetadata";
import { C } from "carbonldp/Vocabularies";
import * as $ from "jquery";

@Component( {
	selector: "cw-versions-presenter",
	templateUrl: "./versions-presenter.component.html",
	styleUrls: [ "./versions-presenter.component.scss" ],
} )
export class VersionsPresenterComponent {
	private element:ElementRef;
	private $element:JQuery;
	private carbonldp:CarbonLDP;

	carbonldpSDK:string;
	carbonldpWorkbench:string;
	carbonldpPlatform:string;
	carbonldpURL:string;

	constructor( element:ElementRef, carbonldp:CarbonLDP ) {
		this.element = element;
		this.carbonldp = carbonldp;
	}

	ngOnInit():void {
		this.$element = $( this.element.nativeElement );
		this.carbonldpSDK = this.carbonldp.version;
		this.carbonldpWorkbench = process.env.PACKAGES[ "carbonldp-workbench" ];
		this.carbonldpURL = this.carbonldp.baseURI;
		this.getPlatformVersion();
	}

	getPlatformVersion():Promise<PlatformMetadata> {

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
		return this.carbonldp.getPlatformMetadata().then( ( platformMetadata:any ) => {
			this.carbonldpPlatform = platformMetadata.instance.version;
			return platformMetadata;
		} ).catch( ( error ) => {
			this.$element.find( "span.platform" ).popup( { hideOnScroll: false } ).popup( "show" );
		} );
	}
}