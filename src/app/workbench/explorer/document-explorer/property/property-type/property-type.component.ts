import { Component, Input } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";
import { LDP } from "carbonldp/Vocabularies/LDP";

import { PropertyStatus } from "../property.component";

@Component( {
	selector: "app-property-type",
	templateUrl: "./property-type.component.html",
	styleUrls: [ "./property-type.component.scss" ],
} )

export class PropertyTypeComponent {

	types:string[] = [];


	private _property:PropertyStatus;
	@Input()
	set property( prop:PropertyStatus ) {
		this.types = prop.copy.value;
	}

	get property():PropertyStatus { return this._property; }


	getDisplayName( uri:string ):string {
		return this.unescape( this.getFragment( uri ) );
	}

	getFragment( uri:string ):string {
		return URI.getFragment( uri );
	}

	getTypeIcon( type:string ):string {
		switch( type ) {
			case LDP.RDFSource:
				return "file outline";
			case LDP.Container:
				return "cubes";
			case LDP.BasicContainer:
				return "cube";
			default:
				return "file excel outline";
		}
	}

	private unescape( uri:string ):string {
		return decodeURI( uri );
	}
}

