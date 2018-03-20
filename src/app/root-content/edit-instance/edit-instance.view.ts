import { Component } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Class as InstanceMetadata } from "carbonldp/System/InstanceMetadata";

@Component( {
	selector: "cw-edit-instance-view",
	templateUrl: "./edit-instance.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class EditInstanceView {

	carbonldp:CarbonLDP;
	instance:InstanceMetadata;

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
		this.carbonldp.getInstanceMetadata().then( ( instance:InstanceMetadata ) => {
			this.instance = instance;
		} );
	}

}

