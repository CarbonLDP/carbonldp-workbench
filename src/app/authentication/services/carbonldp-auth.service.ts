import { Injectable, EventEmitter } from "@angular/core";

import * as Cookies from "js-cookie";

import { CarbonLDP } from "carbonldp";
import { User, TransientUser, TokenCredentials, UsernameAndPasswordCredentials } from "carbonldp/Auth";

import { AUTH_COOKIE } from "./../utils";
import * as AuthService from "./auth.service";

@Injectable()
export class CarbonLDPAuthService implements AuthService.Class {
	private _loggedInEmitter:EventEmitter<any>;
	private _loggedOutEmitter:EventEmitter<any>;
	private _authChangedEmitter:EventEmitter<any>;
	private carbonldp:CarbonLDP;

	get loggedInEmitter():EventEmitter<any> { return this._loggedInEmitter };

	get loggedOutEmitter():EventEmitter<any> { return this._loggedOutEmitter };

	get authChangedEmitter():EventEmitter<any> { return this._authChangedEmitter };

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
		this._loggedInEmitter = new EventEmitter<any>();
		this._loggedOutEmitter = new EventEmitter<any>();
		this._authChangedEmitter = new EventEmitter<any>();

		this.loggedInEmitter.subscribe( ( value:any ) => this.authChangedEmitter.emit( value ) );
		this.loggedOutEmitter.subscribe( ( value:any ) => this.authChangedEmitter.emit( value ) );
	}

	isAuthenticated():boolean {
		return this.carbonldp.auth.isAuthenticated();
	}

	getAuthenticatedUser():Promise<User> {
		return this.carbonldp.auth.authenticatedUser.resolve();
	}

	login( username:string, password:string, rememberMe:boolean ):Promise<any> {
		return this.carbonldp.auth.authenticate( username, password ).then( ( token:TokenCredentials ) => {
			if( rememberMe ) {
				Cookies.set( AUTH_COOKIE, JSON.stringify( token ) );
			}
			this.loggedInEmitter.emit( token );
			return token;
		} );
	}

	logout():void {
		Cookies.remove( AUTH_COOKIE );
		this.carbonldp.auth.clearAuthentication();
		this.loggedOutEmitter.emit( null );
	}

	register( name:string, username:string, password:string ):Promise<User>;
	register( name:string, username:string, password:string, enabled:boolean ):Promise<User>;
	register( name:string, username:string, password:string, enabled?:boolean ):Promise<User> {

		let newUser:TransientUser = User.create( {
			name: name,
			credentials: UsernameAndPasswordCredentials.create( {
				username: username,
				password: password
			} )
		} );

		return this.carbonldp.auth.users.createChild( newUser );
	}
}
