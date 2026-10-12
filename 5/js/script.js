function getData() {
    fetch("js/boardingData.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            const button = document.getElementById("changeThemeBtn");

            button.addEventListener("click", function() {
                changeContent(data);
            });
        })
        .catch(function(error) {
            console.log("Error loading JSON:", error);
        });
}

function changeContent(data) {

    document.title = data.title;

    document.getElementById("styleName").textContent = data.header;

    document.getElementById("heroTitle").textContent =
        data.hero.headline;

    document.getElementById("heroDesc").textContent =
        data.hero.description;

    document.getElementById("heroSection").style.setProperty(
        "--hero-img",
        "url('" + data.hero.image + "')"
    );

    document.getElementById("sec1Title").textContent =
        data.sections.overview.title;

    document.getElementById("sec1Subtitle").textContent =
        data.sections.overview.subtitle;

    const overviewCards =
        document.querySelectorAll("#sec1Grid .card");

    overviewCards.forEach(function(card, index) {
        card.querySelector("h3").textContent =
            data.sections.overview.cards[index].title;

        card.querySelector("p").textContent =
            data.sections.overview.cards[index].description;
    });

    document.getElementById("sec2Title").textContent =
        data.sections.equipment.title;

    document.getElementById("sec2Subtitle").textContent =
        data.sections.equipment.subtitle;

    const equipmentCards =
        document.querySelectorAll("#sec2Grid .card");

    equipmentCards.forEach(function(card, index) {
        card.querySelector("h3").textContent =
            data.sections.equipment.cards[index].title;

        card.querySelector("p").textContent =
            data.sections.equipment.cards[index].description;
    });
}

getData();