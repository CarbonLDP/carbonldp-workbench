import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, Output, QueryList } from "@angular/core";

/**
 * A column in a {@link HorizontalResizableGrid}
 *
 * <strong>CSS vars:</strong>
 * <ul>
 *     <li><code>--width</code>: Starting width of the column</li>
 * </ul>
 */
@Component( {
	selector: "app-grid-column",
	templateUrl: "./grid-column.component.html",
	styleUrls: [ "./grid-column.component.scss" ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class GridColumnComponent {
	constructor(
		public element:ElementRef<HTMLElement>,
	) {}
}

/**
 * Vertical divider in a {@link HorizontalResizableGrid}
 */
@Component( {
	selector: "app-vertical-grid-divider",
	templateUrl: "./vertical-grid-divider.component.html",
	styleUrls: [ "./vertical-grid-divider.component.scss" ],
	host: {
		"(mousedown)": "onMouseDown.emit( $event )",
		"(dragstart)": "onDragStart( $event )",
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class VerticalGridDividerComponent {
	@Output() onMouseDown:EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

	constructor(
		public element:ElementRef<HTMLElement>,
	) {}

	onDragStart( $event ) {
		// Since we are managing the dragging with mouse events we need to prevent the default browser behaviour
		$event.preventDefault();
	}
}

/**
 * 2D position object with x and y coordinates
 */
interface Position {
	x:number;
	y:number;
}

/**
 * Horizontal grid with two {@link GridColumnComponent}s that can have any kind of content. And a {@link VerticalGridDividerComponent}
 * which allows users to resize the columns by dragging it.
 *
 * Example:
 * <pre><code>
 *      <app-vertical-resizable-grid>
 *          <app-grid-column>
 *              Content of first column
 *          </app-grid-column>
 *          <app-vertical-grid-divider></app-vertical-grid-divider>
 *          <app-grid-column>
 *              Content of second column
 *          </app-grid-column>
 *      </app-vertical-resizable-grid>
 * </pre></code>
 */
@Component( {
	selector: "app-horizontal-resizable-grid",
	templateUrl: "./horizontal-resizable-grid.component.html",
	styleUrls: [ "./horizontal-resizable-grid.component.scss" ],
	host: {
		"(mousemove)": "onMouseMove( $event )",
		"(mouseup)": "onMouseUp( $event )",
		"(mouseleave)": "onMouseLeave( $event )",
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class HorizontalResizableGrid implements AfterContentInit {
	@ContentChild( VerticalGridDividerComponent ) divider:VerticalGridDividerComponent;
	@ContentChildren( GridColumnComponent ) columns:QueryList<GridColumnComponent>;

	constructor(
		private element:ElementRef<HTMLElement>,
	) {}

	/**
	 * Boolean that indicates if the user is currently dragging the divider
	 */
	private dragging:boolean = false;

	private containerWidth:number;
	private dividerWidth:number;

	/**
	 * Offset position of the container with relation to the page's absolute coordinates
	 */
	private offset:Position;

	ngAfterContentInit() {
		if( ! this.divider ) throw new Error( "<app-horizontal-resizable-grid> needs to have an <app-vertical-grid-divider>" );
		if( this.columns.length !== 2 ) throw new Error( "<app-horizontal-resizable-grid> can only have two columns in its content" );

		this.divider.onMouseDown.subscribe( this.on_divider_mouseDown.bind( this ) );
	}

	on_divider_mouseDown( event:MouseEvent ) {
		this.dragging = true;

		this.containerWidth = this.element.nativeElement.offsetWidth;
		this.dividerWidth = this.divider.element.nativeElement.offsetWidth;

		const clientRectangle = this.element.nativeElement.getBoundingClientRect();
		this.offset = {
			x: clientRectangle.left + document.body.scrollLeft,
			y: clientRectangle.top + document.body.scrollTop,
		};
	}

	onMouseMove( event:MouseEvent ) {
		if( ! this.dragging ) return;

		// Make the event's coordinates relative by taking into account the container's offset
		const position = {
			x: event.pageX - this.offset.x,
			y: event.pageY - this.offset.y,
		};

		// Is the position at the start of the container?
		const x = position.x <= this.dividerWidth / 2
			? 0
			// Is the position at the end of the container?
			: position.x >= this.containerWidth - this.dividerWidth
				? this.containerWidth - this.dividerWidth
				: position.x - this.dividerWidth / 2;

		// Modify both flex-basis and width so that the width is correctly computed by any CSS property
		this.columns.first.element.nativeElement.style[ "flex-basis" ] = `${x}px`;
		this.columns.first.element.nativeElement.style[ "width" ] = `${x}px`;

		event.preventDefault();
	}

	onMouseUp( event:MouseEvent ) {
		// The user stopped dragging
		this.dragging = false;

		if( ! this.dragging ) return;
	}

	onMouseLeave( event:MouseEvent ) {
		// The user left the container so the dragging action will stop
		this.dragging = false;
	}
}
