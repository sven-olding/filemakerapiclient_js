import fetch, { Headers } from 'node-fetch';

class FileMakerClient {
    isLoggedIn = false;

    constructor(host, database, username, password) {
        this.host = host;
        this.database = database;
        this.username = username;
        this.password = password;
    }

    async login() {
        console.debug('login...');
        const url =
            this.host +
            '/fmi/data/vLatest/databases/' +
            this.database +
            '/sessions';

        const resp = await fetch(url, {
            method: 'POST',
            headers: new Headers({
                Authorization:
                    'Basic: ' + btoa(this.username + ':' + this.password),
            }),
        });
        if (!resp.ok) {
            const respText = await resp.text();
            throw new LoginException(JSON.stringify(respText));
        } else {
            const respJson = await resp.json();
            this.sessionToken = respJson.response.token;
            this.isLoggedIn = this.sessionToken && this.sessionToken != '';
            return this.sessionToken;
        }
    }

    async getRecordList(layoutName, offset, limit, sortBy, sortOrder) {
        if (!this.isLoggedIn) {
            throw new FileMakerClientException("You'll need to login first");
        }
        let url =
            this.host +
            '/fmi/data/vLatest/databases/' +
            this.database +
            '/layouts/' +
            layoutName +
            '/records';

        let queryParams = new Map();
        if (offset) {
            queryParams.set('_offset', offset);
        }
        if (limit) {
            queryParams.set('_limit', limit);
        }
        if (sortBy) {
            let order = sortOrder || 'ascending';
            queryParams.set(
                '_sort',
                "[{fieldName: '" + sortBy + "', sortOrder: '" + order + "' }]"
            );
        }
        if (queryParams.size > 0) {
            const queryString = Object.keys(queryParams)
                .map((key) => key + '=' + queryParams.get(key))
                .join('&');
            url += queryString;
        }
        const resp = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                Authorization: 'Bearer ' + this.sessionToken,
            }),
        });
        if (!resp.ok) {
            const respText = await resp.text();
            throw new FileMakerClientException(JSON.stringify(respText));
        } else {
            const respJson = await resp.json();
            return respJson.response.data;
        }
    }
}

class LoginException {
    constructor(message) {
        this.message = message;
    }
}

class FileMakerClientException {
    constructor(message) {
        this.message = message;
    }
}

export { LoginException, FileMakerClientException };
export { FileMakerClient };
