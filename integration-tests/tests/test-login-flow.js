import { Selector, ClientFunction } from 'testcafe';

const loginUrl = 'http://localhost:8101/login';
const loginSuccessUrl = 'http://localhost:8101/api/azure-mock/audience-check';
const webSocketClientUrl = 'http://localhost:1337'
const getCurrentUrl = ClientFunction(() => window.location.href);
const expectedAudienceAzureMock = Selector('#audience').withText('azure-mock');
const expectedAudienceWebSocketServer = Selector('#audience').withText('websocket-server');


fixture `Test login & proxy flow`;

test('Logger inn og requester tjeneste bak proxy med riktig audience', async tc => {
    await tc.navigateTo(loginUrl);
    const currentUrl = await getCurrentUrl();
    await tc.expect(currentUrl).eql(loginSuccessUrl);
    await tc.expect(expectedAudienceAzureMock().exists).ok();
    //await tc.navigateTo(webSocketClientUrl);
    //await tc.expect(expectedAudienceWebSocketServer().exists).ok();
});
