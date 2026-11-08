(function () {
	"use strict";

	var form = document.querySelector("[data-waitlist-form]");
	if (!form) return;

	var status = form.querySelector("[data-form-status]");
	var submitBtn = form.querySelector('button[type="submit"]');

	function setStatus(state, message) {
		if (!status) return;
		status.textContent = message;
		status.setAttribute("data-state", state);
	}

	form.addEventListener("submit", function (event) {
		event.preventDefault();
		var data = new FormData(form);
		var email = data.get("email");

		if (!email || email.indexOf("@") === -1) {
			setStatus("error", "That doesn't look like a valid email. Mind checking it?");
			return;
		}

		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.textContent = "Sending…";
		}
		setStatus("pending", "Sending…");

		fetch(form.getAttribute("action") || "/api/waitlist", {
			method: "POST",
			headers: { Accept: "application/json" },
			body: data,
		})
			.then(function (res) {
				return res.json().then(function (body) {
					return { ok: res.ok, body: body };
				});
			})
			.then(function (result) {
				if (result.ok) {
					setStatus("success", "You're on the list. We'll email you when there's news.");
					form.reset();
				} else {
					setStatus("error", result.body && result.body.error ? result.body.error : "Something went wrong. Try again in a moment.");
				}
			})
			.catch(function () {
				setStatus("error", "Couldn't reach the server. Try again, or email us directly.");
			})
			.finally(function () {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.textContent = "Join the waitlist";
				}
			});
	});
})();

(function () {
	"use strict";

	var form = document.querySelector("[data-contact-form]");
	if (!form) return;

	// No backend for general contact yet — this opens the visitor's own email
	// client with the message prefilled. The plain mailto link elsewhere on
	// the page is the real fallback if JavaScript is off.
	form.addEventListener("submit", function (event) {
		event.preventDefault();
		var data = new FormData(form);
		var name = (data.get("name") || "").toString().trim();
		var email = (data.get("email") || "").toString().trim();
		var message = (data.get("message") || "").toString().trim();
		var to = form.getAttribute("data-contact-form") || "hello@windstormservices.us";

		var subject = "Message from " + (name || "the contact form");
		var body = message + "\n\n— " + (name || "no name given") + (email ? " (" + email + ")" : "");

		window.location.href =
			"mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
	});
})();
