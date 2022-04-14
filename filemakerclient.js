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

        const respJson = await resp.json();
        if (!resp.ok) {
            this.sessionToken = '';
            this.isLoggedIn = false;
            throw new FileMakerClientException(
                respJson.messages[0].message,
                resp.status
            );
        } else {
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

        const respJson = await resp.json();
        if (!resp.ok) {
            throw new FileMakerClientException(
                respJson.messages[0].message,
                resp.status
            );
        } else {
            return respJson.response.data;
        }
    }

    async findRecords(layoutName, query) {
        if (!this.isLoggedIn) {
            throw new FileMakerClientException("You'll need to login first");
        }
        let url =
            this.host +
            '/fmi/data/vLatest/databases/' +
            this.database +
            '/layouts/' +
            layoutName +
            '/_find';
        const resp = await fetch(url, {
            method: 'POST',
            headers: new Headers({
                Authorization: 'Bearer ' + this.sessionToken,
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(query),
        });
        const respJson = await resp.json();
        if (!resp.ok) {
            throw new FileMakerClientException(
                respJson.messages[0].message,
                resp.status
            );
        } else {
            return respJson.response.data;
        }
    }
}

class FileMakerClientException {
    constructor(message, statusCode) {
        if (statusCode && statusCode != '') {
            this.message = 'HTTP ' + statusCode + ': ';
        } else {
            this.message = '';
        }
        this.message += message;
    }
}

export { FileMakerClientException };
export { FileMakerClient };
