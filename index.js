import { FileMakerClient, LoginException } from './filemakerclient.js';

const server = 'https://250d16f3-353b-4088-8931-8fb89906818a.mock.pstmn.io';
const database = 'Bestell-DB';
const username = 'user';
const password = 'pass';

try {
    const client = new FileMakerClient(server, database, username, password);
    await client.login();
    const data = await client.getRecordList('erfolgte_Bestellungen_Liste');
    console.log(data);
} catch (e) {
    if (e instanceof LoginException) {
        // TODO
    }
    console.error(e);
}
