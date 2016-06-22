"use strict";

const gulp = require( "gulp" );
const util = require( "gulp-util" );
const runSequence = require( "run-sequence" );
const del = require( "del" );
const rename = require( "gulp-rename" );
const chug = require( "gulp-chug" );
const watch = require( "gulp-watch" );

const Builder = require( "jspm" ).Builder;

const tslint = require( "gulp-tslint" );

const ejs = require( "gulp-ejs" );

const sass = require( "gulp-sass" );
const autoprefixer = require( "gulp-autoprefixer" );
const sourcemaps = require( "gulp-sourcemaps" );

const webserver = require( "gulp-webserver" );

const argv = require( "yargs" )
	.usage( "Usage: [-p profile]" )
	.describe( "p", "Active profile to load configuration from" )
	.alias( "p", "profile" )
	.default( "p", "local" )
	.argv;
const profile = argv.p;
const profileConfig = require( "./config/" + profile );

const config = {
	source: {
		typescript: "src/app/**/*.ts",
		semantic: "src/semantic/dist/**/*",
		sass: [
			"src/app/**/*.scss",
			"src/assets/**/*.scss"
		]
	},
	nodeDependencies: {
		files: [
			"node_modules/es6-shim/es6-shim.js",
			"node_modules/systemjs/dist/system-polyfills.src.js",
			"node_modules/systemjs/dist/system.src.js",
			"node_modules/rxjs/bundles/Rx.js"
		],
		packages: [
			"node_modules/jstree/**/*"
		]
	}
};

gulp.task( "ts-lint", () => {
	return gulp.src( config.source.typescript )
		.pipe( tslint() )
		.pipe( tslint.report( "prose" ) )
		;
} );

gulp.task( "compile-styles", () => {
	return gulp.src( config.source.sass, { base: "./" } )
		.pipe( ejs( profileConfig ) )
		.pipe( sourcemaps.init() )
		.pipe( sass().on( "error", sass.logError ) )
		.pipe( autoprefixer( {
			browsers: [ "last 2 versions" ]
		} ) )
		.pipe( sourcemaps.write( "." ) )
		.pipe( gulp.dest( "." ) )
		;
} );

gulp.task( "compile-boot", () => {
	return gulp.src( "src/app/boot.ejs.ts" )
		.pipe( ejs( profileConfig ) )
		.pipe( rename( "boot.ts" ) )
		.pipe( gulp.dest( "src/app/" ) )
} );

gulp.task( "compile-index", () => {
	return gulp.src( "dist/index.ejs.html" )
		.pipe( ejs( profileConfig ) )
		.pipe( rename( "index.html" ) )
		.pipe( gulp.dest( "dist/site/" ) );
} );

gulp.task( "bundle", () => {
	let builder = new Builder();
	return builder.buildStatic( "app/boot", "dist/site/main.sfx.js", {
		minify: false,
		mangle: false,
		sourceMaps: false
	} );
} );

gulp.task( "build-semantic", () => {
	return gulp.src( "src/semantic/gulpfile.js", { read: false } )
		.pipe( chug( {
			tasks: [ "build" ]
		} ) )
		;
} );

gulp.task( "copy-semantic", [ "build-semantic" ], () => {
	return gulp.src( "src/semantic/dist/**/*", {
		base: "src/semantic/dist"
	} ).pipe( gulp.dest( "dist/dist/assets/semantic" ) );
} );

// TODO: Minify files
gulp.task( "copy-assets", [ "copy-node-dependencies" ], () => {
	return gulp.src( "src/assets/**/*", {
		base: "src/assets"
	} ).pipe( gulp.dest( "dist/dist/assets" ) );
} );

gulp.task( "copy-node-dependencies", () => {
	gulp.start( 'copy-node-dependencies:files', 'copy-node-dependencies:packages' );
} );

gulp.task( "copy-node-dependencies:files", () => {
	return gulp.src( config.nodeDependencies.files ).pipe( gulp.dest( "src/assets/node_modules" ) );
} );

gulp.task( "copy-node-dependencies:packages", () => {
	return gulp.src( config.nodeDependencies.packages, { base: "node_modules" } ).pipe( gulp.dest( "src/assets/node_modules" ) );
} );

gulp.task( "serve", ( done ) => {
	runSequence(
		[ "build-semantic", "compile-styles", "compile-boot", "copy-node-dependencies" ],
		"serve:afterCompilation",
		done
	);
} );


gulp.task( "serve:afterCompilation", () => {
	gulp.src( "src/semantic/gulpfile.js", { read: false } )
		.pipe( chug( {
			tasks: [ "watch" ]
		} ) )
	;

	watch( config.source.sass, ( file ) => {
		util.log( "SCSS file changed: ", file.path );
		gulp.start( "compile-styles" );
	} ).on( "error", function( error ) {
		util.log( util.colors.red( "Error" ), error.message );
	} );

	return gulp.src( "../" )
		.pipe( webserver( {
			livereload: false,
			directoryListing: false,
			fallback: "/carbon-workbench/src/index.html",
			open: true,
		} ) );
} );

gulp.task( "clean:dist", () => {
	return del( [ "dist/site/**" ] );
} );

gulp.task( "build", [ "clean:dist" ], ( done ) => {
	runSequence(
		"clean:dist",
		[ "compile-styles", "compile-boot", "compile-index", "copy-semantic", "copy-assets" ],
		"bundle",
		done
	);
} );
