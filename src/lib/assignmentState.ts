export type AssignmentProject = {
  id: string;
  status: string | null;
  artist_id: string | null;
  is_locked?: boolean;
};

export function isArtistRequestVisible(p: AssignmentProject): boolean {
  if (!p) return false;
  return p.status === 'pending' && !!p.artist_id && !!p.is_locked;
}

export function clientStatusDisplay(p: AssignmentProject): string {
  if (!p) return 'Unknown';
  if (!p.artist_id) return 'Draft';
  if (p.status === 'completed') return 'Completed';
  if (p.status === 'accepted') return 'Active';
  if (p.status === 'cancelled') return 'Cancelled';
  if (p.status === 'pending' && !p.is_locked) return 'Pending Confirm';
  if (p.status === 'pending' && p.is_locked) return 'Pending Artist';
  return p.status || 'Unknown';
}
