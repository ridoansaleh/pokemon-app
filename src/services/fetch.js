const fetchData = (url) => {
  return fetch(url).then((res) => {
    if (res.ok) return res.json();
    throw res;
  });
};

export const getPokemonList = async (endpoint) => {
  const result = await new Promise((resolve, reject) => {
    fetchData(endpoint)
      .then((data) => {
        const pokemonPromises = data.results.map((d) => fetchData(d.url));
        Promise.allSettled(pokemonPromises).then((results) => {
          const pokemonList = results.map((d) => d.value);
          resolve({ error: null, next: data.next, data: pokemonList });
        });
      })
      .catch((error) => reject({ error, next: "", data: [] }));
  });
  return result;
};

export const getPokemonListByType = async (endpoint) => {
  const result = await new Promise((resolve, reject) => {
    fetchData(endpoint)
      .then((data) => {
        const pokemonPromises = data.pokemon.map((p) =>
          fetchData(p.pokemon.url)
        );
        Promise.allSettled(pokemonPromises).then((results) => {
          const pokemonList = results.map((d) => d.value);
          resolve({ error: null, data: pokemonList });
        });
      })
      .catch((error) => reject({ error, data: [] }));
  });
  return result;
};

export const getPokemonTypes = async (endpoint) => {
  const result = await new Promise((resolve, reject) => {
    fetchData(endpoint)
      .then((data) => {
        const pokemonTypes = data.results.map((d) => d.name);
        resolve({ error: null, data: pokemonTypes });
      })
      .catch((error) => reject({ error, data: [] }));
  });
  return result;
};
