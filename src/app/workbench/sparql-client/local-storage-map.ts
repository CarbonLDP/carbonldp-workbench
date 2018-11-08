/**
 * Map backed up by LocalStorage. It delays persistence to the local storage to avoid unnecessary processing on repeated calls.
 * If needed, `backup()` can be called to force the storage of the current state of the map into local storage.
 */
export class LocalStorageMap<KEY, VALUE> implements Map<KEY, VALUE> {
	private inMemoryMap:Map<KEY, VALUE>;
	private backupTimeoutID;

	/**
	 * @param id - ID to store the map with in the LocalStorage
	 */
	constructor( private id:string ) {
		if( ! ("localStorage" in window) ) throw new Error( "The environment doesn't support LocalStorage" );

		this.restore();

		// Bind the function so it can be called in callbacks
		this.backup = this.backup.bind( this );
	}

	readonly [ Symbol.toStringTag ]:"Map";

	[ Symbol.iterator ]():IterableIterator<[ KEY, VALUE ]> {
		return this.inMemoryMap[ Symbol.iterator ]();
	}

	entries():IterableIterator<[ KEY, VALUE ]> {
		return this.inMemoryMap.entries();
	}

	keys():IterableIterator<KEY> {
		return this.inMemoryMap.keys()
	}

	values():IterableIterator<VALUE> {
		return this.inMemoryMap.values();
	}

	get size():number {
		return this.inMemoryMap.size;
	}

	has( key:KEY ):boolean {
		return this.inMemoryMap.has( key );
	}

	get( key:KEY ):VALUE | undefined {
		return this.inMemoryMap.get( key );
	}

	set( key:KEY, value:VALUE ):this {
		if( value === null ) return this;

		this.inMemoryMap.set( key, value );
		this.queueBackup();

		return this;
	}

	clear() {
		this.inMemoryMap = new Map();
		window.localStorage.removeItem( this.id );
	}

	delete( key:KEY ):boolean {
		if( ! this.has( key ) ) return false;

		this.inMemoryMap.delete( key );
		this.queueBackup();

		return true;
	}

	forEach( callbackFn:( value:VALUE, key:KEY, map:Map<KEY, VALUE> ) => void, thisArg?:any ):void {
		this.inMemoryMap.forEach( callbackFn, thisArg );
	}

	backup():void {
		// Erase timer so new backups can be scheduled
		this.backupTimeoutID = null;

		const serialization:string = JSON.stringify( Array.from( this.inMemoryMap.entries() ) );
		window.localStorage.setItem( this.id, serialization );
	}

	private queueBackup():void {
		// Is a backup already scheduled?
		if( this.backupTimeoutID ) return;

		this.backupTimeoutID = setTimeout( this.backup, 0 );
	}

	private restore():void {
		const savedSerialization:string | null = window.localStorage.getItem( this.id );
		this.inMemoryMap = savedSerialization !== null
			? new Map( JSON.parse( savedSerialization ) )
			: new Map();
	}
}
