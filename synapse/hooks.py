app_name = "synapse"
app_title = "Synapse"
app_publisher = "Dxbitz"
app_description = "A permission-aware MCP server for Frappe and ERPNext"
app_email = "info@dxbitz.com"
app_license = "agpl-3.0"

# The component library (M0). The bundle exposes synapse.library on the desk; the
# CSS styles the Group B widgets and placeholders from theme variables.
app_include_js = ["synapse.bundle.js"]
# A plain stylesheet, not a bundle, so it needs its full assets path. A bare
# filename is emitted as /synapse_library.css and 404s.
app_include_css = ["/assets/synapse/css/synapse_library.css"]

# install-app marks every patch as already run without executing it, so the
# seed_components patch never fills the catalog on a fresh site. Seed it here.
after_install = "synapse.components.catalog.seed"

# The MCP endpoint is served at:
#     POST /api/method/synapse.mcp.handle_mcp
# It is registered by the @mcp.register() decorator in synapse/mcp.py, which
# wraps frappe.whitelist, so there is no route to wire up here.
#
# Synapse creates no roles of its own. Access is granted entirely by Synapse
# Profile records, so a plain `bench install-app` is the whole installation.

# The admin console. The /apps screen is already System-Manager-only, and the
# has_permission gate keeps this tile to System Managers on top of that. Clicking
# it opens the desk Page `synapse`.
add_to_apps_screen = [
	{
		"name": "synapse",
		"logo": "/assets/synapse/images/synapse-mark.svg",
		"title": "Synapse",
		"route": "/app/synapse",
		"has_permission": "synapse.api.has_admin_permission",
	},
]

# The user-facing shortcut rides on the User form (a user's own profile), shown
# only when one of their roles is carried by a Synapse Profile, see
# public/js/synapse_user.js.
doctype_js = {
	"User": "public/js/synapse_user.js",
}

scheduler_events = {
	"daily": [
		# Drop Synapse Log rows past the retention window set in Synapse Settings.
		"synapse.synapse.doctype.synapse_log.synapse_log.delete_old_logs",
	],
}
