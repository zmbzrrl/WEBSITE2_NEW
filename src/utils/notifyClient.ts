export async function sendTestNotification(baseUrl: string = 'http://localhost:5001') {
	const res = await fetch(`${baseUrl}/notify`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			to: 'test@example.com',
			subject: 'Test from PanelWebApp',
			text: 'This is a test notification.'
		})
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({} as any));
		throw new Error((err as any).error || `HTTP ${res.status}`);
	}
	return res.json();
}
