import server from "../dist/server/server.js";

export default async function handler(req, res) {
  try {
    // 1. Construct the Web-standard Request URL
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = new URL(req.url, `${protocol}://${host}`);

    // 2. Collect the request body (if any)
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await getRawBody(req);
    }

    // 3. Create the Web-standard Request
    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body,
      // Node.js Fetch API requires duplex: 'half' when sending a body
      ...(body ? { duplex: 'half' } : {}),
    });

    // 4. Invoke the server's fetch handler
    const webResponse = await server.fetch(webRequest);

    // 5. Write headers from Web Response to Node ServerResponse
    res.statusCode = webResponse.status;
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // 6. Write the body from Web Response to Node ServerResponse
    const responseBody = await webResponse.arrayBuffer();
    res.end(Buffer.from(responseBody));
  } catch (error) {
    console.error("Vercel Serverless SSR Bridge Error:", error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}

// Helper to collect raw body from Node.js stream
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}
