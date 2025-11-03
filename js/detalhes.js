// Obtém o número do Pokémon da URL (ex: detalhes.html?numero=1)
const params = new URLSearchParams(window.location.search);
const numero = params.get("numero");

// === Função principal para desenhar o Pokémon ===
async function drawPokemon(id) {
    const pokemon = await getPokemon("pokemon/" + id);
    if (!pokemon) return;

    document.title = `Pokémon - ${capitalizeFirstLetter(pokemon.name)}`;

    // Navegação entre Pokémon
    document.getElementById("anterior").innerHTML = await getPokemonAnterior(pokemon.id);
    document.getElementById("proximo").innerHTML = await getPokemonProximo(pokemon.id);

    // Título com ID e nome
    document.querySelector("h1").innerHTML = `${pokemon.id
        .toString()
        .padStart(3, "0")} - ${capitalizeFirstLetter(pokemon.name)}`;

    // Descrição do Pokémon (em inglês)
    const species = await getPokemon("pokemon-species/" + pokemon.id);
    if (species && species.flavor_text_entries) {
        const description = species.flavor_text_entries.find(
            (entry) => entry.language.name === "en"
        );
        if (description) {
            document.getElementById("descrição").innerHTML =
                description.flavor_text.replace(/\f/g, " ");
        }
    }

    // Imagem e dados principais
    document.getElementById("imgPoke").innerHTML = carousel(pokemon.sprites);
    document.getElementById("altura").innerHTML = `${pokemon.height / 10} m`;
    document.getElementById("peso").innerHTML = `${pokemon.weight / 10} kg`;

    // Tipos do Pokémon
    const tipos = document.getElementById("tipos");
    tipos.innerHTML = "";
    pokemon.types.forEach((value) => {
        const name = getTipo(value.type.name);
        tipos.innerHTML += `<button class="btn btn-lg text-white" style="background-color:${getCor(value.type.name)}">${name}</button>`;
    });

    // Sons do Pokémon
    const sons = document.getElementById("sons");
    sons.innerHTML = '<span class="fw-bold mb-0 me-2">Sons:</span>';
    if (pokemon.cries?.latest) {
        sons.innerHTML += `
            <i class="bi bi-play-circle fs-1 me-3" 
                style="cursor:pointer"
                onclick="document.getElementById('latest').play()"></i>
            <audio id="latest" hidden>
                <source src="${pokemon.cries.latest}" type="audio/ogg">
            </audio>`;
    }

    // Gráfico de status
    const yValues = pokemon.stats.map((s) => s.base_stat);
    const xValues = ["HP", "Ataque", "Defesa", "Ataque Esp.", "Defesa Esp.", "Velocidade"];
    const barColors = ["#FE0000", "#EE7F30", "#F7D02C", "#F85687", "#77C755", "#678FEE"];

    document.querySelector("#chartReport").innerHTML = '<canvas id="myChart"></canvas>';

    new Chart("myChart", {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [
                {
                    backgroundColor: barColors,
                    data: yValues,
                },
            ],
        },
        options: {
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Status Base" },
            },
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
}

// === Função para Pokémon anterior ===
async function getPokemonAnterior(numero) {
    const anterior = await getPokemon("pokemon/" + (numero - 1));
    if (anterior)
        return `
        <button class='btn btn-outline-danger btn-lg' onclick='drawPokemon(${anterior.id})'>
            ${anterior.id.toString().padStart(3, "0")}<br>${capitalizeFirstLetter(anterior.name)}
        </button>`;
    else return `<span></span>`;
}

// === Função para Pokémon seguinte ===
async function getPokemonProximo(numero) {
    const proximo = await getPokemon("pokemon/" + (numero + 1));
    if (proximo)
        return `
        <button class='btn btn-outline-danger btn-lg' onclick='drawPokemon(${proximo.id})'>
            ${proximo.id.toString().padStart(3, "0")}<br>${capitalizeFirstLetter(proximo.name)}
        </button>`;
    else return `<span></span>`;
}

// === Pesquisa pelo campo de busca ===
async function search() {
    if (loading) return;
    const search = document.querySelector('input[type="search"]').value.trim();
    if (search === "") {
        drawPokemon(numero);
    } else {
        const pokemon = await searchPokemon();
        if (pokemon) drawPokemon(pokemon.id);
    }
}

// === Inicialização da página ===
document.addEventListener("DOMContentLoaded", async () => {
    await drawPokemon(numero);

    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
        search();
    });
});
