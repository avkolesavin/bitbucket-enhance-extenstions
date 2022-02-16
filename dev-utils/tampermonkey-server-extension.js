// ==UserScript==
// @name         Developing server connector
// @version      1.0.1
// @description  Connects to the local server, loads a provided extension script and eval it on the page. This allows to see fresh changes immediately.
// @author       Aleksandr Kolesavin
// @updateURL    https://raw.githubusercontent.com/avkolesavin/bitbucket-enhance-extenstions/main/dev-utils/tampermonkey-server-extension.js
// @downloadURL  https://raw.githubusercontent.com/avkolesavin/bitbucket-enhance-extenstions/main/dev-utils/tampermonkey-server-extension.js
// @supportURL   https://github.com/avkolesavin/bitbucket-enhance-extenstions/issues
// @match *
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    const SCRIPT_SERVER_URL = 'http://localhost:8888';

    try {
        const request = await fetch(SCRIPT_SERVER_URL);
        const scriptText = await request.text();

        eval(scriptText);
    } catch { }
})();