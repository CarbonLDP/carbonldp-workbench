import { CarbonLDP } from "carbonldp";

let _carbonldp:CarbonLDP;

export function initializeCarbonLDPFactory( carbonldp:CarbonLDP ) {
	_carbonldp = carbonldp;
}

export function carbonldpFactory() {
	return _carbonldp;
}
