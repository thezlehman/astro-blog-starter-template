// Cloudflare Pages Function — POST /api/waitlist
// Validates the submitted email, checks it with Turnstile, then forwards it
// to Buttondown. Configure in the Cloudflare dashboard (Pages project ->
// Settings -> Environment variables):
//   TURNSTILE_SECRET_KEY  - secret key from the Turnstile widget
//   BUTTONDOWN_API_KEY    - API key from https://buttondown.email/settings/api

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function wantsJson(request) {
	const accept = request.headers.get("Accept") || "";
	return accept.includes("application/json");
}

function jsonResponse(status, body) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

async function verifyTurnstile(token, secret, ip) {
	if (!secret) return true; // not configured yet — skip rather than block signups
	if (!token) return false;

	const body = new URLSearchParams();
	body.set("secret", secret);
	body.set("response", token);
	if (ip) body.set("remoteip", ip);

	const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		body,
	});
	const data = await res.json();
	return data.success === true;
}

async function addToButtondown(email, apiKey) {
	if (!apiKey) {
		// Not configured yet: succeed locally so the form still works end to
		// end during setup, but log so it's visible in `wrangler pages deployment tail`.
		console.warn("BUTTONDOWN_API_KEY not set — skipping subscriber creation for", email);
		return { ok: true };
	}

	const res = await fetch("https://api.buttondown.email/v1/subscribers", {
		method: "POST",
		headers: {
			Authorization: `Token ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, tags: ["waitlist"] }),
	});

	if (res.status === 201) return { ok: true };

	// Buttondown returns 400 with a "duplicate" style error if already subscribed.
	if (res.status === 400) {
		const data = await res.json().catch(() => ({}));
		const alreadySubscribed = JSON.stringify(data).toLowerCase().includes("already");
		if (alreadySubscribed) return { ok: true, alreadySubscribed: true };
	}

	return { ok: false, status: res.status };
}

export async function onRequestPost(context) {
	const { request, env } = context;

	let email = "";
	let turnstileToken = "";

	const contentType = request.headers.get("Content-Type") || "";
	if (contentType.includes("application/json")) {
		const data = await request.json().catch(() => ({}));
		email = (data.email || "").trim();
		turnstileToken = data["cf-turnstile-response"] || "";
	} else {
		const data = await request.formData();
		email = (data.get("email") || "").toString().trim();
		turnstileToken = (data.get("cf-turnstile-response") || "").toString();
	}

	const redirectBack = wantsJson(request) ? null : new URL("/thanks.html", request.url);

	if (!EMAIL_RE.test(email)) {
		if (redirectBack) return Response.redirect(new URL("/?error=invalid-email", request.url), 303);
		return jsonResponse(400, { error: "That doesn't look like a valid email." });
	}

	const humanVerified = await verifyTurnstile(
		turnstileToken,
		env.TURNSTILE_SECRET_KEY,
		request.headers.get("CF-Connecting-IP"),
	);
	if (!humanVerified) {
		if (redirectBack) return Response.redirect(new URL("/?error=verification-failed", request.url), 303);
		return jsonResponse(400, { error: "Verification failed — please try again." });
	}

	const result = await addToButtondown(email, env.BUTTONDOWN_API_KEY);
	if (!result.ok) {
		if (redirectBack) return Response.redirect(new URL("/?error=signup-failed", request.url), 303);
		return jsonResponse(502, { error: "Couldn't add you to the list — try again shortly." });
	}

	if (redirectBack) return Response.redirect(redirectBack, 303);
	return jsonResponse(200, { ok: true, alreadySubscribed: !!result.alreadySubscribed });
}

export async function onRequestGet() {
	return jsonResponse(405, { error: "Use POST to join the waitlist." });
}
