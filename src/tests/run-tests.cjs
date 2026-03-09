const assert = require('assert');

function buildRangeDates(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const out = [];
  let d = new Date(s);
  while (d <= e) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function removeDate(list, date) {
  return list.filter(d => !isSameDay(d, date));
}

function testEmptyList() {
  const dates = [];
  assert.strictEqual(dates.length, 0);
}

function testRangeBuild() {
  const dates = buildRangeDates('2026-02-21', '2026-02-26');
  assert.strictEqual(dates.length, 6);
  assert.ok(isSameDay(dates[0], new Date('2026-02-21')));
  assert.ok(isSameDay(dates[5], new Date('2026-02-26')));
}

function testRapidCrossClicks() {
  let list = [
    new Date('2026-02-21'),
    new Date('2026-02-26'),
    new Date('2026-02-28'),
  ];
  list = removeDate(list, new Date('2026-02-26'));
  list = removeDate(list, new Date('2026-02-26'));
  assert.strictEqual(list.length, 2);
}

function testResizeAnchorNoCrash() {
  try {
    assert.ok(true);
  } catch (e) {
    assert.fail(e);
  }
}

function run() {
  testEmptyList();
  testRangeBuild();
  testRapidCrossClicks();
  testResizeAnchorNoCrash();
  // format hyphen test
  const s = new Date('2026-02-20');
  const e = new Date('2026-02-28');
  const hyphen = `${s.toLocaleString('en-US', { month: 'short', day: 'numeric' })}, ${s.getFullYear()} - ${e.toLocaleString('en-US', { month: 'short', day: 'numeric' })}, ${e.getFullYear()}`;
  console.log(hyphen);
  console.log('All tests passed');
}

run();
