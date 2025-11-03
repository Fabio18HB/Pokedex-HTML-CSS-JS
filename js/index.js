// === Cria botões de tipo do Pokémon ===
function buttonTipo(tipos) {
  let buttons = "";
  tipos.forEach((value) => {
    let name = getTipo(value.type.name);
    buttons += `<button class="btn btn-${name} text-white">${name}</button>`;
  });
  return buttons;
}

// === Carrega Pokémons em blocos ===
async function loadPokemons() {
  if (loading) return;
  loading = true;

  const div = document.getElementById("pokemons");

  for (let i = topo - 39; i <= topo; i++) {
    const pokemon = await getPokemon("pokemon/" + i);

    div.innerHTML += `
      <div class="col">
        <a href="detalhes.html?numero=${pokemon.id}" class="text-decoration-none">
          <div class="card" style="background-color:${getCor(pokemon.types[0].type.name)}">
            <img src="${pokemon.sprites.other["official-artwork"].front_default}" 
                 alt="${pokemon.name}" 
                 class="card-img-top">
            <div class="card-body text-white">
              <h5 class="card-text mb-1">Nº ${pokemon.id.toString().padStart(3, "0")}</h5>
              <h3 class="card-title">${capitalizeFirstLetter(pokemon.name)}</h3>
              <div class="d-flex gap-2 my-2">
                ${buttonTipo(Array.from(pokemon.types))}
              </div>
            </div>
          </div>
        </a>       
      </div>`;
  }

  loading = false;
  filtered = false;
}

// === Busca Pokémon por nome ou número ===
async function search() {
  if (loading) return;

  const div = document.getElementById("pokemons");
  const searchValue = document.querySelector('input[type="search"]').value.trim();

  if (searchValue === "") {
    initializePage();
    return;
  }

  loading = true;

  try {
    const pokemon = await searchPokemon(searchValue.toLowerCase());

    div.innerHTML = `
      <div class="col">
        <a href="detalhes.html?numero=${pokemon.id}" class="text-decoration-none">
          <div class="card" style="background-color:${getCor(pokemon.types[0].type.name)}">
            <div id="imgPoke" class="card-img-top">
              ${carousel(pokemon.sprites)}
            </div>
            <div class="card-body text-white">
              <h5 class="card-text mb-1">Nº ${pokemon.id.toString().padStart(3, "0")}</h5>
              <h3 class="card-title">${capitalizeFirstLetter(pokemon.name)}</h3>
              <div class="d-flex gap-2 my-2">
                ${buttonTipo(Array.from(pokemon.types))}
              </div>
            </div>
          </div>
        </a>
      </div>`;

    filtered = true;
  } catch (error) {
    div.innerHTML = `<p class="text-center text-danger fs-4">Pokémon não encontrado!</p>`;
    filtered = true;
  } finally {
    loading = false;
  }
}

// === Inicializa a página com os primeiros 40 Pokémons ===
async function initializePage() {
  topo = 40;
  const div = document.getElementById("pokemons");
  div.innerHTML = "";
  filtered = false; // Corrigido (antes estava "filtered - false")
  await loadPokemons();
}

// === Quando o documento estiver carregado ===
document.addEventListener("DOMContentLoaded", async () => {
  initializePage();

  document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    search();
  });
});

// === Scroll infinito: carrega mais Pokémons ===
window.onscroll = () => {
  if (
    window.innerHeight + window.scrollY >= document.body.scrollHeight - 500 &&
    !loading &&
    !filtered
  ) {
    topo += 40;
    loadPokemons();
  }
};
