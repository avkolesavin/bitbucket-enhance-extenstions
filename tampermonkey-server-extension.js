// ==UserScript==
// @name         Developing server connector
// @description  Connects to the local server, loads a provided extension script and eval it on the page. This allows to see fresh changes immediately.
// @namespace    http://tampermonkey.net/
// @author       Aleksandr Kolesavin
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