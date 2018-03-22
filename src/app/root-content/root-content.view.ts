import { Component } from "@angular/core";

import { CarbonLDP } from "carbonldp";

@Component( {
	selector: "cw-root-content",
	templateUrl: "./root-content.view.html",
	styleUrls: [ "./root-content.view.scss" ],
} )
export class RootContentView {

	public carbonldp:CarbonLDP;

	public instance:any;


	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}

}

