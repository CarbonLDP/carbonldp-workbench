import { Component } from "@angular/core";
import { Carbon } from "carbonldp/Carbon";
import * as APIDescription from "carbonldp/APIDescription";

@Component( {
	selector: "versions-exposer",
	templateUrl: "./versions-exposer.component.html",
	styleUrls: [ "./versions-exposer.component.scss" ],
} )
export class VersionsExposerComponent {

	carbonldpSDK:string = "???";
	carbonldpPanel:string = "???";
	carbonldpWorkbench:string = "???";
	carbonldpPlatform:string = "???";

	constructor( private carbon:Carbon ) {
		this.carbonldpSDK = process.env.PACKAGES[ "carbonldp" ];
		this.carbonldpPanel = process.env.PACKAGES[ "carbonldp-panel" ];
		this.carbonldpWorkbench = process.env.PACKAGES[ "carbonldp-workbench" ];
		this.getApiVersion();
	}

	getApiVersion():void {
		this.carbon.getAPIDescription().then( ( apiDescription:APIDescription.Class ) => {
			this.carbonldpPlatform = apiDescription.version;
		} );
	}
}