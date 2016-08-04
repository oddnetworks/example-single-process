var test = require('tape');

test('string test', t => {
	const string = 'string';

	t.equal(typeof (string), 'string');
	t.end();
});
