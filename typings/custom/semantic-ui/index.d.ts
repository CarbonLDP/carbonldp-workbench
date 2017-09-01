interface SemanticDebugSettings {
	name?:string;
	debug?:boolean;
	performance?:boolean;
	verbose?:boolean;
	errors?:{ [ original:string ]:string };
}

interface SemanticVisibilityCalculations {

}

interface SemanticVisibilityArguments extends SemanticDebugSettings {
	once?:boolean;
	continuous?:boolean;
	type?:boolean | "image" | "fixed";
	initialCheck?:boolean;
	context?:Element;
	refreshOnLoad?:boolean;
	refreshOnResize?:boolean;
	checkOnRefresh?:boolean;
	offset?:number;
	includeMargin?:boolean;
	throttle?:boolean | number;
	observeChanges?:boolean;
	transition?:boolean;
	duration?:number;

	onTopVisible?:( calculations:SemanticVisibilityCalculations ) => void;
	onTopPassed?:( calculations:SemanticVisibilityCalculations ) => void;
	onBottomVisible?:( calculations:SemanticVisibilityCalculations ) => void;
	onPassing?:( calculations:SemanticVisibilityCalculations ) => void;
	onBottomPassed?:( calculations:SemanticVisibilityCalculations ) => void;
	onTopVisibleReverse?:( calculations:SemanticVisibilityCalculations ) => void;
	onTopPassedReverse?:( calculations:SemanticVisibilityCalculations ) => void;
	onBottomVisibleReverse?:( calculations:SemanticVisibilityCalculations ) => void;
	onPassingReverse?:( calculations:SemanticVisibilityCalculations ) => void;
	onBottomPassedReverse?:( calculations:SemanticVisibilityCalculations ) => void;

	onUpdate?:( calculations:SemanticVisibilityCalculations ) => void;
	onRefresh?:( calculations:SemanticVisibilityCalculations ) => void;

	// TODO: Define type
	namespace?:any;
	className?:{ [ original:string ]:string };
}

interface SemanticAPIArguments {

}

interface SemanticTabArguments extends SemanticDebugSettings {
	auto?:boolean;
	history?:boolean;
	ignoreFirstLoad?:boolean;
	evaluateScripts?:boolean | "once";
	alwaysRefresh?:boolean;
	cache?:boolean;

	apiSettings?:boolean | SemanticAPIArguments;
	historyType?:"hash" | "state";
	path?:boolean;
	context?:boolean | JQuery;
	childrenOnly?:boolean;
	maxDepth?:number;

	// TODO: Add tabPath and parameterArray types
	onFirstLoad?:( tabPath:any, parameterArray:any[], historyEvent:Event ) => void;
	onLoad?:( tabPath:any, parameterArray:any[], historyEvent:Event ) => void;
	onRequest?:( tabPath:any ) => void;
	onVisible?:( tabPath:any ) => void;

	// TODO: Define type
	namespace?:any;
	templates?:{
		determineTitle?:( tabArray:any[] ) => string
	};
	selector?:{
		tabs?:string;
		parent?:string;
	};
	metadata?:{
		tab?:string;
		loaded?:string;
		promise?:string
	};
	className?:{
		loading?:string;
		active?:string;
	};
}

interface SemanticDropdownArguments {
	// TODO
}

interface SemanticRatingArguments extends SemanticDebugSettings {
	initialRating?:number;
	clearable?:"auto" | boolean;
	interactive?:boolean;

	onRate?:( value:number ) => void;

	// TODO: Define type
	namespace?:any;
	selector?:{
		icon?:string;
	};
	className?:{
		active?:string;
		hover?:string;
		loading?:string;
	};
}

interface SemanticDimmerArguments extends SemanticDebugSettings {
	opacity?:"auto" | number;
	variation?:boolean | string;
	dimmerName?:string;
	closable?:"auto" | boolean;
	on?:boolean | "hover" | "click";
	useCSS?:boolean;
	duration?:{
		show?:number;
		hide?:number;
	};
	transition?:string;

	onShow?:() => void;
	onHide?:() => void;
	onChange?:() => void;

	// TODO: Define type
	namespace?:any;
	selector?:{
		dimmable?:string;
		dimmer?:string;
		content?:string;
	};
	template?:{
		dimmer?:() => JQuery;
	};
	className?:{
		active?:string;
		dimmable?:string;
		dimmed?:string;
		disabled?:string;
		pageDimmer?:string;
		hide?:string;
		show?:string;
		transition?:string;
	};
}

interface SemanticModalArguments extends SemanticDebugSettings {
	closable?:boolean;
	blurring?:boolean;
	// TODO: Check onApprove real signature
	onApprove?:() => any;
}

interface SemanticProgressArguments extends SemanticDebugSettings {
	autoSuccess?:boolean;
	showActivity?:boolean;
	limitValues?:boolean;
	label?:boolean | "percent" | "ration";
	random?:any;
	precision?:number;
	total?:boolean | number;
	value?:boolean | number;

	onChange?:( percent:number, value:number, total:number ) => void;
	onSuccess?:( total:number ) => void;
	onActive?:( value:number, total:number ) => void;
	onError?:( value:number, total:number ) => void;
	onWarning?:( value:number, total:number ) => void;

	// TODO: Define type
	namespace?:any;
	text?:{
		active?:boolean | string;
		error?:boolean | string;
		success?:boolean | string;
		warning?:boolean | string;
		percent?:string;
		ration?:string;
	};
	regExp?:{
		variable?:RegExp;
	};
	selector?:{
		bar?:string;
		label?:string;
		progress?:string;
	};
	metadata?:{
		percent?:string;
		total?:string;
		value?:string;
	};
	className?:{
		active?:string;
		error?:string;
		success?:string;
		warning?:string;
	};
}

interface SemanticSearchArguments extends SemanticDebugSettings {
	apiSettings?:SemanticAPIArguments;
	minCharacters?:number;
	transition?:string;
	duration?:number;
	maxResults?:number;
	cache?:boolean;
	source?:boolean | Object;
	searchFullText?:boolean;
	fields?:{
		categories?:string;
		categoryName?:string;
		categoryResults?:string;
		description?:string;
		image?:string;
		price?:string;
		results?:string;
		title?:string;
		action?:string;
		actionText?:string;
		actionURL?:string;
	};
	searchFields?:string[];
	hideDelay?:number;
	searchDelay?:number;
	easing?:string;
	type?:string;

	onSelect?:( result:any, response:any ) => void | boolean;
	onResultsAdd?:( html:string ) => void | boolean;
	onSearchQuery?:( query:string ) => void;
	onResults?:( response:any ) => void;
	onResultsOpen?:() => void;
	onResultsClose?:() => void;

	// TODO
	templates?:any;

	name?:string;
	// TODO: Define type
	namespace?:any;
	regExp?:{
		escape?:RegExp;
	};
	selector?:{
		prompt?:string;
		searchButton?:string;
		results?:string;
		category?:string;
		result?:string;
	};
	metadata?:{
		cache?:string;
		results?:string;
	};
	className?:{
		active?:string;
		empty?:string;
		focus?:string;
		loading?:string;
		pressed?:string;
	};
}

interface SemanticShapeArguments extends SemanticDebugSettings {
	duration?:number;

	beforeChange?:() => void;
	onChange?:() => void;

	// TODO: Define type
	namespace?:any;
	selector?:{
		sides?:string;
		side?:string;
	};
	className?:{
		animating?:string;
		hidden?:string;
		loading?:string;
		active?:string;
	};
}

interface JQuery {
	accordion( arguments?:any ):JQuery;
	checkbox( arguments?:any ):JQuery;
	dimmer( arguments?:SemanticDimmerArguments ):JQuery;

	dropdown( action:"set selected", selector:string );
	dropdown( action:"set text", selector:string );
	dropdown( arguments?:SemanticDropdownArguments ):JQuery;

	form( arguments:any ):JQuery;

	modal( action:"attach events" | "", selector:string ):JQuery;
	modal( action:"show" | "hide" | "toggle" | "refresh" | "show dimmer" | "hide dimmer" | "hide others" | "hide all" | "cache sizes" | "can fit" | "is active" | "set active" ):JQuery;
	modal( arguments:SemanticModalArguments ):JQuery;
	modal():JQuery;

	popup( arguments?:any ):JQuery;

	progress( arguments?:SemanticProgressArguments ):JQuery;

	rating( arguments?:SemanticRatingArguments ):JQuery;

	// This signature conflicts with JSTree's
	// search( arguments?:SemanticSearchArguments ):JQuery;

	shape( arguments?:SemanticShapeArguments ):JQuery;

	sidebar( arguments?:any ):JQuery;
	tab( arguments?:SemanticTabArguments ):JQuery;
	// TODO
	tab( action:string, arguments?:any );
	transition( arguments:any ):JQuery;
	visibility( arguments:SemanticVisibilityArguments ):JQuery;
}
