"use strict";

async function getWorkItems(repo: string, baseUrl) {
    let wiql =
        "SELECT [System.Id] FROM workitems WHERE [System.Title] CONTAINS '" +
        repo +
        ":' AND [System.WorkItemType] = 'User Story' ORDER BY [System.Id] DESC";

    const query = {
        query: wiql,
    };

    let response = await fetch(baseUrl + `/_apis/wit/wiql?api-version=6.0`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
    });

    console.log("Response: ", response);

    let responseUrls = [];
    await response.json().then((data) => {
        data.workItems.forEach((workItem) => {
            responseUrls.push(workItem.url);
        });
    });
    return responseUrls;
}

async function getWorkItemDetailsFromUrl(url: string) {
    // console.log("Requesting: ", url);
    let response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    let json = await response.json();
    return json;
}

async function getWorkItemDetails(responseUrls: Array<string>) {
    let items = [];
    for (let i = 0; i < responseUrls.length; i++) {
        let cItem = await getWorkItemDetailsFromUrl(responseUrls[i]);
        let pItem = {
            id: cItem.id,
            title: cItem.fields["System.Title"],
            url: cItem._links.html.href,
        };
        items.push(pItem);
    }
    return items;
}

function getLastWorkItem(
    workItemDetails: { title: any; id: number; url: string }[]
) {
    let lastWorkItem = workItemDetails[0];
    let highestVersion = 0;

    workItemDetails.forEach(
        (workItem: { title: any; id: number; url: string }) => {
            let title = workItem.title;

            try {
                // regex for version :1.1.1
                let versions = title.match(/\d+\.\d+\.\d+/);

                if (versions.length == 1) {
                    let version = versions[0];
                    let versionNumber = parseInt(version.replace(".", ""));

                    if (versionNumber > highestVersion) {
                        highestVersion = versionNumber;
                        lastWorkItem = workItem;
                    } else if (
                        versionNumber == highestVersion &&
                        workItem.id > lastWorkItem.id
                    ) {
                        lastWorkItem = workItem;
                    }
                }
            } catch (e) {
                //ignore
            }
        }
    );
    return lastWorkItem;
}

chrome.webNavigation.onHistoryStateUpdated.addListener(async function (
    details
) {
    if (details.url.match(/https?:\/\/.*?\.visualstudio.com\/.*?\/_git\/.*/)) {
        console.log("Navigated to a new page: ", details.url);
        let repoFullName = details.url.split("_git/")[1];
        let repoPlus = repoFullName.split("/")[0];
        repoPlus = repoPlus.split("?")[0];

        let repoPlusParts = repoPlus.split(".");

        let repo = repoPlusParts[repoPlusParts.length - 1];

        if (repo == undefined) {
            return;
        }

        console.log("Repo: ", repo);

        let baseUrl = details.url.split("/_git/")[0];

        console.log("Base URL: ", baseUrl);

        let WorkItemUrls = await getWorkItems(repo, baseUrl);
        let workItemDetails = await getWorkItemDetails(WorkItemUrls);
        let lastWorkItem = getLastWorkItem(workItemDetails);

        await chrome.storage.local.set({ lastWorkItem: lastWorkItem });

        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            files: ["content.js"],
        });
    }
});
