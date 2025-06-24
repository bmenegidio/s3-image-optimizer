export async function safeOperation<T>(
  promise: () => Promise<T>,
): Promise<[null, T] | [unknown, null]> {
  try {
    const response = await promise();
    return [null, response as T];
  } catch (error) {
    return [error, null];
  }
}
