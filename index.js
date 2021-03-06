/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const stringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')
const config = require('./config')

// Instantiate the http server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)
})

// Start the server
httpServer.listen(config.httpPort, () => {
    console.log(`The server is listening on port`, config.httpPort)
})

// Instantiate the http server
httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)
})

// Start the server
httpsServer.listen(config.httpsPort, () => {
    console.log(`The server is listening on port`, config.httpsPort)
})

// All the server logic for both the http and https servers
var unifiedServer = (req, res) => {
    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true)

    // Get the path from that URL
    const path = parsedUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // Get the query string as an object
    const query = parsedUrl.query

    // Get the HTTP Method
    const method = req.method.toLowerCase()

    // Get the headers as an object
    const headers = req.headers

    // Get the payload, if any
    const decoder = new stringDecoder('utf-8')
    var buffer = ''
    req.on('data', (data) => {
        buffer += decoder.write(data)
    })
    req.on('end', () => {
        buffer += decoder.end()

        // Choose the handler this request should go to
        // If one is not found, use the notFound handler
        const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            query,
            method,
            headers,
            payload: buffer
        }

        // Route the request to the chosen handler
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handler
            // or default to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200

            // Use the payload called back by the handler
            // or default to an empty object
            payload = typeof (payload) == 'object' ? payload : {}

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload)

            // Return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)

            // Log the request path
            console.log(`Request received on path: /${trimmedPath}`, `\n  with method`, method, `\n  with query:`, query, `\n  with headers:`, headers, `\n  with payload`, buffer)
            console.log(`Returning this response:`, statusCode, payloadString)
        })
    })
}

// Define the handlers
const handlers = {}

// Hello handler
handlers.hello = (data, callback) => {
    callback(200, { message: 'Hello world!'})
}

// Ping handler
handlers.ping = (data, callback) => {
    callback(200)
}

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404)
}

// Define a request router
const router = {
    ping: handlers.ping,
    hello: handlers.hello
}