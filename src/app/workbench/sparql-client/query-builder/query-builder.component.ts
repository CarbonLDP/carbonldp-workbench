import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { isEqual } from "lodash";

import * as CodeMirrorComponent from "app/common/components/code-mirror/code-mirror.component";

import { QueryType, SPARQLFormats, SPARQLQuery, SPARQLType } from "app/workbench/sparql-client/models";

enum State {
	IDLE,
	LOADING,
	EDITING_NAME,
}

@Component( {
	selector: "app-query-builder",
	templateUrl: "./query-builder.component.html",
	styleUrls: [ "./query-builder.component.scss" ]
} )
export class QueryBuilderComponent implements OnInit, OnChanges {
	@Input() loading:boolean = false;
	@Input() query:SPARQLQuery;
	@Output() execute:EventEmitter<SPARQLQuery> = new EventEmitter<SPARQLQuery>();
	@Output() clean:EventEmitter<SPARQLQuery> = new EventEmitter<SPARQLQuery>();
	@Output() save:EventEmitter<SPARQLQuery> = new EventEmitter<SPARQLQuery>();
	@Output() clone:EventEmitter<SPARQLQuery> = new EventEmitter<SPARQLQuery>();

	@ViewChild( "nameInput" ) nameInput:ElementRef;

	// Get a reference to the CodeMirror instance that controls the query's content value
	@ViewChild( "contentInput" ) sparqlContentInput:CodeMirrorComponent.Class;

	// Make CodeMirror modes accessible to the template
	readonly codeMirrorMode:typeof CodeMirrorComponent.Mode = CodeMirrorComponent.Mode;

	// Expose SPARQLType to the template
	readonly SPARQLType:typeof SPARQLType = SPARQLType;

	readonly State:typeof State = State;

	state = State.IDLE;

	availableFormats:SPARQLFormats[];

	private queryTypeFormats:{ [TYPE in QueryType]:SPARQLFormats[] } = {
		[ QueryType.SELECT ]: [
			SPARQLFormats.table,
			SPARQLFormats.xml,
			SPARQLFormats.csv,
			SPARQLFormats.tsv
		],
		[ QueryType.DESCRIBE ]: [
			SPARQLFormats.jsonLD,
			SPARQLFormats.turtle,
			SPARQLFormats.jsonRDF,
			SPARQLFormats.rdfXML,
			SPARQLFormats.n3
		],
		[ QueryType.CONSTRUCT ]: [
			SPARQLFormats.jsonLD,
			SPARQLFormats.turtle,
			SPARQLFormats.jsonRDF,
			SPARQLFormats.rdfXML,
			SPARQLFormats.n3
		],
		[ QueryType.ASK ]: [
			SPARQLFormats.boolean
		]
	};

	// Variable to hold the original value of the name input in case the user decides to cancel the edition
	private originalName:string;

	// To know if the user made changes
	private originalQuerySnapshot:SPARQLQuery;

	constructor( private changeDetectorRef:ChangeDetectorRef ) {
	}

	ngOnInit() {
		this.sparqlContentInput.valueChange.subscribe( this.handleSPARQLContentChange.bind( this ) );
	}

	ngOnChanges( changes:SimpleChanges ) {
		if( "query" in changes ) {
			// The query was changed by the parent component
			this.onQueryChanged( changes.query.currentValue as SPARQLQuery );
		}
	}

	onQueryChanged( query:SPARQLQuery ) {
		this.updateSnapshot( query );

		// If the new sparql is a query, update the available formats
		if( "type" in query && query.type === SPARQLType.QUERY ) {
			this.availableFormats = this.queryTypeFormats[ query.operation ];
		}
	}

	updateSnapshot( query:SPARQLQuery ) {
		this.originalQuerySnapshot = { ...query };
	}

	isSavedQuery():boolean {
		return ! ! (
			this.query.id
		);
	}

	hasUnsavedChanges():boolean {
		if( ! this.query.id ) return ! this.isEmpty();

		return ! isEqual( this.query, this.originalQuerySnapshot );
	}

	isEmpty():boolean {
		return ! (
			this.query.endpoint.trim() || this.query.content.trim()
		);
	}

	isValid():boolean {
		return ! ! (
			this.query.content.trim() && this.query.type
		);
	}

	editName() {
		if( this.state !== State.IDLE ) return;

		this.state = State.EDITING_NAME;
		this.originalName = this.query.name;

		// Force a change detection so the input gets shown in the component
		this.changeDetectorRef.detectChanges();

		// Focus and select all text in the input
		this.nameInput.nativeElement.focus();
		// Unfortunately since the input has just been inserted into the DOM its contents haven't been initialized
		// The timeout forces the selection to be executed after Angular updates its contents
		// TODO: Find a more elegant way to force the input's value to be updated before selecting its contents
		setTimeout( () => {
			this.nameInput.nativeElement.select();
		}, 0 );
	}

	cancelNameEdition() {
		if( this.state !== State.EDITING_NAME ) return;

		this.query.name = this.originalName;
		this.state = State.IDLE;
	}

	applyNameEdition() {
		if( this.state !== State.EDITING_NAME ) return;

		// To avoid ending up with an empty name, if the name input is empty we'll interpret it as a cancellation
		if( ! this.query.name.trim() ) this.query.name = this.originalName;

		this.state = State.IDLE;
	}

	private handleSPARQLContentChange( sparqlContent:string ) {
		const operation:SPARQLType.UPDATE | QueryType | null = this.getOperationType( sparqlContent );
		if( operation === null ) {
			this.query.type = null;
			this.query.operation = null;

			this.query.format = null;
		} else if( operation === SPARQLType.UPDATE ) {
			this.query.type = SPARQLType.UPDATE;
			this.query.operation = null;

			this.query.format = null;
		} else {
			this.query.type = SPARQLType.QUERY;
			this.query.operation = operation;

			this.availableFormats = this.queryTypeFormats[ operation ];

			this.query.format = this.query.format !== null
				? this.availableFormats.includes( this.query.format )
					? this.query.format
					: this.availableFormats[ 0 ]
				: this.availableFormats[ 0 ];
		}
	}

	private getOperationType( query:string ):SPARQLType.UPDATE | QueryType | null {
		const result:string[] = query.match( /\b(?:CONSTRUCT|ASK|SELECT|DESCRIBE|INSERT|DELETE|CLEAR|CREATE|DROP|LOAD)\b/gi );

		if( ! result ) return null;

		const operation = result[ 0 ].toUpperCase();

		switch( operation ) {
			case QueryType.CONSTRUCT:
			case QueryType.ASK:
			case QueryType.SELECT:
			case QueryType.DESCRIBE:
				return QueryType[ operation ];
			default:
				return SPARQLType.UPDATE;
		}
	}
}
