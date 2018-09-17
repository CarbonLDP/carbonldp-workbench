import { Component, HostBinding } from "@angular/core";
import { CodeMirrorErrorAreaService } from "./code-mirror-error-area.service";

@Component( {
	selector: "cw-code-mirror-error-area",
	template: "<div class='cw-code-mirror__error-area'>{{errorMessage}}</div>",
	styleUrls: [ "./code-mirror-error-area.component.scss" ],
} )
export class CodeMirrorErrorAreaComponent {

	message:string = "";
	@HostBinding( "class.hidden" ) hasError:boolean = true;

	set errorMessage( value:string ) {
		this.message = value;
		this.hasError = value.trim().length < 1;
	}

	get errorMessage() {
		return this.message;
	}

	codeMirrorErrorAreaService:CodeMirrorErrorAreaService;

	constructor( codeMirrorErrorAreaService:CodeMirrorErrorAreaService ) {
		this.codeMirrorErrorAreaService = codeMirrorErrorAreaService;
		this.codeMirrorErrorAreaService.dataSource$.subscribe( ( value:string ) => {
			this.errorMessage = value;
		} );
	}

	ngOnDestroy() {

	}


}



