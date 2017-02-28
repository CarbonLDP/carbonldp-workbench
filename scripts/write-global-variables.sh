#!/bin/bash

: ${1:?"Please specify a file to process"}

CARBON_PROTOCOL=${CARBON_PROTOCOL="http"}
CARBON_HOST=${CARBON_HOST="localhost:8000"}
ENV=${ENV="production"}
BASE_URL=${URL_BASE="/"}

sed -i 's|--CARBON_PROTOCOL--|'"$CARBON_PROTOCOL"'|g' $1
sed -i 's|--CARBON_HOST--|'"$CARBON_HOST"'|g' $1
sed -i 's|--ENV--|'"ENV"'|g' $1
sed -i 's|--BASE_URL--|'"$BASE_URL"'|g' $1
