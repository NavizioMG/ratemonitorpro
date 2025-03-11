export function exportChatHistory(chatHistory: any[]): void {
  // Convert chat history to markdown format
  const markdownContent = chatHistory.map(message => {
    const timestamp = new Date(message.timestamp).toLocaleString();
    const role = message.role === 'assistant' ? 'Assistant' : 'User';
    return `## ${role} (${timestamp})\n\n${message.content}\n\n---\n`;
  }).join('\n');

  // Create and download file
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `chat_history_${new Date().toISOString().split('T')[0]}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}