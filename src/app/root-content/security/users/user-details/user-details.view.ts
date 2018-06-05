import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { User } from "carbonldp/Auth";

import { Modes } from "./user-details.component";

@Component( {
	selector: "cw-user-details-view",
	templateUrl: "./user-details.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class UserDetailsView {

	private router:Router;
	private activatedRoute:ActivatedRoute;

	private user:User;
	private mode:string = Modes.READ;

	public canDisplay:boolean = true;

	constructor( router:Router, route:ActivatedRoute ) {
		this.router = router;
		this.activatedRoute = route;
	}

	ngOnInit() {
		this.activatedRoute.data.forEach( ( data:{ user:User } ) => {
			this.user = data.user;
		} );
		this.activatedRoute.queryParams.subscribe( ( params ) => {
			this.mode = params[ "mode" ] ? params[ "mode" ] : Modes.EDIT;
		} );
	}

	private goToUser():void {
		this.router.navigate( [ "../" ] )
	}

}

