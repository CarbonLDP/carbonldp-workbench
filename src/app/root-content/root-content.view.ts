import { Component } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Class as InstanceMetadata } from "carbonldp/System/InstanceMetadata";

@Component( {
	selector: "cw-root-content",
	templateUrl: "./root-content.view.html",
	styleUrls: [ "./root-content.view.scss" ],
} )
export class RootContentView {

	public carbonldp:CarbonLDP;

	public instance:InstanceMetadata;


	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}

	ngOnInit() {
		// TODO: Uncomment this when Instance is available
		// this.getInstanceMetadata();
	}

	private getInstanceMetadata():Promise<InstanceMetadata | void> {
		return this.carbonldp.getInstanceMetadata().then( ( instance:InstanceMetadata ) => {
			this.instance = instance;
			return instance;
		} ).catch( ( error ) => {
			console.error( error );
		} );
	}
}

