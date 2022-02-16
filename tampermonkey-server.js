#! /usr/bin/env node

const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 8888;
const cwd = process.cwd();
const [, , scriptRelativePath] = process.argv;

if (!scriptRelativePath || !scriptRelativePath.endsWith('.js')) {
    console.error('Path to .js script required!');
    process.exit(1);
}

const scriptPath = path.resolve(cwd, scriptRelativePath);

if (!fs.existsSync(scriptPath)) {
    console.error(`File ${scriptRelativePath} doesn't exists`);
    process.exit(1);
}

const httpServer = http.createServer((_, res) => {
    const scriptSize = fs.statSync(scriptPath).size;

    res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=UTF-8',
        'Content-Length': scriptSize,
        'Access-Control-Allow-Origin': '*',
    });

    const rs = fs.createReadStream(scriptPath);

    rs.pipe(res);
});

httpServer.listen(PORT, () => {
    console.log(`🏁 Tampermonkey server started at port ${PORT}`);
});
