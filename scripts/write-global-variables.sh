#!/bin/sh

: ${1:?"Please specify a file to process"}

ENV=${ENV="production"}
BASE_URL=${BASE_URL="/"}

# Add compatibility to previously used env variables CARBON_PROTOCOL and CARBON_HOST
if [ "x${CARBON_PROTOCOL}" != "x" ]; then
	CARBONLDP_PROTOCOL="${CARBON_PROTOCOL}"
fi
if [ "x${CARBON_HOST}" != "x" ]; then
	CARBONLDP_HOST="${CARBON_HOST}"
fi

CARBONLDP_PROTOCOL=${CARBONLDP_PROTOCOL="http"}
CARBONLDP_HOST=${CARBONLDP_HOST="localhost:8083"}

sed -i 's|--ENV--|'"${ENV}"'|g' $1

sed -i 's|--BASE_URL--|'"${BASE_URL}"'|g' $1
sed -i 's|<base href="/">|<base href="'"${BASE_URL}"'">|g' $1

sed -i 's|--CARBONLDP_PROTOCOL--|'"${CARBONLDP_PROTOCOL}"'|g' $1
sed -i 's|--CARBONLDP_HOST--|'"${CARBONLDP_HOST}"'|g' $1
