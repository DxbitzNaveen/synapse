// Copyright (c) 2026, Dxbitz and contributors
// Views one Synapse Page by name from the route /app/synapse-view/<name>. It
// fetches the page's layout and hands it to the M0/M1 library to lay onto the
// 12-column grid. It wires no data source; each block renders its frozen data.

frappe.pages["synapse-view"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Synapse View"),
		single_column: true,
	});
	wrapper.__synapse = new SynapsePageView(page);
};

frappe.pages["synapse-view"].on_page_show = function (wrapper) {
	if (wrapper.__synapse) wrapper.__synapse.load();
};

class SynapsePageView {
	constructor(page) {
		// No load() here: Frappe fires on_page_show right after on_page_load,
		// so loading in both drew every page twice.
		this.page = page;
	}

	route_name() {
		const route = frappe.get_route() || [];
		return route[1] || null;
	}

	load() {
		if (!(window.synapse && synapse.library && synapse.library.render_page)) {
			this.page.main.html(placeholder("Library bundle not loaded", "Run bench build --app synapse and reload."));
			return;
		}

		const name = this.route_name();
		if (!name) {
			this.page.set_title(__("Synapse View"));
			this.render_index();
			return;
		}

		this.page.main.html(`<div class="text-muted" style="padding:24px;">${__("Loading...")}</div>`);
		frappe.call("synapse.api.get_page_layout", { name }).then(
			(r) => {
				const model = r && r.message;
				if (!model) {
					this.page.main.html(placeholder("Page not found", name));
					return;
				}
				this.page.set_title(model.title || name);
				const host = document.createElement("div");
				this.page.main.empty().append(host);
				synapse.library.render_page(host, model);
			},
			() => this.page.main.html(placeholder("Could not load page", name)),
		);
	}

	// Opened without a page name: list the enabled pages to pick from, rather
	// than a dead end.
	render_index() {
		this.page.main.html(`<div class="text-muted" style="padding:24px;">${__("Loading...")}</div>`);
		frappe.db
			.get_list("Synapse Page", {
				filters: { enabled: 1 },
				fields: ["name", "title"],
				order_by: "title asc",
				limit: 500,
			})
			.then((pages) => {
				if (!pages.length) {
					this.page.main.html(placeholder("No Synapse Pages yet", "Create one from the Synapse Page list."));
					return;
				}
				const $list = $(`<div style="max-width:760px;padding:8px 0;"></div>`);
				$(`<div class="text-muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin:6px 0 10px;">${__("Pages")}</div>`).appendTo($list);
				pages.forEach((p) => {
					const $item = $(
						`<a href="#" style="display:block;padding:10px 12px;margin-bottom:6px;border:1px solid var(--border-color);border-radius:8px;color:var(--text-color);text-decoration:none;background:var(--card-bg,var(--fg-color));">
							<div style="font-weight:600;">${frappe.utils.escape_html(p.title || p.name)}</div>
							<div class="text-muted" style="font-size:12px;">${frappe.utils.escape_html(p.name)}</div>
						</a>`
					).appendTo($list);
					$item.on("click", (e) => {
						e.preventDefault();
						frappe.set_route("synapse-view", p.name);
					});
				});
				this.page.main.empty().append($list);
			});
	}
}

function placeholder(title, sub) {
	return (
		`<div class="synapse-placeholder" style="margin:24px;">` +
		`<div class="synapse-placeholder-title">${frappe.utils.escape_html(title)}</div>` +
		(sub ? `<div class="synapse-placeholder-sub">${frappe.utils.escape_html(sub)}</div>` : "") +
		`</div>`
	);
}
