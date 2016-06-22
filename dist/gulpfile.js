const gulp = require( "gulp" );
const ejs = require( "gulp-ejs" );
const rename = require( "gulp-rename" );

gulp.task( "default", () => {
	return gulp.src( "src/**/*.ejs.*" )
		.pipe( ejs( {
			url: {
				base: process.env.BASE
			}
		} ) )
		.pipe( removeEJSExtension() )
		.pipe( gulp.dest( "dist/" ) );
} );

function removeEJSExtension() {
	return rename( ( path ) => {
		path.basename = path.basename.replace( ".ejs", "" );
	} )
}