import http from './http';
import { PACKAGE_HOST } from './constants';

async function parseRepoURL(packageURL) {
  const resp = await http.get(packageURL);
  const parser = new DOMParser();
  const loadedHTML = parser.parseFromString(resp.data, 'text/html');
  const repoElement = loadedHTML.querySelector('#content .github-repo-info');
  if (repoElement === null) {
    return null;
  }
  return repoElement.dataset.url;
}

async function fetchRepoData(repoURL) {
  const params = {
    access_token: '581c59dc35f9ad9bd0e98f348f69a6aabc1ae602',
  };
  return http.get(repoURL, { params });
}

async function dispatchEvent({ messageType, data }, sender, sendResponse) {
  let result = null;
  let repoURL = null;
  let resp = null;
  switch (messageType) {
    case 'getRepoData':
      repoURL = await parseRepoURL(`${PACKAGE_HOST}${data}`);
      if (repoURL === null) {
        result = null;
        break;
      }
      resp = await fetchRepoData(repoURL);
      result = resp.data;
      break;
    default:
      break;
  }
  sendResponse(result);
  return result;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  dispatchEvent(message, sender, sendResponse);
  return true;
});
