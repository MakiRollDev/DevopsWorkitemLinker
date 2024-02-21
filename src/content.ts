// when document is done loading, append the new tab to the tablist
var insertedTab = `
    <span class="bolt-tab-inner-container subtle">
        <span class="bolt-tab-text" data-content="Workitem">
            Workitems
        </span>
    </span>
    <div class="workitem-dropdown-content">
    </div>`;

async function getKeyFromStorage(
    key: string,
    storage: chrome.storage.LocalStorageArea
): Promise<{
    title: any;
    id: number;
    url: string;
}> {
    return new Promise((resolve, reject) => {
        storage.get([key], function (result) {
            if (result[key] === undefined) {
                reject();
            } else {
                resolve(result[key]);
            }
        });
    });
}

async function getPossibleWorkItem(
    localStorage: chrome.storage.LocalStorageArea
) {
    let workitemLinks = [];

    var branchList = document.querySelector(
        ".version-dropdown button div div .text-ellipsis"
    );

    if (branchList != null) {
        let cBranch = branchList.textContent;

        let match = cBranch.match(/\d+/);
        let workItemId = match[0];
        if (workItemId == null || workItemId == undefined || workItemId == "") {
        } else {
            let currentUrl = window.location.href;
            let url = currentUrl.split("/");
            let newUrl =
                url[0] + "//" + url[2] + "/_workitems/edit/" + workItemId;

            workitemLinks.push({ id: workItemId, url: newUrl });
        }
    }

    let wIFromStorage = await getKeyFromStorage("lastWorkItem", localStorage);

    workitemLinks.push({ id: wIFromStorage.id, url: wIFromStorage.url });

    return workitemLinks;
}

function appendNewTab(parent: HTMLElement) {
    console.log("Appending new tab");
    var newTab = document.createElement("div");
    newTab.setAttribute("aria-posinset", "3");
    newTab.setAttribute("aria-selected", "false");
    newTab.setAttribute("aria-setsize", "2");
    newTab.className =
        "bolt-tab focus-treatment flex-noshrink toWorkitemDropdown";
    newTab.setAttribute("data-focuszone", "focuszone-14");
    newTab.id = "ToWorkitemTab";
    newTab.setAttribute("role", "tab");
    newTab.setAttribute("tabindex", "-1");

    newTab.innerHTML = insertedTab;

    let dropdown = newTab.querySelector(".workitem-dropdown-content");

    var branchList = document.querySelector(
        ".version-dropdown button div div .text-ellipsis"
    );

    if (branchList != null) {
        let cBranch = branchList.textContent;

        let match = cBranch.match(/\d+/);
        if (match) {
            let workItemId = match[0];
            if (
                workItemId == null ||
                workItemId == undefined ||
                workItemId == ""
            ) {
            } else {
                let currentUrl = window.location.href;
                let url = currentUrl.split("/");
                let newUrl =
                    url[0] + "//" + url[2] + "/_workitems/edit/" + workItemId;

                let dropdown = newTab.querySelector(
                    ".workitem-dropdown-content"
                );

                let a = document.createElement("a");

                a.href = newUrl;
                a.textContent = "B: " + workItemId;
                a.onclick = function () {
                    window.open(newUrl, "_self");
                };
                dropdown.appendChild(a);
            }
        }
    }

    chrome.storage.local.get(["lastWorkItem"], function (result) {
        let lastWorkItem = result["lastWorkItem"];
        let a = document.createElement("a");
        a.href = lastWorkItem.url;
        a.textContent = "L: " + lastWorkItem.id;
        a.onclick = function () {
            window.open(lastWorkItem.url, "_self");
        };
        dropdown.appendChild(a);
    });

    parent.appendChild(newTab);
}

function checkTabList(): boolean {
    var tabList = document.querySelector('.bolt-tabbar-tabs[role="tablist"]');
    if (tabList) {
        if (!tabList.querySelector("#ToWorkitemTab")) {
            appendNewTab(tabList as HTMLElement);
        }
        return true;
    }
    return false;
}

let observer = new MutationObserver(function (mutations, observer) {
    if (checkTabList()) {
        observer.disconnect();
    }
});

// Start observing the document with the configured parameters
if (!checkTabList()) {
    observer.observe(document, { childList: true, subtree: true });
}
