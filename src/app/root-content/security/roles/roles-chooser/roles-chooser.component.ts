import { ElementRef, Component, Input, Output, AfterViewInit, EventEmitter } from "@angular/core";

import * as PersistedRole from "carbonldp/Auth/PersistedRole";

import { RolesService } from "../roles.service";

@Component( {
	selector: "cw-roles-chooser",
	templateUrl: "./roles-chooser.component.html",
	styleUrls: [ "./roles-chooser.component.scss" ],
} )

export class RolesChooserComponent implements AfterViewInit {

	private element:ElementRef;
	private $element:JQuery;
	private rolesService:RolesService;

	public availableRoles:PersistedRole.Class[] = [];

	private _selectedRoles:PersistedRole.Class[] = [];
	@Input() set selectedRoles( value:PersistedRole.Class[] ) {
		let selectedRoles:PersistedRole.Class[] = [];
		value.forEach( ( selectedRole:PersistedRole.Class ) => {
			selectedRoles.push( selectedRole );
		} );
		this._selectedRoles = selectedRoles;
	}

	get selectedRoles():PersistedRole.Class[] {
		return this._selectedRoles;
	}

	@Input() bordered:boolean = true;
	@Input() single:boolean = false;
	@Input() excluded:string[] = [];

	@Output() onChangeSelection:EventEmitter<PersistedRole.Class[]> = new EventEmitter<PersistedRole.Class[]>();

	constructor( element:ElementRef, rolesService:RolesService ) {
		this.element = element;
		this.$element = $( element.nativeElement );
		this.rolesService = rolesService;
	}

	ngAfterViewInit():void {
		this.rolesService.getAll().then( ( roles:PersistedRole.Class[] ) => {
			roles = roles.filter( ( role:PersistedRole.Class ) => {
				return ! this.excluded.some( ( excludedID:string ) => role.id === excludedID );
			} );
			this.availableRoles = roles;
		} ).then( () => {
			setTimeout( () => { this.$element.find( ".ui.checkbox" ).checkbox(); } );
		} );
	}

	private hasRole( role:string, list:PersistedRole.Class[] ):boolean {
		return list.findIndex( ( persistedRole:PersistedRole.Class ) => { return role === persistedRole.id } ) !== - 1;
	}

	private onClickRole( role:PersistedRole.Class, evt:Event ):void {
		evt.stopPropagation();
		this.selectRole( role );
	}

	private selectRole( role:PersistedRole.Class ):void {
		if( this.single ) this.addRoleAsSingle( role );
		else this.addRoleAsMulti( role );
		this.onChangeSelection.emit( this.selectedRoles );
	}

	private addRoleAsMulti( role:PersistedRole.Class ):void {
		let idx:number = this.selectedRoles.findIndex( ( persistedRole:PersistedRole.Class ) => { return role.id === persistedRole.id } );
		if( idx === - 1 )
			this.selectedRoles.push( role );
		else
			this.selectedRoles.splice( idx, 1 );
	}

	private addRoleAsSingle( role:PersistedRole.Class ):void {
		this.selectedRoles = [];
		this.selectedRoles.push( role );
	}
}
