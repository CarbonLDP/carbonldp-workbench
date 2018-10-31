import "hammerjs";
import { enableProdMode, NgModuleRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { bootstrapWithHMR } from "./hmr";

import { CarbonLDP } from "carbonldp";
import { initializeCarbonLDPFactory } from "app/providers";

import { CARBONLDP_HOST, CARBONLDP_PROTOCOL, ENV } from "./config";
import { AppModule } from "app/app.module";
import { environment } from "./environments/environment";

(async () => {
	async function start() {
		initializeCarbonLDP();

		if( isProdEnvironmentActive() ) enableProdMode();

		await bootstrapApp();
	}

	function initializeCarbonLDP() {
		const carbonldp:CarbonLDP = new CarbonLDP( `${CARBONLDP_PROTOCOL}://${CARBONLDP_HOST}` );
		initializeCarbonLDPFactory( carbonldp );

		// Allows to access the carbonldp object in the console while debugging
		if( ! isProdEnvironmentActive() && typeof window !== "undefined" ) window[ "carbonldp" ] = carbonldp;
	}

	function isProdEnvironmentActive():boolean {
		return ENV === "production";
	}

	async function bootstrapApp() {
		const bootstrapFn:() => Promise<NgModuleRef<AppModule>> = () => platformBrowserDynamic().bootstrapModule( AppModule );

		const bootstrapPromise:Promise<AppModule> = isHMREnabled()
			? bootstrapWithHMR( module, bootstrapFn )
			: bootstrapFn();

		await bootstrapPromise;
	}

	function isHMREnabled():boolean {
		return environment.hmr && module[ "hot" ];
	}

	await start();
})().catch( console.error );
