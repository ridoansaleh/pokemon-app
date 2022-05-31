import React, { useState, useEffect } from "react";
import { Card, Tag } from "antd";
import useInfiniteScroll from "./hooks/useInfiniteScroll";
import "./App.css";
const { Meta } = Card;

const colors = ["#f50", "#2db7f5", "#87d068", "#108ee9"];

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [isFetching, setIsFetching] = useInfiniteScroll(getPokemonList);
  const [nextPokemonUrl, setNextPokemonUrl] = useState(
    "https://pokeapi.co/api/v2/pokemon?limit=25"
  );

  useEffect(() => {
    getPokemonList();
  }, []);

  function getPokemonList() {
    fetch(nextPokemonUrl)
      .then((res) => res.json())
      .then((data) => {
        let pokemonList = [];
        const pokemonPromises = data.results.map((pokemon) =>
          fetch(pokemon.url).then((res) => res.json())
        );
        Promise.allSettled(pokemonPromises).then((datas) => {
          pokemonList = datas.map((d) => d.value);
          setTimeout(() => {
            setPokemons((prevPokemons) => [...prevPokemons, ...pokemonList]);
            setNextPokemonUrl(data.next);
            setIsFetching(false);
          }, 900);
        });
      })
      .catch((err) => console.log(err));
  }

  return (
    <>
      <header>
        <h3>Pokemon App</h3>
      </header>
      <main style={{ overflow: "auto" }}>
        <div className="pokemon-list">
          {pokemons.map((pokemon, index) => (
            <Card
              key={index}
              hoverable
              cover={
                <img alt={pokemon.name} src={pokemon.sprites.front_shiny} />
              }
            >
              <Meta
                title={`#${pokemon.id} ${pokemon.name}`}
                description={pokemon.types.map((d, idx) => (
                  <Tag key={idx} color={colors[Math.floor(Math.random() * 3)]}>
                    {d.type.name}
                  </Tag>
                ))}
              />
            </Card>
          ))}
          {isFetching && "Fetching more pokemon..."}
        </div>
      </main>
    </>
  );
}

export default App;
