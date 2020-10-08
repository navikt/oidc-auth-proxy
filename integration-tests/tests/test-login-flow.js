import { Selector, ClientFunction } from 'testcafe';

const loginUrl = 'http://localhost:8101/login';
const loginSuccessUrl = 'http://localhost:8101/api/azure-mock/audience-check';
const getCurrentUrl = ClientFunction(() => window.location.href);
const expectedAudience = Selector('#audience').withText('azure-mock');

fixture `Test login & proxy flow`;

test('Logger inn og requester tjeneste bak proxy med riktig audience', async tc => {
    await tc.navigateTo(loginUrl);
    const currentUrl = await getCurrentUrl();
    await tc.expect(currentUrl).eql(loginSuccessUrl);
    await tc.expect(expectedAudience().exists).ok();
});