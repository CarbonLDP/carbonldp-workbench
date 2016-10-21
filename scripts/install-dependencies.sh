#!/bin/bash

cd /usr/src/project

echo "Installing Node dependencies..."
npm install
# TODO: This shouldn't be needed. Find out why it's not normally being executed after npm install
npm run-script postinstall
# TODO: This shouldn't be needed. node-sass' install script is not being executed
npm rebuild node-sass
echo "Node dependencies installed"

echo "Installing jspm dependencies..."
jspm install --yes
echo "jspm dependencies installed"

echo "Installing definition files..."
typings install
echo "Definition files installed"
