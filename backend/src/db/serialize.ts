// Map our DB rows (id) to the API contract the frontend expects (_id).
// Strips sensitive fields where indicated.

export function withMongoId<T extends { id: string }>(row: T): T & { _id: string } {
  return { ...row, _id: row.id };
}

export function withMongoIdMany<T extends { id: string }>(rows: T[]): (T & { _id: string })[] {
  return rows.map(withMongoId);
}

export function sanitizeUser<T extends { id: string; passwordHash?: string }>(
  row: T,
): Omit<T, "passwordHash"> & { _id: string } {
  const { passwordHash: _passwordHash, ...rest } = row;
  void _passwordHash;
  return { ...rest, _id: row.id };
}
