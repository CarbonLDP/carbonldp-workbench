"use strict";

const fs = require( "mz/fs" );
const gulp = require( "gulp" );
const del = require( "del" );

gulp.task( "clean:dist", () => {
	return del( [ "dist/**" ] );
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