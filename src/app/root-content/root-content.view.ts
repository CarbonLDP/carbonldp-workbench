import { Component } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import { Class as InstanceMetadata } from "carbonldp/System/InstanceMetadata";

@Component( {
	selector: "cw-root-content",
	templateUrl: "./root-content.view.html",
	styleUrls: [ "./root-content.view.scss" ],
} )
export class RootContentView {

	public carbon:Carbon;

	public instance:InstanceMetadata;


	constructor( carbon:Carbon ) {
		this.carbon = carbon;
	}

	ngOnInit() {
		// TODO: Uncomment this when Instance is available
		// this.getInstanceMetadata();
	}

	private getInstanceMetadata():Promise<InstanceMetadata | void> {
		return this.carbon.getInstanceMetadata().then( ( instance:InstanceMetadata ) => {
			this.instance = instance;
			return instance;
		} ).catch( ( error ) => {
			console.error( error );
		} );
	}
}

