import { Component, HostListener, Renderer2 } from "@angular/core";
import { ResizeBarService } from "./resize-bar.service";


@Component( {
	selector: "cw-resize-bar",
	templateUrl: "./resize-bar.component.html",
	styleUrls: [ "./resize-bar.component.scss" ],
} )
export class ResizeBarComponent {
	renderer: Renderer2;
	resizeBarService: ResizeBarService;
	MIN_HEIGHT = 300;
	start_x;
	start_y;
	start_h;
	listener = null;

	constructor( renderer: Renderer2 , resizeBarService: ResizeBarService) {
		this.renderer = renderer;
		this.resizeBarService = resizeBarService;
	}


	height_of($el) {
		return parseInt(window.getComputedStyle($el).height.replace(/px$/, ""));
	}


	attatchDocumentEventsListener(): void{
		this.listener = this.renderer.listen('document', 'mousemove', (event) => {
			this.resizeBarService.position =  Math.max(this.MIN_HEIGHT, (this.start_h + event.y - this.start_y));
		});

		let listener2 = this.renderer.listen('document', 'mouseup', (event) => {
			this.listener();
			listener2();
		});

	}

	@HostListener('mousedown', ['$event']) onMouseDown(e) {
		this.start_x = e.x;
		this.start_y = e.y;
		this. start_h = this.height_of(document.querySelector(".CodeMirror"));
		this.attatchDocumentEventsListener();
	}
}

