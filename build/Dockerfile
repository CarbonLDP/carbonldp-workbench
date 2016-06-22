FROM nginx:1.11.1

COPY carbon-workbench/build/nginx.conf /etc/nginx/nginx.conf

RUN apt-get update && apt-get install -y \
	curl \
	sudo

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get update && apt-get install -y \
	nodejs \
	git
RUN npm install -g gulp@3.9.1
RUN npm install -g jspm@0.17.0-beta.12
RUN npm install -g typings@1.0.5

COPY carbon-workbench/package.json /tmp/package.json
COPY carbon-workbench/jspm.browser.js /tmp/jspm.browser.js
COPY carbon-workbench/jspm.config.js /tmp/jspm.config.js
COPY carbon-workbench/typings.json /tmp/typings.json
RUN cd /tmp && npm install
RUN cd /tmp && jspm install
RUN cd /tmp && typings install
RUN mkdir -p /usr/share/nginx/html/carbon-workbench/
RUN cp -a /tmp/node_modules /usr/share/nginx/html/carbon-workbench/
RUN cp -a /tmp/jspm_packages /usr/share/nginx/html/carbon-workbench/
RUN cp -a /tmp/typings /usr/share/nginx/html/carbon-workbench/

COPY angular2-carbonldp/dist /usr/share/nginx/html/angular2-carbonldp/dist
COPY CarbonLDP-JS-SDK/dist /usr/share/nginx/html/CarbonLDP-JS-SDK/dist

COPY carbon-workbench/config /usr/share/nginx/html/carbon-workbench/config
COPY carbon-workbench/dist /usr/share/nginx/html/carbon-workbench/dist
COPY carbon-workbench/src /usr/share/nginx/html/carbon-workbench/src
COPY carbon-workbench/typings/typings.d.ts /usr/share/nginx/html/carbon-workbench/typings/typings.d.ts
COPY carbon-workbench/gulpfile.js /usr/share/nginx/html/carbon-workbench/gulpfile.js
COPY carbon-workbench/jspm.browser.js /usr/share/nginx/html/carbon-workbench/jspm.browser.js
COPY carbon-workbench/jspm.config.js /usr/share/nginx/html/carbon-workbench/jspm.config.js
COPY carbon-workbench/tsconfig.json /usr/share/nginx/html/carbon-workbench/tsconfig.json
COPY carbon-workbench/typings.json /usr/share/nginx/html/carbon-workbench/typings.json

EXPOSE 80

WORKDIR /usr/share/nginx/html/carbon-workbench
ENTRYPOINT [ "/bin/sh", "-c", "gulp --use-env && nginx -g 'daemon off;'" ]
