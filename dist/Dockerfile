FROM nginx:1.11.1

COPY nginx.conf /etc/nginx/nginx.conf

RUN apt-get update && apt-get install -y \
	curl \
	sudo

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get update && apt-get install -y \
	nodejs
RUN npm install -g gulp@3.9.1

COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/share/nginx/html && cp -a /tmp/node_modules /usr/share/nginx/html/

COPY gulpfile.js /usr/share/nginx/html/gulpfile.js
COPY src /usr/share/nginx/html/src
COPY dist /usr/share/nginx/html/dist

EXPOSE 80

WORKDIR /usr/share/nginx/html
ENTRYPOINT [ "/bin/sh", "-c", "gulp && nginx -g 'daemon off;'" ]
