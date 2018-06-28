import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { PersistedUser } from "carbonldp/Auth";

import { Modes } from "./user-details.component";

@Component( {
	selector: "cw-user-details-view",
	templateUrl: "./user-details.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class UserDetailsView {

	private router:Router;
	private activatedRoute:ActivatedRoute;

	private user:PersistedUser.Class;
	private mode:string = Modes.READ;

	public canDisplay:boolean = true;

	constructor( router:Router, route:ActivatedRoute ) {
		this.router = router;
		this.activatedRoute = route;
	}

	ngOnInit() {
		this.activatedRoute.data.forEach( ( data:{ user:PersistedUser.Class } ) => {
			this.user = data.user;
		} );
		this.activatedRoute.queryParams.subscribe( ( params ) => {
			this.mode = params[ "mode" ] ? params[ "mode" ] : Modes.READ;
		} );
	}

	private goToUser():void {
		this.router.navigate( [ "../" ] )
	}

}

