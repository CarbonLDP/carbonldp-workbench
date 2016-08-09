"use strict";

const fs = require( "mz/fs" );

const spawn = require( "child_process" ).spawn;
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
	.usage( "Usage: $0 [-p profile] [--use-env]" )

	.describe( "p", "Active profile to load configuration from" )
	.alias( "p", "profile" )
	.default( "p", "local" )

	.describe( "use-env", "Use environment variables instead of using profile based configuration" )

	.describe( "image-name", "Docker image to build" )
	.default( "image-name", "carbon-workbench" )

	.describe( "image-version", "Docker image version" )
	.default( "image-version", "latest" )

	.argv;

let profileConfig;
if( argv[ "use-env" ] ) {
	validateEnv();
	profileConfig = {
		"angular": {
			"debug": "DEBUG" in process.env && process.env.DEBUG
		},
		"url": {
			"base": "WORKBENCH_BASE" in process.env ? process.env.WORKBENCH_BASE : "/"
		},
		"carbon": {
			"protocol": "CARBON_PROTOCOL" in process.env ? process.env.CARBON_PROTOCOL : "https",
			"domain": process.env.CARBON_HOST
		}
	};
} else {
	profileConfig = require( "./config/" + argv.p );
}

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
		packages: []
	}
};

gulp.task( "default", [ "build" ] );

gulp.task( "build", [ "clean:dist" ], ( done ) => {
	runSequence(
		"clean:dist",
		[ "compile:styles", "compile:boot", "compile:index", "copy:semantic", "copy:assets" ],
		"bundle",
		done
	);
} );

gulp.task( "build:docker-image", ( done ) => {
	runSequence(
		"build:docker-image|copy:dockerfile",
		"build:docker-image|build:image",
		"build:docker-image|clean:dockerfile",
		done
	);
} );

gulp.task( "build:docker-image|copy:dockerfile", () => {
	return gulp.src( "build/Dockerfile" )
		.pipe( gulp.dest( "../" ) );
} );

gulp.task( "build:docker-image|build:image", ( done ) => {
	let buildProcess = spawn( `docker`, [ `build`, `--tag`, `${argv[ "image-name" ]}:${argv[ "image-version" ]}`, `.` ], { cwd: getParentDirectory() } );

	buildProcess.stdout.setEncoding( "utf8" );
	buildProcess.stderr.setEncoding( "utf8" );

	buildProcess.stdout.on( "data", logStdout );
	buildProcess.stderr.on( "data", logStderr );

	buildProcess.on( "close", ( code ) => {
		if( code !== 0 ) done( "Docker build command failed" );
		else done();
	} );
} );

gulp.task( "build:docker-image|clean:dockerfile", () => {
	return del( "../Dockerfile", { force: true } );
} );

gulp.task( "build:semantic", () => {
	return gulp.src( "src/semantic/gulpfile.js", { read: false } )
		.pipe( chug( {
			tasks: [ "build" ]
		} ) )
		;
} );

gulp.task( "bundle", () => {
	let builder = new Builder();
	return builder.buildStatic( "app/boot", "dist/site/main.sfx.js", {
		minify: false,
		mangle: false,
		sourceMaps: false
	} );
} );

gulp.task( "clean:dist", () => {
	return del( [ "dist/site/**" ] );
} );

gulp.task( "clean:src", ( done ) => {
	processDirectory( "src/app" ).then( () => {
		done();
	} ).catch( ( error ) => {
		done( error );
	} );

	function cleanDirectory( directory ) {
		return fs.readdir( directory ).then( ( files ) => {
			return processDirectoryFiles( directory, files );
		} );
	}

	function processDirectoryFiles( directory, files ) {
		let promises = [];
		for( let file of files ) {
			let path = getPath( directory, file );
			promises.push( fs.lstat( path ).then( ( fileStats ) => {
				if( fileStats.isDirectory() ) return processDirectory( path );
				else if( fileStats.isFile() ) return processFile( path );
				else return Promise.resolve( false );
			} ) );
		}

		return Promise.all( promises ).then( ( erasedStatuses ) => {
			return erasedStatuses.reduce( ( previous, current ) => previous && current, true );
		} );
	}

	function processDirectory( directory ) {
		let allContentsWereErased;

		return cleanDirectory( directory ).then( ( _allContentsWereErased ) => {
			allContentsWereErased = _allContentsWereErased;
			if( allContentsWereErased ) {
				console.log( `All files of directory '${directory}' were removed. Deleting it...` );
				return fs.rmdir( directory );
			}
		} ).then( () => {
			return allContentsWereErased;
		} );
	}

	function processFile( file ) {
		let extension = getFileExtension( file );
		if( extension === null ) return Promise.resolve( false );

		let hasSrcFilePromise;
		let hasSrcFile;

		switch( extension ) {
			case "css":
				hasSrcFilePromise = cssHasSrc( file );
				break;
			case "js":
				hasSrcFilePromise = jsHasSrc( file );
				break;
			case "map":
				hasSrcFilePromise = mapHasSrc( file );
				break;
			default:
				return Promise.resolve( false );
		}

		return hasSrcFilePromise.then( ( _hasSrcFile ) => {
			hasSrcFile = _hasSrcFile;
			if( ! hasSrcFile ) {
				console.log( `File '${file}' doesn't have a src file. Deleting it...` );
				return fs.unlink( file );
			}
		} ).then( () => {
			return ! hasSrcFile;
		} );
	}

	function cssHasSrc( file ) {
		let directory = getDirectory( file );
		let fileName = getFileName( file );
		let sassFile = directory + "/" + fileName + ".sass";
		let scssFile = directory + "/" + fileName + ".scss";

		let promises = [];
		promises.push( fileExists( sassFile ) );
		promises.push( fileExists( scssFile ) );

		return Promise.all( promises ).then( ( filesExist ) => {
			return filesExist.reduce( ( previous, current ) => previous || current, false );
		} );
	}

	function jsHasSrc( file ) {
		let directory = getDirectory( file );
		let fileName = getFileName( file );
		let tsFile = directory + "/" + fileName + ".ts";

		return fileExists( tsFile );
	}

	function mapHasSrc( file ) {
		let directory = getDirectory( file );
		let srcFileName = getFileName( file );
		let srcFileExtension = getFileExtension( srcFileName );

		let srcFile = directory + "/" + srcFileName;

		switch( srcFileExtension ) {
			case "js":
				return jsHasSrc( srcFile );
			case "css":
				return cssHasSrc( srcFile );
			default:
				return Promise.resolve( true );
		}
	}

	function fileExists( file ) {
		return fs.lstat( file ).then( ( fileStat ) => {
			return true;
		} ).catch( ( error ) => {
			if( error.code == "ENOENT" ) return false;
			else return Promise.reject( error );
		} );
	}

	function getDirectory( file ) {
		let pathParts = file.split( "/" );

		pathParts.pop();

		if( pathParts.length === 0 ) return "/";

		return pathParts.join( "/" );
	}

	function getPath( directory, fileName ) {
		return directory + "/" + fileName;
	}

	function getFile( filePath ) {
		let pathParts = filePath.split( "/" );
		return pathParts[ pathParts.length - 1 ];
	}

	function getFileName( file ) {
		let fileName = getFile( file );
		let fileParts = fileName.split( "." );

		fileParts.pop();

		if( fileParts.length === 0 ) return file;

		return fileParts.join( "." );
	}

	function getFileExtension( file ) {
		let fileName = getFile( file );
		let fileParts = fileName.split( "." );

		if( fileParts.length === 1 ) return null;

		return fileParts[ fileParts.length - 1 ];
	}
} );

gulp.task( "compile:boot", () => {
	return gulp.src( "src/app/boot.ejs.ts" )
		.pipe( ejs( profileConfig ) )
		.pipe( rename( "boot.ts" ) )
		.pipe( gulp.dest( "src/app/" ) )
} );

gulp.task( "compile:index", () => {
	return gulp.src( "dist/index.ejs.html" )
		.pipe( ejs( profileConfig ) )
		.pipe( rename( "index.html" ) )
		.pipe( gulp.dest( "dist/site/" ) );
} );

gulp.task( "compile:styles", () => {
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

// TODO: Minify files
gulp.task( "copy:assets", [ "copy:node-dependencies" ], () => {
	return gulp.src( "src/assets/**/*", {
		base: "src/assets"
	} ).pipe( gulp.dest( "dist/site/assets" ) );
} );

gulp.task( "copy:node-dependencies", () => {
	gulp.start( 'copy:node-dependencies:files', 'copy:node-dependencies:packages' );
} );

gulp.task( "copy:node-dependencies:files", () => {
	return gulp.src( config.nodeDependencies.files ).pipe( gulp.dest( "src/assets/node_modules" ) );
} );

gulp.task( "copy:node-dependencies:packages", () => {
	return gulp.src( config.nodeDependencies.packages, { base: "node_modules" } ).pipe( gulp.dest( "src/assets/node_modules" ) );
} );

gulp.task( "copy:semantic", [ "build:semantic" ], () => {
	return gulp.src( "src/semantic/dist/**/*", {
		base: "src/semantic/dist"
	} ).pipe( gulp.dest( "dist/site/assets/semantic" ) );
} );

gulp.task( "lint:typescript", () => {
	return gulp.src( config.source.typescript )
		.pipe( tslint() )
		.pipe( tslint.report( "prose" ) )
		;
} );

gulp.task( "serve", ( done ) => {
	runSequence(
		[ "build:semantic", "compile:styles", "compile:boot", "copy:node-dependencies" ],
		"serve|after-compilation",
		done
	);
} );

// TODO: Divide this task into sub-tasks
gulp.task( "serve|after-compilation", () => {
	gulp.src( "src/semantic/gulpfile.js", { read: false } )
		.pipe( chug( {
			tasks: [ "watch" ]
		} ) )
	;

	watch( config.source.sass, ( file ) => {
		util.log( "SCSS file changed: ", file.path );
		gulp.start( "compile:styles" );
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

function validateEnv() {
	let valid = true;
	if( ! ( "WORKBENCH_BASE" in process.env ) ) {
		valid = false;
		console.error( `ERROR: ENV["WORKBENCH_BASE"] was not defined. Please define the URL base the workbench is going to have` );
	}
	if( ! ( "CARBON_HOST" in process.env ) ) {
		valid = false;
		console.error( `ERROR: ENV["CARBON_HOST"] was not defined. Please define the Carbon LDP host the workbench is going to work with` );
	}

	if( ! valid ) process.exit( 1 );
}

function getParentDirectory( levels ) {
	levels = levels ? levels : 1;

	let directories = __dirname.split( "/" );

	while( levels != 0 && directories.length > 1 ) {
		directories.splice( - 1, 1 );
		levels --;
	}

	if( directories.length == 1 ) return "/";
	else return directories.join( "/" );
}

function logStdout( buffer ) {
	console.log( buffer.toString() );
}

function logStderr( buffer ) {
	console.error( buffer.toString() );
}
