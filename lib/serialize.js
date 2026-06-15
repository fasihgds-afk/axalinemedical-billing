export function serializeDocument(doc) {
  if (!doc) return null;

  const plain = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };

  if (plain._id) {
    plain._id = plain._id.toString();
  }

  if (plain.userId?._id) {
    plain.userId = {
      ...plain.userId,
      _id: plain.userId._id.toString(),
    };
  } else if (plain.userId) {
    plain.userId = plain.userId.toString();
  }

  for (const key of Object.keys(plain)) {
    if (plain[key] && typeof plain[key] === "object" && plain[key]._id && !Array.isArray(plain[key])) {
      if (plain[key] instanceof Date) continue;
      plain[key] = serializeDocument(plain[key]);
    }
  }

  return JSON.parse(JSON.stringify(plain));
}
