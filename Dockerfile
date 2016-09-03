FROM nginx:1.11.1

COPY build/nginx.conf /etc/nginx/nginx.conf

RUN apt-get update && apt-get install -y \
	curl \
	sudo

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get update && apt-get install -y \
	nodejs \
	git
RUN npm install -g gulp@3.9.1
RUN npm install -g jspm@0.17.0-beta.28
RUN npm install -g typings@1.0.5

COPY package.json /tmp/package.json
COPY jspm.config.js /tmp/jspm.config.js

COPY semantic.json /tmp/semantic.json
COPY src/semantic /tmp/src/semantic

COPY typings.json /tmp/typings.json
RUN cd /tmp && npm install
RUN cd /tmp && jspm install
RUN cd /tmp && typings install
RUN mkdir -p /usr/share/nginx/html/carbon-workbench/
RUN cp -a /tmp/node_modules /usr/share/nginx/html/carbon-workbench/
RUN cp -a /tmp/jspm_packages /usr/share/nginx/html/carbon-workbench/
RUN cp -a /tmp/typings /usr/share/nginx/html/carbon-workbench/

COPY config /usr/share/nginx/html/carbon-workbench/config
COPY dist /usr/share/nginx/html/carbon-workbench/dist
COPY src /usr/share/nginx/html/carbon-workbench/src
COPY typings/typings.d.ts /usr/share/nginx/html/carbon-workbench/typings/typings.d.ts
COPY gulpfile.js /usr/share/nginx/html/carbon-workbench/gulpfile.js
COPY jspm.config.js /usr/share/nginx/html/carbon-workbench/jspm.config.js
COPY tsconfig.json /usr/share/nginx/html/carbon-workbench/tsconfig.json
COPY typings.json /usr/share/nginx/html/carbon-workbench/typings.json

EXPOSE 80

WORKDIR /usr/share/nginx/html/carbon-workbench
ENTRYPOINT [ "/bin/sh", "-c", "gulp --use-env && nginx -g 'daemon off;'" ]
