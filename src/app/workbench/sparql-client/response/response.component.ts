import { Component, Input, Output, ElementRef, EventEmitter, AfterViewInit, OnInit } from "@angular/core";

import * as CodeMirrorComponent from "app/common/components/code-mirror/code-mirror.component";

import { SPARQLFormats, SPARQLQuery, SPARQLType } from "../models";

import * as $ from "jquery";
import "semantic-ui/semantic";

export enum SPARQLResponseType {
	Success = "Success",
	Error = "Error",
}

export class SPARQLClientResponse {
	duration:number = null;
	resultSet:any = null;
	query:SPARQLQuery = null;
	result:SPARQLResponseType = null;
	isReExecuting:boolean = false;
	data:string = null;

	setData( data:any ):void {
		if( typeof data !== "string" ) {
			data = JSON.stringify( data, null, 2 );
		}
		this.data = data;
	}
}

/*
*   Contains and displays the response of a SPARQL query
* */
@Component( {
	selector: "cw-sparql-response",
	templateUrl: "./response.component.html",
	styleUrls: [  "./response.component.scss"  ],
} )
export class ResponseComponent implements AfterViewInit, OnInit {
	element:ElementRef;
	$element:JQuery;

	@Input() outputformat:string;
	@Input() response:SPARQLClientResponse;
	@Input() prefixes:{ [ prefix:string ]:string };

	@Output() onRemove:EventEmitter<SPARQLClientResponse> = new EventEmitter<SPARQLClientResponse>();
	@Output() onConfigure:EventEmitter<SPARQLClientResponse> = new EventEmitter<SPARQLClientResponse>();
	@Output() onReExecute:EventEmitter<SPARQLClientResponse> = new EventEmitter<SPARQLClientResponse>();

	sparqlFormats:typeof SPARQLFormats = SPARQLFormats;

	readonly codeMirrorMode:typeof CodeMirrorComponent.Mode = CodeMirrorComponent.Mode;

	readonly SPARQLType:typeof SPARQLType = SPARQLType;

	accordion:any;
	accordionOpen:boolean = true;
	menu:any;

	readonly SPARQLResponseType:typeof SPARQLResponseType = SPARQLResponseType;

	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngOnInit():void {
		this.outputformat = this.response.query.format;
		let format:string = this.getCodeMirrorMode( this.response.query.format );
		this.outputformat = ! ! format ? format : this.outputformat;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.accordion = this.$element.find( ".accordion" );
		this.accordion.accordion( {
			onOpen: this.onOpen.bind( this ),
			onClose: this.onClose.bind( this ),
		} );
		this.menu = this.$element.find( ".content .tabular.menu > .item" );
		this.menu.tab( {
			context: this.$element.find( ".tabs" ),
			childrenOnly: true,
			onLoad: this.onLoadTab.bind( this ),
		} );
		this.openAccordion();
	}

	toggleAccordion():void {
		this.accordion.accordion( "toggle" );
	}

	openAccordion():void {
		this.accordion.accordion( "open", 0 );
	}

	onRemoveResponse( event:any ):void {
		this.onRemove.emit( this.response );
		event.stopPropagation();
	}

	onOpen():void {
		this.accordionOpen = true;
		this.$element.find( ".CodeMirror" ).each( ( i:number, element:Element ):void => {
			element.CodeMirror.refresh();
		} );
	}

	onClose():void {
		this.accordionOpen = false;
	}

	onLoadTab():void {
		this.$element.find( ".CodeMirror" ).each( ( i:number, element:Element ):void => {
			element.CodeMirror.refresh();
		} );
	}

	onConfigureResponse( event:any ):void {
		this.onConfigure.emit( this.response );
		event.stopPropagation();
	}

	onReExecuteResponse( event:any ):void {
		this.onReExecute.emit( this.response );
		this.accordion.accordion( "open", 0 );
		event.stopPropagation();
	}

	getCodeMirrorMode( format:string ):string {
		switch( format ) {
			case SPARQLFormats.csv:
				return CodeMirrorComponent.Mode.CSV;
			case SPARQLFormats.xml:
				return CodeMirrorComponent.Mode.XML;
			case SPARQLFormats.jsonLD:
				return CodeMirrorComponent.Mode.JSONLD;
			case SPARQLFormats.jsonRDF:
				return CodeMirrorComponent.Mode.JSONDRDF;
			case SPARQLFormats.n3:
				return CodeMirrorComponent.Mode.N3;
			case SPARQLFormats.rdfXML:
				return CodeMirrorComponent.Mode.RDFXML;
			case SPARQLFormats.tsv:
				return CodeMirrorComponent.Mode.TSV;
			case SPARQLFormats.turtle:
				return CodeMirrorComponent.Mode.TURTLE;
			case SPARQLFormats.boolean:
				return CodeMirrorComponent.Mode.JAVASCRIPT;
			default:
				return null;
		}
	}
}
