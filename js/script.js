/* ===========================
    DATA – Zdrojové seznamy her
=========================== */

// Rozšířené seznamy nominantů (16 her = 4 kola turnaje)
const GAMES_2025 = [
    "Clair Obscur: Expedition 33","Death Stranding 2: On the Beach",
    "Donkey Kong Bananza","Hades II",
    "Hollow Knight: Silksong","Kingdom Come: Deliverance II",
    "Dispatch","Ghost of Yōtei",
    "Split Fiction","Battlefield 6",
    "Silent Hill f","Indiana Jones and the Great Circle",
    "Elden Ring: Nightreign","Doom: The Dark Ages",
    "The Outer Worlds 2","Monster Hunter Wilds"
];

const GAMES_2009_OPTIMIZED = [
    "Uncharted 2: Among Thieves", "Red Dead Redemption",
    "The Elder Scrolls V: Skyrim", "The Walking Dead",
    "Grand Theft Auto V", "Dragon Age: Inquisition",
    "The Witcher 3: Wild Hunt", "Overwatch",
    "The Legend of Zelda: Breath of the Wild", "God of War",
    "Sekiro: Shadows Die Twice", "The Last of Us Part II",
    "It Takes Two", "Elden Ring",
    "Baldur’s Gate 3", "Astro Bot" 
];

/* 💡 MAPOVÁNÍ IKON (PŘEDPOKLAD: Obrázky jsou ve složce 'ikony/') */
const gameIcons = {
    // Hry z roku 2025
    "Clair Obscur: Expedition 33": "ikony/clair_obscur.png",
    "Death Stranding 2: On the Beach": "ikony/death_stranding_2.png",
    "Donkey Kong Bananza": "ikony/donkey_kong.png",
    "Hades II": "ikony/hades_2.png",
    "Hollow Knight: Silksong": "ikony/silksong.png",
    "Kingdom Come: Deliverance II": "ikony/kcd_2.png",
    "Dispatch": "ikony/dispatch.png",
    "Ghost of Yōtei": "ikony/ghost_yotei.png",
    "Split Fiction": "ikony/split_fiction.png",
    "Battlefield 6": "ikony/battlefield_6.png",
    "Silent Hill f": "ikony/silent_hill_f.png",
    "Indiana Jones and the Great Circle": "ikony/indiana_jones.png",
    "Elden Ring: Nightreign": "ikony/elden_ring_nr.png",
    "Doom: The Dark Ages": "ikony/doom_dark_ages.png",
    "The Outer Worlds 2": "ikony/outer_worlds_2.png",
    "Monster Hunter Wilds": "ikony/monster_hunter_wilds.png",

    // Nejlepší hra od 2009
    "Uncharted 2: Among Thieves": "ikony/uncharted_2.png",
    "Red Dead Redemption": "ikony/rdr.png",
    "The Elder Scrolls V: Skyrim": "ikony/skyrim.png",
    "The Walking Dead": "ikony/the_walking_dead.png",
    "Grand Theft Auto V": "ikony/gta_5.png",
    "Dragon Age: Inquisition": "ikony/dragon_age_inquisition.png",
    "The Witcher 3: Wild Hunt": "ikony/witcher_3.png",
    "Overwatch": "ikony/overwatch.png",
    "The Legend of Zelda: Breath of the Wild": "ikony/botw.png",
    "God of War": "ikony/god_of_war.png",
    "Sekiro: Shadows Die Twice": "ikony/sekiro.png",
    "The Last of Us Part II": "ikony/tlou_2.png",
    "It Takes Two": "ikony/it_takes_two.png",
    "Elden Ring": "ikony/elden_ring.png",
    "Baldur’s Gate 3": "ikony/baldurs_gate_3.png",
    "Astro Bot": "ikony/astro_bot.png",

    // Zástupný obrázek
    "DEFAULT_ICON": "ikony/default.png"
};

function getGameIcon(gameName) {
    return gameIcons[gameName] || gameIcons["DEFAULT_ICON"];
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    })[c]);
}


/* ===========================
    TURNAJ – Hlavní logika
=========================== */

let games = [];
let round = [];
let currentRoundMatches = [];
let currentMatchIndex = 0;
let roundNumber = 0;
let currentCategory = '';
let totalRounds = 0;

function shuffleArray(a){
    for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
    }
}

// Funkce pro přesměrování (pro 5 stránek)
function navigateTo(url) {
    window.location.href = url;
}

/* KATEGORIE - Upraveno pro SKRÝVÁNÍ OVLÁDACÍCH PRVKŮ */
function startTournament(type) {
    
    // 1. Skrýt tlačítka pro výběr kategorie
    const categoryDiv = document.getElementById("category-selection");
    if (categoryDiv) {
        categoryDiv.style.display = "none";
    }
    
    // 2. Nastavení her a kategorií
    if (type === "2025") {
        games = [...GAMES_2025];
        currentCategory = "Hra roku 2025";
    } else if (type === "2009") {
        games = [...GAMES_2009_OPTIMIZED];
        currentCategory = "Klasiky";
    }

    if (games.length === 0) return;

    shuffleArray(games);

    // Doplňování na sudý počet (BYE) pro možnost bracketu
    if (games.length % 2 === 1) games.push("BYE");

    round = [...games];
    totalRounds = Math.ceil(Math.log2(games.length)); 

    // Reset kola a start
    roundNumber = 0;
    prepareRound();
}


/* TURNAJ */

function prepareRound() {
    const area = document.getElementById("tournament-area");
    if (!area) return;

    currentRoundMatches = [];
    currentMatchIndex = 0;

    if (round.length === 1) {
        showWinner(round[0], currentCategory);
        return;
    }

    // Zpracování posledního "BYE" v kole (pokud je)
    const byeIndex = round.indexOf("BYE");
    if (byeIndex !== -1 && round.length === 2) {
         const remainingGames = round.filter(g => g !== "BYE");
         showWinner(remainingGames[0], currentCategory);
         return;
    }


    for (let i = 0; i < round.length; i += 2) {
        currentRoundMatches.push({
            game1: round[i],
            game2: round[i + 1],
            winner: null
        });
    }

    roundNumber++;
    drawMatch();
}

function drawMatch() {
    const area = document.getElementById("tournament-area");
    area.innerHTML = "";

    const m = currentRoundMatches[currentMatchIndex];

    let div = document.createElement("div");
    div.className = "match";

    // --- Zpracování BYE - Automatický postup ---
    if (m.game1 === "BYE" || m.game2 === "BYE") {
        const winner = m.game1 === "BYE" ? m.game2 : m.game1;
        div.innerHTML = `<p><strong>${winner}</strong> postupuje dál (BYE)</p>`;
        area.appendChild(div);
        setTimeout(() => selectWinner(winner), 500);
        return;
    }

    // --- Zobrazení standardního souboje ---
    let title = document.createElement("p");
    let roundText = round.length === 2 ? "Finále" : `Kolo ${roundNumber} | Souboj ${currentMatchIndex + 1} z ${currentRoundMatches.length}`;
    title.textContent = roundText;
    area.appendChild(title);

    // Funkce pro vytvoření tlačítka s ikonou
    const createGameButton = (gameName) => {
        let btn = document.createElement("button");
        btn.onclick = () => selectWinner(gameName);

        let img = document.createElement("img");
        img.src = getGameIcon(gameName);
        img.alt = `Ikona hry ${escapeHtml(gameName)}`;
        img.style.width = "100px";
        img.style.height = "100px";

        let nameSpan = document.createElement("span");
        nameSpan.textContent = gameName;
        nameSpan.style.fontWeight = "bold";

        btn.appendChild(img);
        btn.appendChild(nameSpan);
        return btn;
    };

    div.appendChild(createGameButton(m.game1));
    div.appendChild(createGameButton(m.game2));
    area.appendChild(div);
}

function selectWinner(g) {
    currentRoundMatches[currentMatchIndex].winner = g;
    currentMatchIndex++;

    if (currentMatchIndex < currentRoundMatches.length) {
        drawMatch();
    } else {
        nextRound();
    }
}

function nextRound() {
    round = currentRoundMatches.map(m => m.winner);
    if (round.length % 2 === 1) round.push("BYE");
    prepareRound();
}

/* ===========================
    VÍTĚZ – Zobrazení a Uložení
=========================== */

function showWinner(w, category) {
    const area = document.getElementById("tournament-area");
    area.innerHTML = "";

    // Zobrazení ikony vítěze
    let winnerIcon = document.createElement("img");
    winnerIcon.src = getGameIcon(w);
    winnerIcon.alt = `Vítězná ikona hry ${w}`;
    winnerIcon.className = "winner-icon";
    area.appendChild(winnerIcon);

    // Zobrazení jména vítěze
    area.innerHTML += `<h2>🏆 Vítěz: <strong>${escapeHtml(w)}</strong></h2>`;

    // Tlačítko pro uložení
    let saveBtn = document.createElement("button");
    saveBtn.textContent = "💾 Uložit vítěze";
    saveBtn.onclick = () => saveWinner(w, category);
    saveBtn.id = "save-winner-btn";
    area.appendChild(saveBtn);

    // Tlačítko pro restart (vrací na stránku s kategoriemi, čímž znovu zobrazí výběr)
    let restartBtn = document.createElement("button");
    restartBtn.textContent = "Restartovat";
    restartBtn.onclick = () => navigateTo('tournament.html');
    area.appendChild(restartBtn);
    
    // Tlačítko Zpět na Domů
    let homeBtn = document.createElement("button");
    homeBtn.textContent = "Zpět na Domů";
    homeBtn.onclick = () => navigateTo('index.html');
    area.appendChild(homeBtn);
}


function saveWinner(gameName, categoryTitle) {
    let winners = JSON.parse(localStorage.getItem('tournamentWinners') || "[]");
    const now = new Date().toLocaleString('cs-CZ');

    const newWinner = {
        name: gameName,
        category: categoryTitle,
        date: now
    };

    winners.push(newWinner);
    localStorage.setItem('tournamentWinners', JSON.stringify(winners));

    alert(`Vítěz "${gameName}" v kategorii "${categoryTitle}" byl úspěšně uložen!`);
    
    const saveBtn = document.getElementById("save-winner-btn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Uloženo!";
    }
}


/* ===========================
    NOMINANTI – Zobrazení
=========================== */

function loadNomineesToPage() {
    const div = document.getElementById("nominee-list");
    if (!div) return;

    // Funkce pro vykreslení seznamu s ikonami
    const renderList = (title, gameArray) => {
        let html = `<h3>${title} (${gameArray.length} her)</h3>`;
        html += '<ul class="nominee-grid">';
        
        gameArray.forEach(game => {
            const iconSrc = getGameIcon(game);
            html += `
                <li class="nominee-item">
                    <img src="${iconSrc}" alt="Ikona hry ${escapeHtml(game)}" class="nominee-icon" loading="lazy">
                    <span>${escapeHtml(game)}</span>
                </li>
            `;
        });
        html += '</ul>';
        return html;
    };

    // Vykreslení obou kategorií
    div.innerHTML = renderList("Hra roku 2025", GAMES_2025);
    div.innerHTML += renderList("Klasiky", GAMES_2009_OPTIMIZED);
}


/* ===========================
    VÍTĚZOVÉ – Zobrazení
=========================== */

function loadWinnersAndRender() {
    const box = document.getElementById("winner-list");
    if (!box) return;

    let winners = JSON.parse(localStorage.getItem('tournamentWinners') || "[]");
    
    if (winners.length === 0) {
        box.innerHTML = "<p>Zatím žádní vítězové.</p>";
        return;
    }

    // Skupinové zobrazení podle kategorie
    const groupedWinners = winners.reduce((acc, winner) => {
        if (!acc[winner.category]) {
            acc[winner.category] = [];
        }
        acc[winner.category].push(winner);
        return acc;
    }, {});
    
    let html = '';
    
    for (const category in groupedWinners) {
        html += `<h4>${escapeHtml(category)}</h4><ul>`;
        groupedWinners[category].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        groupedWinners[category].forEach(winner => {
            html += `<li><strong>${escapeHtml(winner.name)}</strong> (uloženo: ${winner.date})</li>`;
        });
        html += '</ul>';
    }

    box.innerHTML = html;
}

function clearWinners() {
    if (confirm("Opravdu chcete vymazat všechny uložené vítěze? Tato akce je nevratná.")) {
        localStorage.removeItem('tournamentWinners');
        loadWinnersAndRender();
        alert("Všichni vítězové byli vymazáni.");
    }

}
