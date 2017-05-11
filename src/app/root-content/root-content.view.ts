import { Component } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import { Class as InstanceMetadata } from "app/migration-temp/System/InstanceMetadata";

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
		this.getInstanceMetadata();
	}

	private getInstanceMetadata():Promise<InstanceMetadata> {
		return this.carbon.getInstanceMetadata.then( ( instance:InstanceMetadata ) => {
			this.instance = instance;
		} );
	}
}

