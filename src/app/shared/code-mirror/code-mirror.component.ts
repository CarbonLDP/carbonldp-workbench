import { Component, ElementRef, Input, Output, SimpleChange, EventEmitter, AfterContentInit, OnChanges, OnDestroy, HostListener, Renderer2 } from "@angular/core";

import * as CodeMirror from "codemirror";
import * as SPARQL from "sparqljs";

import "codemirror/mode/css/css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/sparql/sparql";
import "codemirror/mode/xml/xml";
import "codemirror/mode/turtle/turtle";

import "!style-loader!css-loader!codemirror/lib/codemirror.css";
import "!style-loader!css-loader!codemirror/theme/mbo.css";

@Component( {
	selector: "cw-code-mirror",
	template: "<ng-content></ng-content>",
	styleUrls: [ "./code-mirror.component.scss" ],
} )
export class Class implements AfterContentInit, OnChanges, OnDestroy {
	element:ElementRef;

	@Input() mode:string = Mode.JAVASCRIPT;
	@Input() readOnly:boolean = false;
	@Input() noCursor:boolean = false;
	@Input() showLineNumbers:boolean = true;
	@Input() scroll:boolean = true;

	@Input() value:string = "";
	@Output() valueChange:EventEmitter<string> = new EventEmitter<string>();

	@Input() codeMirror:CodeMirror.Editor;
	@Output() codeMirrorChange:EventEmitter<CodeMirror.Editor> = new EventEmitter<CodeMirror.Editor>();

	@HostListener( 'keydown', [ '$event' ] ) onKeyDown( e ) {
		if( e.shiftKey && e.ctrlKey && e.keyCode == 80 ) {
			try {
				let parsedQuery = this.parser.parse( this.value );
				this.codeMirror.setValue( this.generator.stringify( parsedQuery ) );
			} catch( e ) {

			}

		}
	}

	private internallyChanged:boolean = false;
	private lastUpdates:string[] = [];
	private parser;
	private generator;
	private textMarkers = [];
	private renderer:Renderer2;
	private eventListener;

	constructor( element:ElementRef, renderer:Renderer2 ) {
		this.element = element;
		this.parser = new SPARQL.Parser();
		this.generator = new SPARQL.Generator();
		this.renderer = renderer;

	}

	ngOnDestroy() {
		this.element.nativeElement.innerHTML = this.codeMirror.getValue();
	}

	ngAfterContentInit():void {
		if( ! this.value ) this.value = this.element.nativeElement.innerHTML;
		if( ! ! this.value ) this.value = this.normalizeTabs( this.value );
		else this.value = "";

		this.element.nativeElement.innerHTML = "";
		this.codeMirror = CodeMirror( this.element.nativeElement, {
			lineNumbers: this.showLineNumbers,
			indentWithTabs: true,
			smartIndent: false,
			electricChars: false,
			mode: this.mode,
			theme: "mbo",
			value: this.value,
			readOnly: this.readOnly
		} );
		this.codeMirrorChange.emit( this.codeMirror );

		if( ! this.scroll ) {
			this.element.nativeElement.children[ 0 ].style.height = "auto";
		}

		this.codeMirror.on( "change", ( changeObject ) => {
			if( this.internallyChanged ) {
				this.internallyChanged = false;
				return;
			}

			let lastUpdate:string = this.codeMirror.getValue();
			if( lastUpdate === this.value ) return;

			this.value = lastUpdate;
			this.lastUpdates.push( lastUpdate );
			this.valueChange.emit( lastUpdate );
		} );
	}

	ngOnChanges( changeRecord:any ):void {
		if( ! this.codeMirror ) return;

		if( "readOnly" in changeRecord ) {
			let change:SimpleChange = changeRecord.readOnly;
			this.setReadOnly( change.currentValue );
		}

		if( "noCursor" in changeRecord ) {
			let change:SimpleChange = changeRecord.noCursor;
			this.setNoCursor( change.currentValue );
		}

		if( "value" in changeRecord ) {
			if( this.mode === Mode.SPARQL ) this.validateQuery( changeRecord.value.currentValue );

			if( this.lastUpdates.length > 0 && this.lastUpdates[ 0 ] === changeRecord.value.currentValue ) {
				this.lastUpdates.shift();
			} else {
				this.internallyChanged = true;
				this.lastUpdates = [];
				this.codeMirror.setValue( changeRecord.value.currentValue );
			}
		}

	}

	private normalizeTabs( value:string ):string {
		let lines:string[] = value.split( /\n/gm );

		if( ! lines[ 0 ].trim() ) lines.shift();
		if( ! lines[ lines.length - 1 ].trim() ) lines.pop();

		let containsSomething:boolean = lines.reduce( ( previous, line ) => previous || ! ! line.trim(), false );
		if( ! containsSomething ) return "";

		let tabs:boolean = null;
		let extraIndentation:number = null;
		for( let line of lines ) {
			if( ! line.trim() ) continue;
			if( tabs === null ) tabs = line.startsWith( "\t" );
			let indentation:number = this.getIndentation( line, tabs );
			if( extraIndentation === null || extraIndentation > indentation ) extraIndentation = indentation;
		}

		this.removeIndentation( lines, extraIndentation, tabs );

		return lines.length ? lines.join( "\n" ) : "";
	}

	private getIndentation( line:string, tabs:boolean = true ):number {
		let indentationChar:string = tabs ? "\t" : " ";
		for( var i:number = 0, length = line.length; i < length; i ++ ) {
			if( line.charAt( i ) !== indentationChar ) break;
		}
		return i;
	}

	private removeIndentation( lines:string[], indentation:number, tabs:boolean = true ):string[] {
		for( let i:number = 0, length = lines.length; i < length; i ++ ) {
			let line:string = lines[ i ];
			if( ! line.trim() ) continue;
			lines[ i ] = line.substring( indentation );
		}
		return lines;
	}

	private setReadOnly( readOnly:boolean ):void {
		this.codeMirror.setOption( "readOnly", readOnly );
	}

	private setNoCursor( noCursor:boolean ):void {
		if( noCursor ) this.codeMirror.setOption( "readOnly", "nocursor" );
		else this.setReadOnly( this.readOnly );
	}

	private validateQuery( currentString:string ) {
		this.clearTextMarker();
		try {
			this.parser.parse( currentString );
		} catch( error ) {
			if( "message" in error && error.message.startsWith( "Parse error" ) ) {
				this.displayParseError( error );
			} else {
				console.error( "Unexpected error while parsing the query", error );
			}
		}
	}

	private displayParseError( error ) {
		let start = {
			line: error.hash.loc.first_line - 1,
			ch: error.hash.loc.first_column - 1
		};
		let end = {
			line: error.hash.loc.last_line - 1,
			ch: error.hash.loc.last_column + 1
		};
		// @ts-ignore
		this.textMarkers.push( this.codeMirror.markText( start, end, { className: "cw-code-mirror--syntaxError" } ) );
	}

	private clearTextMarker():void {
		if( typeof this.eventListener === "function" ) this.eventListener();
		this.textMarkers.forEach( ( marker ) => {
			return marker.clear();
		} );
		this.textMarkers = [];
	}
}


export class Mode {
	static get CSS():string { return "text/css"; };

	static get JAVASCRIPT():string { return "text/javascript"; }

	static get JSONLD():string { return "application/ld+json"; }

	static get JSONDRDF():string { return "application/json"; }

	static get N3():string { return "text/turtle"; }

	static get RDFXML():string { return "application/xml"; }

	static get CSV():string { return "text/plain"; }

	static get TSV():string { return "text/plain"; }

	static get SPARQL():string { return "application/sparql-query"; }

	static get XML():string { return "application/xml"; }

	static get TURTLE():string { return "text/turtle"; }
}
