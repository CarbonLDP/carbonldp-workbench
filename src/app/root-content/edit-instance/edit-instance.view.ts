import { Component } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import { Class as InstanceMetadata } from "carbonldp/System/InstanceMetadata";

@Component( {
	selector: "cw-edit-instance-view",
	templateUrl: "./edit-instance.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class EditInstanceView {

	carbon:Carbon;
	instance:InstanceMetadata;

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.carbon.getInstanceMetadata().then( ( instance:InstanceMetadata ) => {
			this.instance = instance;
		} );
	}

}

