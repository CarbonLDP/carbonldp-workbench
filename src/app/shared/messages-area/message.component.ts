import { Component, Input, Output, OnChanges, AfterViewInit, ViewChild, ElementRef, SimpleChange, EventEmitter } from "@angular/core";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-message",
	templateUrl: "./message.component.html",
	styleUrls: [ "./message.component.scss" ],
} )

export class MessageComponent implements OnChanges, AfterViewInit {

	private element:ElementRef;
	private $element:JQuery;

	@ViewChild( "messageElement" ) messageElement:ElementRef;
	@Input() type:string = Types.NORMAL;
	@Input() title:string;
	@Input() content:string;
	@Input() statusCode:string;
	@Input() statusMessage:string;
	@Input() endpoint:string;
	@Input() message:Message;
	@Input() errors:any[];
	@Input() closable:boolean = false;
	@Input() stack:string;
	@Input() showStack:boolean = false;
	@Output() onClose:EventEmitter<any> = new EventEmitter();

	constructor( element:ElementRef ) {
		this.element = element;
		this.$element = $( this.element.nativeElement );
	}

	ngOnChanges( changes:{ [propName:string]:SimpleChange } ):void {
		if( ! ! changes[ "message" ].currentValue && changes[ "message" ].currentValue !== changes[ "message" ].previousValue ) {
			this.decomposeMessage();
		}
	}

	ngAfterViewInit():void {
		this.$element.find( ".ui.stack.accordion" ).accordion();
	}

	private decomposeMessage():void {
		this.title = this.message.title;
		this.content = this.message.content;
		this.statusCode = this.message.statusCode;
		this.statusMessage = this.message.statusMessage;
		this.endpoint = this.message.endpoint;
		this.errors = this.message.errors;
		this.stack = this.message.stack;
		this.type = this.message.type;
		if( typeof this.message.duration !== "undefined" && typeof this.message.duration === "number" ) {
			setTimeout( () => this.close( null, this.messageElement.nativeElement ), this.message.duration );
		}
	}

	public close( event:Event, messageDiv:HTMLElement ):void {
		$( messageDiv ).transition( {
			animation: "fade",
			onComplete: () => {this.onClose.emit( true );}
		} );
	}
}

export interface Message {
	title?:string;
	content?:string;
	statusCode?:string;
	statusMessage?:string;
	endpoint?:string;
	errors?:any[];
	stack?:string;
	type?:string;
	duration?:number;
}

export class Types {
	public static NORMAL = "";
	public static INFO = "info";
	public static WARNING = "warning";
	public static POSITIVE = "positive";
	public static SUCCESS = "success";
	public static NEGATIVE = "negative";
	public static ERROR = "error";
}

export interface ValidationResult {
	resultMessage:string,
	resultSeverity:string,
}

export interface ValidationDetails {
	conforms:boolean,
	result:ValidationResult[]
}

export interface ValidationError {
	errorCode:string,
	errorMessage:string,
	errorDetails:ValidationDetails
}
