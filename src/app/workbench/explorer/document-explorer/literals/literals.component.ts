import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { Modes } from "../property/property.component";
import { Literal, LiteralStatus, LiteralToken } from "./literal.component";


/*
*  Contains all the literals of a property.
* */
@Component( {
	selector: "cw-literals",
	templateUrl: "./literals.component.html",
	styleUrls: [ "./literals.component.scss" ],
} )

export class LiteralsComponent implements OnInit {

	modes:Modes = Modes;
	tempLiterals:Literal[] = [];
	isLanguagePresent:boolean = false;
	isEditingLiteral:boolean = false;
	canDisplayLiterals:boolean = false;

	get canDisplayLanguage():boolean {
		return this.isLanguagePresent || this.isEditingLiteral;
	};


	@Input() canEdit:boolean = true;
	@Input() literals:LiteralStatus[] = [];
	@Input() onAddNewLiteral:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onLiteralsChanges:EventEmitter<LiteralStatus[]> = new EventEmitter<LiteralStatus[]>();

	constructor() {}

	ngOnInit():void {
		this.isLanguagePresent = this.existsToken( LiteralToken.LANGUAGE );
		this.onAddNewLiteral.subscribe( () => {
			this.addNewLiteral();
		} );
		this.updateCanDisplayLiterals();
	}

	existsToken( token:string ):boolean {
		return ! ! this.literals.find( ( literal:LiteralStatus ) => {
			return (! ! literal.added && literal.added[ token ] !== void 0)
				|| (! ! literal.modified && literal.modified[ token ] !== void 0)
				|| (! ! literal.copy && literal.copy[ token ] !== void 0)
		} );
	}

	editModeChanged( value:boolean ):void {
		setTimeout( () => {
			this.isEditingLiteral = value;
		}, 1 );
	}

	saveLiteral() {
		this.isLanguagePresent = this.existsToken( LiteralToken.LANGUAGE );
		this.onLiteralsChanges.emit( this.literals );
		this.updateCanDisplayLiterals();
	}

	addNewLiteral():void {
		let newLiteralStatus:LiteralStatus = <LiteralStatus>{ added: {} };
		this.literals.splice( 0, 0, newLiteralStatus );
		this.updateCanDisplayLiterals();
	}

	deleteLiteral( deletingLiteral:LiteralStatus, index:number ):void {
		if( typeof deletingLiteral.added !== "undefined" ) this.literals.splice( index, 1 );
		this.onLiteralsChanges.emit( this.literals );
		this.updateCanDisplayLiterals();
	}

	updateCanDisplayLiterals():void {
		this.canDisplayLiterals = this.getUntouchedLiterals().length > 0 || this.getAddedLiterals().length > 0 || this.getModifiedLiterals().length > 0;
	}

	getAddedLiterals():LiteralStatus[] {
		return this.literals.filter( ( literal:LiteralStatus ) => typeof literal.added !== "undefined" );
	}

	getModifiedLiterals():LiteralStatus[] {
		return this.literals.filter( ( literal:LiteralStatus ) => typeof literal.modified !== "undefined" && typeof literal.deleted === "undefined" );
	}

	getDeletedLiterals():LiteralStatus[] {
		return this.literals.filter( ( literal:LiteralStatus ) => typeof literal.deleted !== "undefined" );
	}

	getUntouchedLiterals():LiteralStatus[] {
		return this.literals.filter( ( literal:LiteralStatus ) => typeof literal.modified === "undefined" && typeof literal.deleted === "undefined" );
	}
}
