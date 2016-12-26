#!/bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required, $# provided. Please provide only the version you want to install"

jspm install npm:@angular/core@$1 npm:@angular/common@$1 npm:@angular/compiler@$1 npm:@angular/forms@$1 npm:@angular/http@$1 npm:@angular/platform-browser@$1 npm:@angular/platform-browser-dynamic@$1