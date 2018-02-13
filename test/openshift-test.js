'use strict';

const test = require('ava');
const OpenshiftTestAssistant = require('openshift-test-assistant');
const openshiftAssistant = new OpenshiftTestAssistant();

test.before('setup', () => {
  return openshiftAssistant.deploy();
});

test('stop service', async (t) => {
  t.plan(3);
  // test hello
  let response = await openshiftAssistant.createRequest()
    .get('/api/greeting')
    .expect('Content-Type', /json/)
    .expect(200);
  t.is(response.body.content, 'Hello, World!');

  // stop the service
  await openshiftAssistant.createRequest()
    .get('/api/stop')
    .expect(200);

  // expect service failure (expressed by return code 503)
  response = await openshiftAssistant.createRequest()
    .get('/api/greeting');
  t.is(response.status, 503, 'Failure should be expresses by 503 return code');

  // wait for api to recover and test response again
  await openshiftAssistant.waitFor(apiIsReady);
  // test that app is running correctly
  response = await openshiftAssistant.createRequest()
    .get('/api/greeting')
    .expect('Content-Type', /json/)
    .expect(200);
  t.is(response.body.content, 'Hello, World!');
});

test.after.always('teardown', () => {
  return openshiftAssistant.undeploy();
});

async function apiIsReady () {
  const response = await openshiftAssistant.createRequest()
    .get('/api/greeting');
  return response.status === 200;
}
