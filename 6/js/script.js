"use strict";

// This block keeps the Explorer's data and helpers out of the global scope.
{
    const DATA_URL = "data/skills.json";
    const explorer = document.querySelector("#explorer-content");

    // Create plain-text DOM content without treating JSON strings as HTML.
    function createElement(tag, text, className) {
        const element = document.createElement(tag);
        if (text) element.textContent = text;
        if (className) element.className = className;
        return element;
    }

    // Identify an internal view change without an href or document navigation.
    function createButton(text, action, categoryId, skillId, className) {
        const button = createElement("button", text, className);
        button.type = "button";
        button.dataset.action = action;
        if (categoryId) button.dataset.categoryId = categoryId;
        if (skillId) button.dataset.skillId = skillId;
        return button;
    }

    // Preserve the image and alternative text belonging to the original view.
    function createImage(item, className) {
        const image = createElement("img", null, className);
        image.src = item.image;
        image.alt = item.imageAlt;
        return image;
    }

    // Add the original paragraphs in their original order.
    function appendParagraphs(container, paragraphs) {
        paragraphs.forEach(text => container.append(createElement("p", text)));
    }

    // Reuse the original page-heading layout and exact heading text.
    function createHeading(heading) {
        const section = createElement("section", null, "page-heading");
        section.append(createElement("h1", heading.title), createElement("p", heading.description));
        return section;
    }

    // Reuse Project 3 cards while replacing only their navigation links.
    function createCard(item, action, categoryId, skillId) {
        const card = createElement("article", null, "card");
        card.append(
            createImage(item, "category-image"),
            createElement("h2", item.name),
            createElement("p", item.description),
            createButton(item.buttonText, action, categoryId, skillId)
        );
        return card;
    }

    // Build one original explanation, materials section, or safety note.
    function createInformation(section, tag = "section", className) {
        const block = createElement(tag, null, className);
        block.append(createElement("h2", section.heading));
        appendParagraphs(block, section.paragraphs);
        if (section.items.length) {
            const list = createElement("ul");
            section.items.forEach(text => list.append(createElement("li", text)));
            block.append(list);
        }
        return block;
    }

    // Preserve source headings, introductory labels, citations, and link attributes.
    function createSources(sources) {
        const section = createElement("section", null, "source");
        section.append(createElement("h2", sources.heading));
        sources.paragraphs.forEach(source => {
            const paragraph = createElement("p", source.prefix ? source.prefix + " " : "");
            const citation = createElement("cite");
            const link = createElement("a", source.label);
            link.href = source.url;
            if (source.target) link.target = source.target;
            if (source.rel) link.rel = source.rel;
            citation.append(link);
            paragraph.append(citation);
            section.append(paragraph);
        });
        return section;
    }

    // Show the same category names, descriptions, images, and order as Project 3.
    function createCategoriesView(data) {
        const grid = createElement("section", null, "card-grid");
        grid.setAttribute("aria-label", data.gridLabel);
        data.categories.forEach(category => grid.append(createCard(category, "skills", category.id)));
        return [createHeading(data.heading), grid];
    }

    // Show the original category page's heading, skill cards, and back control.
    function createSkillsView(category) {
        const grid = createElement("section", null, "card-grid");
        grid.setAttribute("aria-label", category.gridLabel);
        category.skills.forEach(skill => grid.append(createCard(skill, "details", category.id, skill.id)));
        return [
            createHeading(category.heading),
            grid,
            createButton(category.backText, "categories", null, null, "back-link")
        ];
    }

    // Transfer every original detail paragraph, section, list, and source to DOM.
    function createDetailsView(category, skill) {
        const details = skill.details;
        const article = createElement("article", null, "skill-page");
        article.append(createElement("h1", details.name), createImage(details));
        appendParagraphs(article, details.introduction);
        details.sections.forEach(section => article.append(createInformation(section)));
        article.append(
            createInformation(details.safety, "aside", "safety-note"),
            createSources(details.sources),
            createButton(details.backText, "skills", category.id, null, "back-link")
        );
        return [article];
    }

    // Give keyboard and screen-reader users a heading after each view change.
    function showView(nodes, moveFocus = true) {
        explorer.replaceChildren(...nodes);
        if (moveFocus) {
            const heading = explorer.querySelector("h1");
            heading.tabIndex = -1;
            heading.focus();
        }
    }

    // Check required string values in externally loaded data.
    function isText(value) {
        return typeof value === "string" && value.trim().length > 0;
    }

    // Reject incomplete data before users reach a partially rendered skill.
    function validateData(data) {
        if (!data || !data.heading || !isText(data.heading.title)
            || !isText(data.heading.description) || !isText(data.gridLabel)
            || !Array.isArray(data.categories) || !data.categories.length) {
            throw new Error("Invalid category data.");
        }
        data.categories.forEach(category => {
            if (!isText(category.id) || !Array.isArray(category.skills) || !category.skills.length) {
                throw new Error("Invalid skill choices.");
            }
            createSkillsView(category);
            category.skills.forEach(skill => {
                if (!isText(skill.id) || !isText(skill.name) || !isText(skill.description)) {
                    throw new Error("Invalid skill data.");
                }
                // Build detached views to catch missing arrays or sections before display.
                createDetailsView(category, skill);
            });
        });
        createCategoriesView(data);
        return data;
    }

    // Display a readable failure state when the request or JSON is invalid.
    function showError() {
        const message = createElement("p", "Survival skills could not be loaded. Please open this page through a web server and try again.");
        message.setAttribute("role", "alert");
        const retryButton = createButton("Try Again", "retry");
        showView([message, retryButton], false);
    }

    // Load the JSON asynchronously while leaving the site's navigation available.
    async function loadSurvivalData() {
        explorer.setAttribute("aria-busy", "true");
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error("Could not load survival skills.");
            const data = validateData(await response.json());
            showView(createCategoriesView(data), false);
            return data;
        } catch {
            showError();
            return null;
        } finally {
            explorer.setAttribute("aria-busy", "false");
        }
    }

    // Keep loaded data local and handle only the Explorer's navigation buttons.
    async function initializeExplorer() {
        if (!explorer) return;
        let survivalData = await loadSurvivalData();

        // Select an existing category or skill without reloading explorer.html.
        async function handleExplorerClick(event) {
            const button = event.target.closest("button[data-action]");
            if (!button || !explorer.contains(button)) return;
            const action = button.dataset.action;
            if (action === "retry") {
                const loading = createElement("p", "Loading survival skills...");
                loading.setAttribute("role", "status");
                showView([loading], false);
                survivalData = await loadSurvivalData();
                return;
            }
            if (!survivalData) return;
            if (action === "categories") {
                showView(createCategoriesView(survivalData));
                return;
            }
            const category = survivalData.categories.find(item => item.id === button.dataset.categoryId);
            if (!category) return;
            if (action === "skills") showView(createSkillsView(category));
            if (action === "details") {
                const skill = category.skills.find(item => item.id === button.dataset.skillId);
                if (skill) showView(createDetailsView(category, skill));
            }
        }

        explorer.addEventListener("click", handleExplorerClick);
    }

    initializeExplorer();
}
