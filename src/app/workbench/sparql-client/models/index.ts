export * from "./sparql-query.model";


export enum SPARQLType {
	QUERY = "QUERY",
	UPDATE = "UPDATE",
}

export enum QueryType {
	SELECT = "SELECT",
	DESCRIBE = "DESCRIBE",
	CONSTRUCT = "CONSTRUCT",
	ASK = "ASK",
}

export enum SPARQLFormats {
	table = "table",
	xml = "application/xml",
	csv = "text/csv",
	tsv = "text/tsv",
	jsonLD = "application/ld+json",
	turtle = "text/turtle",
	jsonRDF = "application/rdf+json",
	rdfXML = "application/rdf+xml",
	n3 = "text/n3",
	ntriples = "text/plain",
	trix = "application/trix",
	trig = "application/x-trig",
	binary = "application/x-binary-rdf.",
	nquads = "text/x-nquads",
	rdfa = "application/xhtml+xml",
	boolean = "boolean",
	text = "text/plain",
}
