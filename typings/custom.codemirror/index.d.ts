import * as CodeMirror from "codemirror";
declare module "codemirror" {
	interface Editor {
		markText( start:CodeMirror.Position, end:CodeMirror.Position, options:CodeMirror.TextMarkerOptions ):CodeMirror.TextMarker;
	}
}
