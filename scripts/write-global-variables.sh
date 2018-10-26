#!/bin/sh

: ${1:?"Please specify a file to process"}

ENV=${ENV="production"}
BASE_URL=${BASE_URL="/"}

CARBONLDP_PROTOCOL=${CARBONLDP_PROTOCOL="http"}
CARBONLDP_HOST=${CARBONLDP_HOST="localhost:8000"}

sed -i 's|--ENV--|'"$ENV"'|g' $1

sed -i 's|--BASE_URL--|'"${BASE_URL}"'|g' $1
sed -i 's|<base href="/">|<base href="'"${BASE_URL}"'">|g' $1

sed -i 's|--CARBONLDP_PROTOCOL--|'"$CARBONLDP_PROTOCOL"'|g' $1
sed -i 's|--CARBONLDP_HOST--|'"$CARBONLDP_HOST"'|g' $1
