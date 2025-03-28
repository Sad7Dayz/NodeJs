# Build a Complete API with Node.js, Express & MongoDB  
### Features: Auth, JWT, CRUD, Winston Logging, Rate Limiting, HTTPS, Allowlist, Swagger

[![YouTube Video](https://img.shields.io/badge/Watch-YouTube-red?logo=youtube)](https://youtu.be/EMv8pc5Xo88?si=RJfc8kHPmSXOPtzY)
[![YouTube Video](https://img.shields.io/badge/Watch-YouTube-red?logo=youtube)](https://youtu.be/nBk8yR9WjL4?si=JUIFaG29dT_MRIqF)

## Features
- **Authentication & Authorization**: Secure API with JWT.
- **CRUD Operations**: Full implementation for managing resources.
- **Logging**: Winston for structured logging.
- **API Versioning**: Maintain multiple API versions efficiently.
- **Rate Limiting**: Prevent abuse with request throttling.
- **HTTPS Support**: Secure API communication with SSL/TLS.
- **Allowlist**: Restrict access to trusted IPs.
- **Swagger API Documentation**: Auto-generate API documentation.
- 
## API Versioning
- Implementing versioning in Express using URL prefixes (`/api/v1`, `/api/v2`).
- Middleware-based versioning strategies.
- Ensuring backward compatibility with minimal changes.

## Rate Limiting
- **Why?** Protect API from excessive requests and potential abuse.
- **How?** Using `express-rate-limit` to limit requests per IP.

## HTTPS
- Why? Encrypt data in transit to enhance security.
- How? Use https module with SSL/TLS certificates.

## Allowlist (IP Whitelisting)
- Why? Restrict API access to only trusted IP addresses.
- How? Middleware to allow only specific IPs.

## Swagger API Documentation
- Why? Automatically generate API documentation for better usability.
- How? Use swagger-ui-express to set up Swagger in Express.
