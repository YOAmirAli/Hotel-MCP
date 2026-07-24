export async function callMCPTool(tool: string, params: Record<string, unknown>) {
  return {
    tool,
    params,
    status: 'mocked',
    message: 'MCP tool wiring is not configured yet, so this request was handled locally.',
  }
}
