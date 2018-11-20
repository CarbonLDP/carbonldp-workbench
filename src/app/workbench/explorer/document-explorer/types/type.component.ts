import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RestrictedType } from "../property/property-type/property-type.component";

enum State {
	EDIT,
	READ,
	IDLE
}

@Component( {
	selector: "tr.app-type",
	templateUrl: "./type.component.html",
	styleUrls: [ "./type.component.scss" ],
} )


export class TypeComponent {


	type:string;

	@Input() set element( type:string ) {
		this.type = type;
		this.state = this.isRestrictedType( type )
			? State.IDLE
			//if some element is empty his state by default will be EDIT
			: this.type === ""
				? State.EDIT
				: State.READ;

		//back up the value.
		this.originalValue = type;
	}

	@Output() onTypeChange:EventEmitter<string> = new EventEmitter<string>();
	@Output() onTypeRemoved:EventEmitter<string> = new EventEmitter<string>();

	readonly State:typeof State = State;
	readonly RestrictedType:typeof RestrictedType = RestrictedType;

	private originalValue;

	state = State.READ;

	editType() {
		if( this.state === State.IDLE ) return;
		this.state = State.EDIT;
	}

	removeType() {
		this.onTypeRemoved.emit( this.type );
	}

	cancelEditType() {
		if( this.state !== State.EDIT ) return;
		this.state = State.READ;

		//back off the changes.
		this.type = this.originalValue;
	}

	applyTypeEdition() {
		if( this.state !== State.EDIT ) return;
		this.state = State.READ;

		this.isRestrictedType( this.type )
			? this.type = this.originalValue
			: this.onTypeChange.emit( this.type );
	}

	private isRestrictedType( type ) {
		//check if the current string is not a restricted Type
		switch( type ) {
			case RestrictedType.RequiredSystemDocument:
			case RestrictedType.LDPDocument:
				return true;
			default:
				return false;
		}
	}


}
