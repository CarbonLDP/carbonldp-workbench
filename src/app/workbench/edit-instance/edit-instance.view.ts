import { Component } from "@angular/core";

import { CarbonLDP } from "carbonldp";

@Component( {
	selector: "cw-edit-instance-view",
	templateUrl: "./edit-instance.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class EditInstanceView {

	carbonldp:CarbonLDP;
	instance:any;

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}

}

