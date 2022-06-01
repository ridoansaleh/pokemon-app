import React, { useState, useEffect } from "react";
import { Card, Tag, Button, Select, Result } from "antd";
import useInfiniteScroll from "./hooks/useInfiniteScroll";
import "./App.css";
const { Meta } = Card;
const { Option } = Select;

const colors = ["#f50", "#2db7f5", "#87d068", "#108ee9"];
const typesEndpoint = "https://pokeapi.co/api/v2/type";
const pokemonEndpoint = "https://pokeapi.co/api/v2/pokemon?limit=25";

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [isFetching, setIsFetching] = useInfiniteScroll(getPokemonList);
  const [nextPokemonUrl, setNextPokemonUrl] = useState(pokemonEndpoint);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState();
  const [isFiltering, setIsFiltering] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPokemonList();
    getTypeList();
  }, []);

  function getTypeList() {
    fetch(typesEndpoint)
      .then((res) => res.json())
      .then((data) => {
        setTypes(data.results.map((d) => d.name));
      })
      .catch(console.log);
  }

  function getPokemonList() {
    if (isFiltering) return;
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
      .catch(console.log);
  }

  function handleChange(value) {
    setSelectedType(value);
    fetch(`${typesEndpoint}/${value}`)
      .then((res) => res.json())
      .then((data) => {
        let pokemonList = [];
        setIsFiltering(true);
        const pokemonPromises = data.pokemon.map((d) =>
          fetch(d.pokemon.url).then((res) => res.json())
        );
        Promise.allSettled(pokemonPromises).then((datas) => {
          pokemonList = datas.map((d) => d.value);
          setPokemons(pokemonList);
          setNotFound(pokemonList.length === 0);
        });
      })
      .catch(console.log);
  }

  function handleResetClick() {
    setSelectedType();
    fetch(pokemonEndpoint)
      .then((res) => res.json())
      .then((data) => {
        let pokemonList = [];
        const pokemonPromises = data.results.map((pokemon) =>
          fetch(pokemon.url).then((res) => res.json())
        );
        Promise.allSettled(pokemonPromises).then((datas) => {
          pokemonList = datas.map((d) => d.value);
          setTimeout(() => {
            setNotFound(false)
            setPokemons(pokemonList);
            setNextPokemonUrl(data.next);
            setIsFetching(false);
            setIsFiltering(false)
          }, 900);
        });
      })
      .catch(console.log);
  }

  return (
    <>
      <header>
        <Button type="primary" danger>
          Compare
        </Button>
        <div className="filter-group">
          <Select
            value={selectedType}
            placeholder="Filter by type"
            style={{ width: 150 }}
            onChange={handleChange}
          >
            {types.map((type, i) => (
              <Option key={i} value={type}>
                {type}
              </Option>
            ))}
          </Select>
          <Button id="reset-btn" danger onClick={handleResetClick}>
            Reset
          </Button>
        </div>
      </header>
      <main>
        {notFound ? (
          <Result
            status="404"
            title="Not Found"
            subTitle="Sorry, the Pokemon type you search does not exist."
            extra={
              <Button danger onClick={handleResetClick}>
                Reset
              </Button>
            }
          />
        ) : (
          <div className="pokemon-list">
            {pokemons.map((pokemon, index) => (
              <Card
                key={index}
                hoverable
                style={{ maxWidth: 250 }}
                cover={
                  <img alt={pokemon.name} src={pokemon.sprites.front_shiny} />
                }
              >
                <Meta
                  title={`#${pokemon.id} ${pokemon.name}`}
                  description={pokemon.types.map((d, idx) => (
                    <Tag
                      key={idx}
                      color={colors[Math.floor(Math.random() * 3)]}
                    >
                      {d.type.name}
                    </Tag>
                  ))}
                />
              </Card>
            ))}
            {!isFiltering && isFetching && "Fetching more pokemon..."}
          </div>
        )}
      </main>
    </>
  );
}

export default App;
