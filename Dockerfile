FROM nginx:1.11.1

COPY build/nginx.conf /etc/nginx/nginx.conf

RUN apt-get update && apt-get install -y \
	curl \
	sudo

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get update && apt-get install -y \
	nodejs
RUN npm install -g gulp@3.9.1

COPY config /usr/share/nginx/html/carbon-workbench/config
COPY dist /usr/share/nginx/html/carbon-workbench/dist
COPY jspm_packages /usr/share/nginx/html/carbon-workbench/jspm_packages
COPY node_modules /usr/share/nginx/html/carbon-workbench/node_modules
COPY src /usr/share/nginx/html/carbon-workbench/src
COPY typings/typings.d.ts /usr/share/nginx/html/carbon-workbench/typings/typings.d.ts
COPY gulpfile.js /usr/share/nginx/html/carbon-workbench/gulpfile.js
COPY jspm.config.js /usr/share/nginx/html/carbon-workbench/jspm.config.js
COPY LICENSE /usr/share/nginx/html/carbon-workbench/LICENSE
COPY package.json /usr/share/nginx/html/carbon-workbench/package.json
COPY semantic.json /usr/share/nginx/html/carbon-workbench/semantic.json
COPY tsconfig.json /usr/share/nginx/html/carbon-workbench/tsconfig.json
COPY typings.json /usr/share/nginx/html/carbon-workbench/typings.json

EXPOSE 80

WORKDIR /usr/share/nginx/html/carbon-workbench
ENTRYPOINT [ "/bin/sh", "-c", "gulp --use-env && nginx -g 'daemon off;'" ]
