interface Element {
	CodeMirror:CodeMirror.Editor;
}

interface Editor {
	markText( from:CodeMirror.Position, to:CodeMirror.Position, options?:CodeMirror.TextMarkerOptions ):any;
}
