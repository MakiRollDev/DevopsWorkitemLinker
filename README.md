# Workitem Linker <img src="public/icons/icon128.png" width="32" alt="Workitem Linker Icon" />

A small chrome extensio that adds a link to devops repository sites to related workitems.
It is not very smart, it just looks up the latest workitem and if the branch contains a workitem id, it adds a link to that workitem.

## Features

- Adds a link to the latest workitem (Userstory) that contains the repositories name
- Treats the first number in the branch name as the workitem id and adds a link to that workitem

## NOTE

This plugin in not very smart and will not work for all repositories. It is only tested for my own usecase.

It expects your repositories to look like this:
`.REPONAME(/|?.*)?` or `REPONAME(/|?.*)?`

The link should look something like this:
`https://yourDevops.visualstudio.com/yourproject/_git/reponame?anythingelseOrNothingAtAll`,
`https://yourDevops.visualstudio.com/yourproject/_git/reponame/anythingelseOrNothingAtAll`,
`https://yourDevops.visualstudio.com/yourproject/_git/reponame`

Userstories should look like this:
`reponame:1.0.0` or `asdcreponame:1.0.0`
`reponame:1.0.0:123` or `reponame:1.0.0.123` should work as well since everything after the version is ignore but this is not tested.

Branch names should contain the workitem id as the first number in their name:
`123-reponame` or `123-reponame-anythingelse2`
`test/123` or `123`

### Explanation

For the latest repo link:
Everything before `_git` is used as base URL for the api calls.
reponame is used to search for in userstory titles.

After that the highest version number is found.

For the branch link:
it just blindly links to the workitem with the id in the branch name. *Even if the workitem does not exist*
