// Copyright (c) 2026, Dxbitz and contributors
// A "View Page" button on a saved Synapse Page, so the rendered page is one
// click away instead of a URL to type.

frappe.ui.form.on("Synapse Page", {
	refresh(frm) {
		if (frm.is_new()) {
			return;
		}

		frm.add_custom_button(__("View Page"), () => frappe.set_route("synapse-view", frm.doc.name));
	},
});
