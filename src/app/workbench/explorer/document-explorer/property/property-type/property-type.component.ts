import { Component, EventEmitter, Input, Output } from "@angular/core";

import { PropertyStatus } from "../property.component";

@Component( {
	selector: "app-property-type",
	templateUrl: "./property-type.component.html",
	styleUrls: [ "./property-type.component.scss" ],
} )

export class PropertyTypeComponent {

	types:Set<string>;
	originalTypes:Set<string>;

	private _property:PropertyStatus;
	@Input()
	set property( prop:PropertyStatus ) {
		this._property = prop;
		this.types = new Set( prop.copy.value );
		this.originalTypes = new Set( prop.copy.value );
	}

	get property():PropertyStatus {
		return this._property;
	}

	@Output() onChangeTypes:EventEmitter<PropertyStatus> = new EventEmitter<PropertyStatus>();


	on_types_change( types ) {
		this.types = types;
		if( this.hasChanges() ) {
			this.updateProperty();
		} else {
			this.removeModifiedProperty();
		}
	}

	addType() {
		this.types.add( "" );
	}

	private hasChanges() {
		//compare the original set to the new set.
		if( this.types.size !== this.originalTypes.size ) return true;
		for( let a of Array.from( this.types ) ) if( ! this.originalTypes.has( a ) ) return true;
		return false;
	}

	private updateProperty() {
		this._property.modified = this._property.copy;
		this._property.modified.value = Array.from( this.types );
		this.onChangeTypes.emit( this.property );
	}

	private removeModifiedProperty() {
		if( this._property.modified ) {
			delete this._property.modified;
			this.onChangeTypes.emit( this.property );
		}
	}


}

//these are the types that should be edited, added, or deleted.
export enum RestrictedType {
	RequiredSystemDocument = "https://carbonldp.com/ns/v1/platform#RequiredSystemDocument",
	LDPDocument = "https://carbonldp.com/ns/v1/platform#Document"
}
