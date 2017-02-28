/// <reference path="./custom/codemirror/index.d.ts" />
/// <reference path="./custom/highlightjs/index.d.ts" />
/// <reference path="./custom/jstree/index.d.ts" />
/// <reference path="./custom/semantic-ui/index.d.ts" />

declare module "*.html!" {
	let value:string;
	export default value;
}

declare module "*!text" {
	let value:string;
	export default value;
}
