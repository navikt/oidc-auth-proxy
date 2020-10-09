
import setupTestcafe from 'testcafe';

let testcafe = null;
async function getTestRunner() {
    return setupTestcafe().then(tc => {
        testcafe = tc;
        return tc.createRunner();
    });
}

async function runTests() {
    const testRunner = await getTestRunner();
    const failedCount = await testRunner
        .src(['./tests/*.js'])
        .browsers(['chrome:headless'])
        .run({
            selectorTimeout: 3000,
            assertionTimeout: 3000,
            pageLoadTimeout: 3000,
            screenshots: {
                takeOnFails: true,
            },
        });

    testcafe.close();
    if (failedCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();