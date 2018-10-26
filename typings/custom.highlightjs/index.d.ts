interface HighlightConfiguration {
	tabReplace?:string;
	useBR?:boolean;
	classPrefix?:string;
	languages?:string[];
}

declare module "highlight.js" {
	export default class {
		static configure( configuration:HighlightConfiguration ):void;
		static highlightBlock( block:HTMLElement ):void;
	}
}
