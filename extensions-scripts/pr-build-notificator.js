// ==UserScript==
// @name         Pr build notificator
// @version      0.1
// @author       Aleksandr Kolesavin
// @updateURL    https://raw.githubusercontent.com/avkolesavin/bitbucket-enhance-extenstions/main/extensions-scripts/pr-build-notificator.js
// @downloadURL  https://raw.githubusercontent.com/avkolesavin/bitbucket-enhance-extenstions/main/extensions-scripts/pr-build-notificator.js
// @supportURL   https://github.com/avkolesavin/bitbucket-enhance-extenstions/issues
// @match        https://*/projects/*/repos/*/pull-requests/*/*
// @grant        none
// ==/UserScript==

const POLLING_INTERVAL = 5000;

const buildsUrlPattern = /^https?:\/\/(.+?)\/projects\/(\w+)\/repos\/(\w+)\/pull-requests\/(\d+)\/\w+/g;
const [, host, projectKey, repositorySlug, prId] = buildsUrlPattern.exec(document.location.href);
const buildsApiUrl = `https://${host}/rest/ui/latest/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${prId}/build-summaries`;

let isFirstPoll = true;

const notify = (message, icon) => {
    new Notification('PR build status', {
        body: message,
        requireInteraction: true,
        icon,
    });
};

const notifyBuildResult = (isSuccessful) => {
    const message = `Build for ${prId} PR is ${isSuccessful ? 'done' : 'failed'}!`;
    const icon = `https://github.com/avkolesavin/bitbucket-enhance-extenstions/raw/main/assets/icons/${isSuccessful ? 'party' : 'sad'}-64px.png`;

    if ("Notification" in window) {
        if (Notification.permission === 'granted') {
            notify(message, icon);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(permission => {
                if (permission === 'granted') {
                    notify(message, icon);
                }
            });
        }
    }
};

const pollPrBuildStatus = async () => {
    try {
        const response = await fetch(buildsApiUrl);
        const buildsData = await response.json();
        const buildsStatuses = Object.entries(buildsData);

        if (buildsStatuses.length) {
            const [[, { successful, inProgress }]] = buildsStatuses;

            if (inProgress) {
                setTimeout(pollPrBuildStatus, POLLING_INTERVAL);
            } else {
                if (!isFirstPoll) {
                    notifyBuildResult(!!successful);
                    isNotified = true;
                }
            }
        }

        isFirstPoll = false;
    } catch { }
}

pollPrBuildStatus();
