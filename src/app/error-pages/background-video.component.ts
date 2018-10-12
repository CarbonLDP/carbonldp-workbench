import { AfterViewInit, Component, HostListener, Input } from "@angular/core";

interface YoutubePlayerOptions {
	videoId:string;
	events?:{
		onReady?:( event:any ) => void,
		onStateChange?:( event:any ) => void,
		onError?:( event:any ) => void,
	};
}

interface YoutubePlayer {
	new( tagID:string, options?:YoutubePlayerOptions ):YoutubePlayer;
}

interface Youtube {
	Player:YoutubePlayer;
}

interface window {
	YT:Youtube;
}

@Component( {
	selector: "background-video",
	templateUrl: "./background-video.component.html",
	styleUrls: [ "./background-video.component.scss" ],
} )
export class BackgroundVideoComponent implements AfterViewInit {
	@Input( "videoID" ) videoID:string;
	@Input( "startTime" ) startTime:number;
	@Input( "endTime" ) endTime:number;

	screenElement:HTMLElement;

	// TODO: Define youtube player settings
	player:any;
	id:string = "player-" + BackgroundVideoComponent.generateUUID();
	youtube:Youtube;

	constructor() {}

	ngAfterViewInit():void {
		if( ! this.videoID ) return;

		BackgroundVideoComponent.loadYoutubeScript().then( ( youtube:Youtube ) => {
			this.youtube = youtube;

			this.player = new youtube.Player( this.id, {
				videoId: this.videoID,
				events: {
					onReady: this.onVideoReady.bind( this ),
					onStateChange: this.onVideoStateChange.bind( this ),
					onError: this.onVideoError.bind( this ),
				},
			} );
		} ).catch( ( error ) => {
			// TODO: Handle error
			console.error( error );
		} );
	}

	onVideoReady():void {
		this.screenElement = <any>document.querySelector( "#" + this.id );

		this.resizeVideo();

		this.player.setOption( "autohide", 1 );
		this.player.setOption( "modestbranding", 0 );
		this.player.setOption( "rel", 0 );
		this.player.setOption( "showinfo", 0 );
		this.player.setOption( "controls", 0 );
		this.player.setOption( "disablekb", 1 );
		this.player.setOption( "enablejsapi", 0 );
		this.player.setOption( "iv_load_policy", 3 );

		this.player.hideVideoInfo();

		this.player.mute();
		this.player.playVideo();
	}

	onVideoStateChange( event:any ):void {
		if( event.data === 1 ) {
			if( this.screenElement.classList ) this.screenElement.classList.add( "active" );
			else this.screenElement.className += ' ' + "active";
		} else if( event.data === 0 ) {
			this.player.seekTo( this.startTime ? this.startTime : 0 )
		}
	}

	onVideoError( event:any ):void {
		// TODO: Handle error
		console.error( "There was a problem loading the video" );
	}

	resizeVideo():void {
		let width = document.documentElement.clientWidth + 200;
		let height = document.documentElement.clientHeight + 200;

		if( width / height > 16 / 9 ) {
			this.player.setSize( width, width / 16 * 9 );
			this.screenElement.style.left = "0";
		} else {
			this.player.setSize( height / 9 * 16, height ).then( () => {
				this.screenElement.style.left = (- (this.screenElement.offsetWidth - width) / 2) + "px";
			} );
		}
	}

	@HostListener( "window:resize", [ "$event" ] )
	onResize( event:any ):void {
		this.resizeVideo();
	}

	static generateUUID():string {
		function s4() {
			return Math.floor( (1 + Math.random()) * 0x10000 ).toString( 16 ).substring( 1 );
		}

		return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
	}

	static loadYoutubeScript():Promise<Youtube> {
		return new Promise<any>( ( resolve:( result:any ) => void, reject:( error?:any ) => void ) => {
			let documentScripts:Element = document.querySelector( "script[src='https://www.youtube.com/iframe_api']" );

			if( documentScripts !== null ) {
				// The script was already loaded into the DOM
				if( "YT" in window ) {
					resolve( window[ "YT" ] );
				} else {
					// Youtube script hasn't finished loading
					if( "onYouTubeIframeAPIReady" in window && typeof window[ "onYouTubeIframeAPIReady" ] === "function" ) {
						// There's a function already waiting for youtube's script to load
						let originalEventHandler:() => any = window[ "onYouTubeIframeAPIReady" ];
						window[ "onYouTubeIframeAPIReady" ] = function() {
							originalEventHandler.apply( this, arguments );

							if( ! ("YT" in window) ) reject( new Error( "Youtube script was loaded, but the 'YT' object couldn't be found in the window object" ) );
							else resolve( window[ "YT" ] );
						}
					} else {
						window[ "onYouTubeIframeAPIReady" ] = function() {
							if( ! ("YT" in window) ) reject( new Error( "Youtube script was loaded, but the 'YT' object couldn't be found in the window object" ) );
							else resolve( window[ "YT" ] );
						}
					}
				}
				return;
			}

			let head:HTMLElement = document.head || document.getElementsByTagName( "head" )[ 0 ];
			let script:HTMLScriptElement = document.createElement( "script" );

			script.type = "text/javascript";
			script.charset = "utf8";
			script.async = true;
			script.src = "https://www.youtube.com/iframe_api";

			if( ! ("onload" in script) ) {
				// IE
				script[ "onreadystatechange" ] = function() {
					if( this.readyState != 'complete' && this.readyState != 'loaded' ) return;
					this[ "onreadystatechange" ] = null;
					resolve( script );
				}
			}

			script.onerror = function() {
				this.onload = null;
				this.onerror = null;
				reject( new Error( "Failed to load Youtube script" ) );
			};

			window[ "onYouTubeIframeAPIReady" ] = function() {
				if( ! ("YT" in window) ) reject( new Error( "Youtube script was loaded, but the 'YT' object couldn't be found in the window object" ) );
				else resolve( window[ "YT" ] );
			};

			head.appendChild( script );
		} );
	}
}
