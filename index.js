import { FileMakerClient } from './filemakerclient.js';

const server = 'https://250d16f3-353b-4088-8931-8fb89906818a.mock.pstmn.io';
const database = 'Bestell-DB';
const username = 'user';
const password = 'pass';

try {
    const client = new FileMakerClient(server, database, username, password);
    await client.login();
    let data = await client.getRecordList('erfolgte_Bestellungen_Liste');
    console.log(data);

    const po = data[0].PONummer;
    const query = {
        query: [{ PONummer: '=' + po }],
        sort: [{ fieldName: 'FeldA', sortOrder: 'ascend' }],
    };
    data = await client.findRecords('Bestellungen_Liste', query);
    console.log(data);
} catch (e) {
    console.error(e);
}
