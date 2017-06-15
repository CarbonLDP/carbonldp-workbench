import { Component, Input, Output, EventEmitter, NgZone } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import * as PersistedRole from "carbonldp/Auth/PersistedRole";

import { Modes } from "../role-details/role-details.component";
import { RolesService } from "../roles.service";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";


@Component( {
	selector: "cw-roles-browser",
	templateUrl: "./roles-browser.component.html",
	styleUrls: [ "./roles-browser.component.scss" ],
} )
export class RolesBrowserComponent {

	private rolesService:RolesService;
	private zone:NgZone;
	private router:Router;
	private activatedRoute:ActivatedRoute;
	private hasRoleOnRoute:boolean = false;

	public activeRole:PersistedRole.Class;
	public selectedRole:string;
	public loading:boolean = false;
	public messages:Message[] = [];
	public Modes:typeof Modes = Modes;
	public mode:string = Modes.READ;

	@Output() onRefresh:EventEmitter<string> = new EventEmitter();
	@Output() onDelete:EventEmitter<string> = new EventEmitter();

	constructor( router:Router, route:ActivatedRoute, rolesService:RolesService, zone:NgZone ) {
		this.rolesService = rolesService;
		this.zone = zone;
		this.router = router;
		this.activatedRoute = route;
	}

	ngOnInit() {
		this.activatedRoute.data.forEach( ( data:{ role:PersistedRole.Class } ) => {
			this.activeRole = data.role;
			if( ! ! data.role ) this.hasRoleOnRoute = true;
		} );
	}

	public resolveRole( roleID:string ):void {
		this.loading = true;
		new Promise( ( resolve, reject ) => {
			if( this.hasRoleOnRoute ) {
				this.hasRoleOnRoute = false;
				resolve( this.activeRole );
			}
			resolve( this.rolesService.get( roleID ) );
		} ).then( ( role:PersistedRole.Class ) => {
			this.zone.run( () => {
				this.activeRole = role;
				this.loading = false;
			} );
		} ).catch( ( error ) => {
			this.handleError( error );
		} ).then( () => {
			this.loading = false;
		} );
	}

	public onSuccessDelete( roleID:string ):void {
		this.onDelete.emit( roleID );
	}

	public onSuccessCreate( roleID:string ):void {
		this.onRefresh.emit( this.selectedRole );
	}

	public onSuccessEdit( roleID:string ):void {
		this.onRefresh.emit( roleID );
	}

	public handleError( error:any ):void {
		this.messages.push( ErrorMessageGenerator.getErrorMessage( error ) );
	}
}
