# In case you have problems with node, npm, webpack, you can use docker to make a separate "machine"
# https://docs.docker.com/get-docker/

# Run this command:
# docker-compose up

FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_17.x |  bash -
RUN apt-get install -y nodejs

EXPOSE 8080

RUN printf "#!/bin/bash\ncd /dh2642-lab;npm install; npm run dev\n" > /start.sh
RUN chmod a+x /start.sh
ENTRYPOINT ["/start.sh"]

