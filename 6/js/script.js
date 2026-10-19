"use strict";

// Keep application configuration and initialization out of the global scope.
(function initializeApp() {
    const DATA_URL = "data/skills.json";
    const REQUEST_TIMEOUT_MS = 15000;
    const IMAGE_PATH_PATTERN = /^images\/[\w-]+\.(jpg|png)$/;

    // Create a DOM node using plain text rather than interpreting data as HTML.
    function createElement(tag, text, className) {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    // Store the requested view on a button for the Explorer's click handler.
    function createButton(text, action, categoryId, skillId) {
        const button = createElement("button", text);
        button.type = "button";
        button.dataset.action = action;
        if (categoryId) button.dataset.categoryId = categoryId;
        if (skillId) button.dataset.skillId = skillId;
        return button;
    }

    // Build an image from a validated JSON record and its descriptive alt text.
    function createImage(item, className) {
        const image = createElement("img", null, className);
        image.src = item.image;
        image.alt = item.imageAlt;
        return image;
    }

    // Convert a JSON string array into an ordered or unordered list.
    function createList(items, tag) {
        const list = createElement(tag);
        items.forEach(item => list.append(createElement("li", item)));
        return list;
    }

    // Build a reusable category or skill card with a DOM navigation button.
    function createCard(item, buttonText, action, categoryId, skillId) {
        const card = createElement("article", null, "card");
        card.append(
            createImage(item, "category-image"),
            createElement("h3", item.name),
            createElement("p", item.description),
            createButton(buttonText + item.name + " →", action, categoryId, skillId)
        );
        return card;
    }

    // Move focus after a user action, but leave initial page-load focus alone.
    function finishView(container, label, focusTarget) {
        container.setAttribute("aria-label", label);
        if (focusTarget) {
            focusTarget.tabIndex = -1;
            focusTarget.focus();
        }
    }

    // Display the first choice: the categories supplied by the external JSON.
    function renderCategories(container, data, moveFocus = false) {
        container.replaceChildren();
        container.className = "card-grid";
        const heading = createElement("h2", "Choose a category", "explorer-heading");
        container.append(heading);
        data.categories.forEach(category => {
            container.append(createCard(category, "Explore ", "skills", category.id));
        });
        finishView(container, "Survival skill categories", moveFocus ? heading : null);
    }

    // Display the second choice: the skills belonging to one category.
    function renderSkillChoices(container, category) {
        container.replaceChildren();
        container.className = "card-grid";
        const header = createElement("div", null, "explorer-heading");
        const heading = createElement("h2", category.name + " Skills");
        header.append(
            createButton("← Back to Categories", "categories"),
            heading,
            createElement("p", category.description)
        );
        container.append(header);
        category.skills.forEach(skill => {
            container.append(createCard(skill, "Learn ", "details", category.id, skill.id));
        });
        finishView(container, category.name + " skills", heading);
    }

    // Preserve an original explanation or materials section in the detail view.
    function createInformationSection(section) {
        const block = createElement("section");
        block.append(createElement("h3", section.heading));
        section.paragraphs.forEach(text => block.append(createElement("p", text)));
        if (section.items.length) block.append(createList(section.items, "ul"));
        return block;
    }

    // Build the safety note copied from the original skill information.
    function createSafetyNote(text) {
        const note = createElement("aside", null, "safety-note");
        note.append(createElement("h3", "Safety Note"), createElement("p", text));
        return note;
    }

    // Build source links from records that passed HTTPS URL validation.
    function createSources(sources) {
        const section = createElement("section", null, "source");
        section.append(createElement("h3", "Sources"));
        sources.forEach(source => {
            const link = createElement("a", source.label);
            link.href = source.url;
            const paragraph = createElement("p");
            paragraph.append(link);
            section.append(paragraph);
        });
        return section;
    }

    // Show the full information after the second choice without leaving the page.
    function renderSkillDetails(container, category, skill) {
        container.replaceChildren();
        container.className = "skill-detail";
        const heading = createElement("h2", skill.name);
        container.append(
            createButton("← Back to " + category.name, "skills", category.id),
            heading,
            createImage(skill, "skill-detail-image"),
            createElement("p", skill.description)
        );
        skill.sections.forEach(section => container.append(createInformationSection(section)));
        container.append(
            createElement("h3", "Steps"),
            createList(skill.steps, "ol"),
            createSafetyNote(skill.safety),
            createSources(skill.sources)
        );
        finishView(container, skill.name + " information", heading);
    }

    // Check required text values before any JSON data reaches a view.
    function isNonemptyText(value) {
        return typeof value === "string" && value.trim().length > 0;
    }

    // Empty arrays are valid for optional paragraphs or materials in a section.
    function isTextArray(values) {
        return Array.isArray(values) && values.every(isNonemptyText);
    }

    // Check fields shared by categories and skills, including local image paths.
    function isValidItem(item) {
        return Boolean(item)
            && [item.id, item.name, item.description, item.imageAlt].every(isNonemptyText)
            && typeof item.image === "string" && IMAGE_PATH_PATTERN.test(item.image);
    }

    // Accept only complete explanation sections with text arrays.
    function isValidSection(section) {
        return Boolean(section) && isNonemptyText(section.heading)
            && isTextArray(section.paragraphs) && isTextArray(section.items);
    }

    // Reject malformed or executable source URLs before creating links.
    function isValidSource(source) {
        if (!source || !isNonemptyText(source.label) || !isNonemptyText(source.url)) {
            return false;
        }
        try {
            return new URL(source.url).protocol === "https:";
        } catch {
            return false;
        }
    }

    // Require all information needed for a complete final skill view.
    function isValidSkill(skill) {
        return isValidItem(skill) && isTextArray(skill.steps) && skill.steps.length > 0
            && isNonemptyText(skill.safety)
            && Array.isArray(skill.sections) && skill.sections.length > 0
            && skill.sections.every(isValidSection)
            && Array.isArray(skill.sources) && skill.sources.length > 0
            && skill.sources.every(isValidSource);
    }

    // Reject duplicate IDs so each navigation button identifies one record.
    function hasUniqueIds(items) {
        return new Set(items.map(item => item.id)).size === items.length;
    }

    // Check one category and its complete skill collection.
    function isValidCategory(category) {
        return isValidItem(category) && Array.isArray(category.skills)
            && category.skills.length > 0 && category.skills.every(isValidSkill)
            && hasUniqueIds(category.skills);
    }

    // Return validated data instead of mutating application state in this helper.
    function validateData(data) {
        if (!data || !Array.isArray(data.categories) || data.categories.length === 0
            || !data.categories.every(isValidCategory) || !hasUniqueIds(data.categories)) {
            throw new Error("Invalid survival skill data.");
        }
        return data;
    }

    // Fetch and validate data, always clearing the request timeout afterward.
    async function fetchSurvivalData() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(DATA_URL, { signal: controller.signal });
            if (!response.ok) throw new Error("Could not load survival data.");
            return validateData(await response.json());
        } finally {
            clearTimeout(timeout);
        }
    }

    // Keep a failed request recoverable without navigating away from Explorer.
    function renderLoadError(container, statusMessage) {
        container.replaceChildren();
        const message = createElement("div", null, "explorer-heading error-message");
        message.append(
            createElement("h2", "Skills could not be loaded"),
            createElement("p", "Open this page through Live Server or GitHub Pages, then check your connection and try again."),
            createButton("Try Again", "retry")
        );
        container.append(message);
        statusMessage.textContent = "Skills could not be loaded. A Try Again button is available.";
    }

    // Own Explorer state locally; navigating choices never reloads the document.
    function initializeExplorer() {
        const container = document.querySelector("#explorer-content");
        if (!container) return;
        const statusMessage = document.querySelector("#explorer-status");
        let survivalData;

        // Replace local state only after a successful, validated JSON request.
        async function loadSurvivalData() {
            container.className = "card-grid";
            container.setAttribute("aria-busy", "true");
            container.replaceChildren(createElement("p", "Loading survival skills…", "explorer-heading"));
            statusMessage.textContent = "Loading survival skills…";
            try {
                survivalData = await fetchSurvivalData();
                renderCategories(container, survivalData);
                statusMessage.textContent = "Skills loaded. Choose a category, then a skill.";
            } catch {
                renderLoadError(container, statusMessage);
            } finally {
                container.setAttribute("aria-busy", "false");
            }
        }

        // Route button clicks to renderers; source links retain normal behavior.
        function handleExplorerClick(event) {
            const button = event.target.closest("button[data-action]");
            if (!button || !container.contains(button)) return;
            const action = button.dataset.action;
            if (action === "retry") {
                loadSurvivalData();
                return;
            }
            if (!survivalData) return;
            if (action === "categories") {
                renderCategories(container, survivalData, true);
                return;
            }
            const category = survivalData.categories.find(item => item.id === button.dataset.categoryId);
            if (!category) return;
            if (action === "skills") renderSkillChoices(container, category);
            if (action === "details") {
                const skill = category.skills.find(item => item.id === button.dataset.skillId);
                if (skill) renderSkillDetails(container, category, skill);
            }
        }

        container.addEventListener("click", handleExplorerClick);
        loadSurvivalData();
    }

    // Keep the Contact demo local and never put entered values into the URL.
    function handleContactSubmit(event) {
        event.preventDefault();
    }

    // Attach the local-only behavior to the original demonstration form.
    function initializeContact() {
        const contactForm = document.querySelector("#contact-form");
        if (!contactForm) return;
        contactForm.addEventListener("submit", handleContactSubmit);
    }

    initializeExplorer();
    initializeContact();
}());
