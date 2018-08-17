import { Directive, ElementRef, AfterViewInit, OnInit } from "@angular/core";

import * as hljs from "highlight.js";

import "!style-loader!css-loader!highlight.js/styles/darcula.css";

@Directive( {
	selector: "[cwHighlight]",
} )
export class HighlightDirective implements OnInit, AfterViewInit {
	constructor( private element:ElementRef ) {}

	ngAfterViewInit():void {
		let html:string = this.element.nativeElement.innerHTML ? this.element.nativeElement.innerHTML : "";
		this.element.nativeElement.innerHTML = this.normalizeTabs( html );
		// @ts-ignore
		hljs.configure( {
			tabReplace: "    ",
		} );
		// @ts-ignore
		hljs.highlightBlock( this.element.nativeElement );
	}

	private normalizeTabs( value:string ):string {
		let lines:string[] = value.split( /\n/gm );

		if( ! lines[ 0 ].trim() ) lines.shift();
		if( lines.length > 0 && ! lines[ lines.length - 1 ].trim() ) lines.pop();

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


	ngOnInit():void {
		let LITERALS = 'prefix PREFIX';

		let keyName = '[a-zA-Z_]*';
		let KEY = {
			className: 'attr',
			variants: [
				{ begin: keyName + ":" },
			]
		};

		let TEMPLATE_VARIABLES = {
			className: 'template-variable',
			variants: [
				{ begin: '\<', end: '\>' },
			]
		};
		let STRING = {
			className: 'string',
			relevance: 0,
			variants: [
				{ begin: /'/, end: /'/ },
				{ begin: /"/, end: /"/ },
				{ begin: /\S+/ }
			],
			contains: [
				// @ts-ignore
				hljs.BACKSLASH_ESCAPE,
				TEMPLATE_VARIABLES
			]
		};
		// @ts-ignore
		hljs.registerLanguage( 'sparql', function(hljs){
			return {
			case_insensitive: false,
			aliases: [ 'sparql' ],
			contains: [
				KEY,
				{ // multi line string
					className: 'string',
					begin: '[\\|>] *$',
					returnEnd: true,
					contains: STRING.contains,
					// very simple termination: next hash key
					end: KEY.variants[ 0 ].begin
				},
				{
					beginKeywords: LITERALS,
					keywords: { literal: LITERALS }
				},
				// @ts-ignore
				hljs.C_NUMBER_MODE,
				STRING
			]
		}} );
	}
}

