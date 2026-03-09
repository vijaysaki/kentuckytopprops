import { getTenantQueryParams } from "./api.js";
import { API_BASE_URL, CONTACT_FORMS_ENDPOINT } from "./config.js";

export function renderContactForm(form) {
  if (!form || !Array.isArray(form.fields)) return "";

  const fieldsHtml = form.fields
    .map((field) => {
      const fieldName = String(field.name || "").trim();
      const label = field.label || fieldName;
      const requiredMark = field.required ? '<span class="text-red-600">*</span>' : "";
      const requiredAttr = field.required ? "required" : "";
      const placeholder = field.placeholder || "";
      const type = String(field.type || "text").toLowerCase();

      if (!fieldName) return "";

      if (type === "textarea") {
        return `
          <div class="space-y-1">
            <label class="block text-sm font-medium text-slate-700">${label} ${requiredMark}</label>
            <textarea name="${fieldName}" ${requiredAttr} placeholder="${placeholder}" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-blue-600"></textarea>
          </div>
        `;
      }

      if (type === "select") {
        const options = Array.isArray(field.options) ? field.options : [];
        return `
          <div class="space-y-1">
            <label class="block text-sm font-medium text-slate-700">${label} ${requiredMark}</label>
            <select name="${fieldName}" ${requiredAttr} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-blue-600">
              <option value="">Select...</option>
              ${options.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
            </select>
          </div>
        `;
      }

      if (type === "checkbox") {
        return `
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="${fieldName}" class="rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
            <span>${label} ${requiredMark}</span>
          </label>
        `;
      }

      if (type === "radio" && Array.isArray(field.options)) {
        return `
          <div class="space-y-2">
            <p class="block text-sm font-medium text-slate-700">${label} ${requiredMark}</p>
            <div class="space-y-1">
              ${field.options
                .map(
                  (opt) => `
                    <label class="inline-flex items-center gap-2 text-sm text-slate-700 mr-4">
                      <input type="radio" name="${fieldName}" value="${opt}" ${requiredAttr} class="border-slate-300 text-blue-600 focus:ring-blue-600" />
                      <span>${opt}</span>
                    </label>
                  `
                )
                .join("")}
            </div>
          </div>
        `;
      }

      const safeType = ["text", "email", "tel", "number", "url"].includes(type)
        ? type
        : "text";
      return `
        <div class="space-y-1">
          <label class="block text-sm font-medium text-slate-700">${label} ${requiredMark}</label>
          <input type="${safeType}" name="${fieldName}" ${requiredAttr} placeholder="${placeholder}" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-blue-600" />
        </div>
      `;
    })
    .join("");

  return `
    <section class="mt-6 rounded-xl border border-slate-200 p-4 bg-slate-50">
      <h2 class="text-lg font-semibold text-slate-800">${form.name || "Contact Form"}</h2>
      ${form.description ? `<p class="mt-1 text-sm text-slate-600">${form.description}</p>` : ""}
      <form id="contact-form-dynamic" data-form-id="${form.id}" data-thank-you="${form.thankYouMessage || "Thanks. Your message has been submitted."}" class="mt-4 space-y-4">
        ${fieldsHtml}
        <button type="submit" class="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
          Submit
        </button>
        <p id="contact-form-message" class="text-sm"></p>
      </form>
    </section>
  `;
}

export function bindContactFormSubmission() {
  const formEl = document.getElementById("contact-form-dynamic");
  const messageEl = document.getElementById("contact-form-message");
  if (!formEl || !messageEl) return;

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formId = formEl.getAttribute("data-form-id");
    const thankYouMessage =
      formEl.getAttribute("data-thank-you") ||
      "Thanks. Your message has been submitted.";
    if (!formId) return;

    const data = {};
    const elements = Array.from(formEl.elements);
    elements.forEach((el) => {
      if (!el.name) return;
      if (el.type === "checkbox") {
        data[el.name] = Boolean(el.checked);
      } else if (el.type === "radio") {
        if (el.checked) data[el.name] = el.value;
      } else if (el.tagName === "BUTTON") {
        return;
      } else {
        data[el.name] = el.value;
      }
    });

    try {
      const params = getTenantQueryParams();
      const response = await fetch(
        `${API_BASE_URL}${CONTACT_FORMS_ENDPOINT}/${formId}/submissions?${params.toString()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data })
        }
      );
      if (!response.ok) throw new Error("Submission failed");

      messageEl.textContent = thankYouMessage;
      messageEl.className = "text-sm text-green-700";
      formEl.reset();
    } catch (error) {
      messageEl.textContent = "Unable to submit right now. Please try again.";
      messageEl.className = "text-sm text-red-700";
    }
  });
}
