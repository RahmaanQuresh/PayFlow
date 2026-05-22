export function apiError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
): Response {
  return Response.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

export function successResponse(data: Record<string, unknown>, status = 200): Response {
  return Response.json({ success: true, ...data }, { status });
}
