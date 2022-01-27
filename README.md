# npm-tutorial
tutorial version 5

1. install node, recent version (e.g. 17)

2. after checkout execute
```
npm install
```
3. to start your development server
```
npm run dev
```

In case of problems with npm, see (6) Docker below

4. Point your browser to HTML addresses corresponding to different steps of the tutorial, such as:

http://localhost:8080/tw1.1.html

http://localhost:8080/tw1.1-react.html

http://localhost:8080/tw1.2.html

http://localhost:8080/tw1.2-react.html

http://localhost:8080/tw1.2.1.html

The tutorial will point you to other such URLs. Each file under `tw/tw*.js` has a HTML counterpart

5. Unit tests should be run after each tutorial step. We recommend to load unit tests in an Incognito browser window.
http://localhost:8080/test.html

6. In case you have problems with node, npm, webpack, you can use Docker to make a clean little "machine"

https://docs.docker.com/get-docker/

To build your Docker image (see the file `Dockerfile`), run once:
```
docker build . -t dh2642
```

Also it is a good idea to remove the `node_modules` directory before starting the server for the first time.

Then every time you want to run the development server:

```
docker-compose up
```
(see the file `docker-compose.yml`) 
