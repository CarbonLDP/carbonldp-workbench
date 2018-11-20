import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LDP } from "carbonldp/Vocabularies/LDP";

@Component( {
	selector: "app-types",
	templateUrl: "./types.component.html",
	styleUrls: [ "./types.component.scss" ],
} )

export class TypesComponent {

	@Input() types:Set<string>;

	@Output() onTypesChange:EventEmitter<Set<string>> = new EventEmitter<Set<string>>();

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

	on_type_change( type, i ) {
		let arrayTypes = Array.from( this.types );
		arrayTypes[ i ] = type;
		this.onTypesChange.emit( new Set( arrayTypes.filter( type => type !== "" ) ) );
	}

	on_type_removed(type){
		this.types.delete(type);
		this.onTypesChange.emit( this.types );
	}
}
