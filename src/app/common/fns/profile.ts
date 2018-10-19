export interface Profile<RESULT> {
	/**
	 * Time that the operation took to complete (in ms)
	 */
	duration:number;
	/**
	 * Promise that holds the result of the operation (already resolved/rejected)
	 */
	result:Promise<RESULT>;
}

/**
 * Execute an action (sync or async) and profile its execution time. This function returns a promise that will ALWAYS be resolved (even if the callback fails)
 * with the profiling information and the result (or error) of the callback.
 * @param callback
 * @param progressCallback
 * @param interval
 */
export async function profile<RESULT>( callback:() => RESULT, progressCallback:( duration:number ) => void, interval:number );
export async function profile<RESULT>( callback:() => RESULT );
export async function profile<RESULT>( callback:() => RESULT, progressCallback?:( duration:number ) => void, interval?:number ):Promise<Profile<RESULT>> {
	const startTimestamp = performance.now();

	// If a progress callback was passed, set the interval to call it depending on the interval argument
	let progressIntervalID;

	// Function to reject the cancellation promise
	let rejectCancellationPromise:( error:any ) => void;
	// Promise to signal cancellation. The promise will only resolve if the progressCallback triggers a cancellation event (throws an error)
	let cancellationPromise = new Promise<any>( (( resolve, reject ) => { rejectCancellationPromise = reject; }) );

	if( progressCallback ) {
		progressIntervalID = setInterval( async () => {
			try {
				await progressCallback( performance.now() - startTimestamp );
			} catch( error ) {
				rejectCancellationPromise( error );
			}
		}, interval );
	}

	// Execute the callback and store the result as a resolved/rejected Promise
	let result:Promise<RESULT>;
	try {
		result = Promise.resolve( await Promise.race( [ callback(), cancellationPromise ] ) );
	} catch( error ) {
		result = Promise.reject( error );
	}

	// Calculate the callback's duration
	const duration = performance.now() - startTimestamp;

	// Clear progress callback interval if needed
	if( progressIntervalID ) clearInterval( progressIntervalID );

	return {
		duration,
		result,
	};
}