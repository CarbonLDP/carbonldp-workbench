import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { Modes } from "../property/property.component";
import { Literal, LiteralRow } from "./literal.component";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-literals",
	templateUrl: "./literals.component.html",
	styleUrls: [  "./literals.component.scss"  ],
} )

export class LiteralsComponent implements OnInit {

	modes:Modes = Modes;
	tokens:string[] = [ "@value", "@type", "@language" ];
	tempLiterals:Literal[] = [];
	isLanguagePresent:boolean = false;
	isEditingLiteral:boolean = false;
	canDisplayLiterals:boolean = false;

	get canDisplayLanguage():boolean {
		return this.isLanguagePresent || this.isEditingLiteral;
	};


	@Input() literals:LiteralRow[] = [];
	@Input() onAddNewLiteral:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Input() canEdit:boolean = true;
	@Output() onLiteralsChanges:EventEmitter<LiteralRow[]> = new EventEmitter<LiteralRow[]>();

	constructor() {}

	ngOnInit():void {
		this.isLanguagePresent = this.existsToken( "@language" );
		this.onAddNewLiteral.subscribe( () => {
			this.addNewLiteral();
		} );
		this.updateCanDisplayLiterals();
	}

	existsToken( token:string ):boolean {
		return ! ! this.literals.find( ( literal:any ) => {
			return (! ! literal.added && typeof literal.added[ token ] !== "undefined")
				|| (! ! literal.modified && typeof literal.modified[ token ] !== "undefined")
				|| (! ! literal.copy && typeof literal.copy[ token ] !== "undefined")
		} );
	}

	editModeChanged( value:boolean ):void {
		setTimeout( () => {
			this.isEditingLiteral = value;
		}, 1 );
	}

	saveLiteral( modifiedLiteral:Literal, originalLiteral:Literal, index:number ) {
		if( typeof this.literals[ index ].added !== "undefined" ) delete this.literals[ index ].isBeingCreated;
		this.isLanguagePresent = this.existsToken( "@language" );
		this.onLiteralsChanges.emit( this.literals );
		this.updateCanDisplayLiterals();
	}

	addNewLiteral():void {
		let newLiteralRow:LiteralRow = <LiteralRow>{};
		newLiteralRow.added = <Literal>{};
		newLiteralRow.isBeingCreated = true;
		this.literals.splice( 0, 0, newLiteralRow );
		this.updateCanDisplayLiterals();
	}

	deleteLiteral( deletingLiteral:LiteralRow, index:number ):void {
		if( typeof deletingLiteral.added !== "undefined" ) this.literals.splice( index, 1 );
		this.onLiteralsChanges.emit( this.literals );
		this.updateCanDisplayLiterals();
	}

	updateCanDisplayLiterals():void {
		this.canDisplayLiterals = this.getUntouchedLiterals().length > 0 || this.getAddedLiterals().length > 0 || this.getModifiedLiterals().length > 0;
	}

	getAddedLiterals():LiteralRow[] {
		return this.literals.filter( ( literal:LiteralRow ) => typeof literal.added !== "undefined" );
	}

	getModifiedLiterals():LiteralRow[] {
		return this.literals.filter( ( literal:LiteralRow ) => typeof literal.modified !== "undefined" && typeof literal.deleted === "undefined" );
	}

	getDeletedLiterals():LiteralRow[] {
		return this.literals.filter( ( literal:LiteralRow ) => typeof literal.deleted !== "undefined" );
	}

	getUntouchedLiterals():LiteralRow[] {
		return this.literals.filter( ( literal:LiteralRow ) => typeof literal.modified === "undefined" && typeof literal.deleted === "undefined" );
	}
}
