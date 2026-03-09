import { clientStatusDisplay, isArtistRequestVisible, AssignmentProject } from '../assignmentState';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

const draft: AssignmentProject = { id: '1', status: 'pending', artist_id: null, is_locked: false };
const pendingConfirm: AssignmentProject = { id: '2', status: 'pending', artist_id: 'artist', is_locked: false };
const pendingArtist: AssignmentProject = { id: '3', status: 'pending', artist_id: 'artist', is_locked: true };
const active: AssignmentProject = { id: '4', status: 'accepted', artist_id: 'artist', is_locked: true };
const completed: AssignmentProject = { id: '5', status: 'completed', artist_id: 'artist', is_locked: true };
const cancelled: AssignmentProject = { id: '6', status: 'cancelled', artist_id: 'artist', is_locked: false };

assert(clientStatusDisplay(draft) === 'Draft', 'draft display');
assert(clientStatusDisplay(pendingConfirm) === 'Pending Confirm', 'pending confirm display');
assert(clientStatusDisplay(pendingArtist) === 'Pending Artist', 'pending artist display');
assert(clientStatusDisplay(active) === 'Active', 'active display');
assert(clientStatusDisplay(completed) === 'Completed', 'completed display');
assert(clientStatusDisplay(cancelled) === 'Cancelled', 'cancelled display');

assert(isArtistRequestVisible(draft) === false, 'draft not visible to artist');
assert(isArtistRequestVisible(pendingConfirm) === false, 'unconfirmed pending not visible to artist');
assert(isArtistRequestVisible(pendingArtist) === true, 'confirmed pending visible to artist');
assert(isArtistRequestVisible(active) === false, 'active not in pending list');
assert(isArtistRequestVisible(completed) === false, 'completed not in pending list');
assert(isArtistRequestVisible(cancelled) === false, 'cancelled not in pending list');

export {};
