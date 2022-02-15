const PR_ID_DATASET = 'data-pull-request-id';
const MIN_APPROVES_COUNT = 3;
const DELAY_AFTER_LOCATION_CHANGED = 700;

const bitbucketMetadataPattern = /^https?:\/\/(.+?)\/projects\/(\w+)\/repos\/(\w+)\/?/g;
const [, host, projectKey, repositorySlug] = bitbucketMetadataPattern.exec(document.location.href);

if (!(host && projectKey && repositorySlug)) {
    throw new Error('Not enough metadata');
}

const apiUrl = `https://${host}/rest/api/1.0/projects/${projectKey}/repos/${repositorySlug}`;

const approvesColors = {
    0: '#FF5722',
    1: '#FFC107',
    2: '#FFEB3B',
    3: '#4CAF50',
};
const getApproveColor = approves => approvesColors[approves] || approvesColors[MIN_APPROVES_COUNT];

const onLocationChange = locationChangeHandler => {
    let oldHref = document.location.href;

    const locationObserver = new MutationObserver(() => {
        if (oldHref !== document.location.href) {
            locationChangeHandler();
            oldHref = document.location.href;
        }
    });

    locationObserver.observe(document.body, { childList: true, subtree: true });
}

const withTimeout = (fn, timeout) => () => setTimeout(fn, timeout);

const normalizeToObj = arr => arr.reduce((acc, item) => (item.id ? { ...acc, [item.id]: item } : acc), {});

const getPullRequests = () => {
    return fetch(`${apiUrl}/pull-requests`)
        .then(res => res.json())
        .then(pullRequestsData => {
            return pullRequestsData.values.map(({ id, reviewers }) => ({
                id,
                approves: reviewers.reduce((acc, { approved }) => approved ? acc + 1 : acc, 0),
            }));
        });
}

(async () => {
    const pullRequests = normalizeToObj(await getPullRequests());

    const formatPRs = () => {
        const prRows = document.querySelectorAll('tr.pull-request-row');

        prRows.forEach(prRow => {
            const prId = prRow.getAttribute(PR_ID_DATASET);

            if (pullRequests[prId]) {
                const approves = pullRequests[prId].approves;

                prRow.classList.remove('focused');
                prRow.style.background = getApproveColor(approves);
                prRow.querySelectorAll('td *').forEach(td => td.style.color = '#172b4d');
            }
        });
    }

    formatPRs();
    onLocationChange(withTimeout(formatPRs, DELAY_AFTER_LOCATION_CHANGED));
})();
