import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Tag, Button, Select, Result, Checkbox, message } from "antd";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { padNumber } from "../utils";
import "./Home.css";
const { Meta } = Card;
const { Option } = Select;

const colors = ["#f50", "#2db7f5", "#87d068", "#108ee9"];
const typesEndpoint = "https://pokeapi.co/api/v2/type";
const pokemonEndpoint = "https://pokeapi.co/api/v2/pokemon?limit=25";

function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [isFetching, setIsFetching] = useInfiniteScroll(getPokemonList);
  const [nextPokemonUrl, setNextPokemonUrl] = useState(pokemonEndpoint);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState();
  const [isFiltering, setIsFiltering] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [comparePokemons, setComparePokemons] = useState([]);
  const [isCompareActive, setIsCompareActive] = useState(false);
  const navigate = useNavigate();

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

  function handleTypeChange(value) {
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
    if (!selectedType) return
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
            setNotFound(false);
            setPokemons(pokemonList);
            setNextPokemonUrl(data.next);
            setIsFetching(false);
            setIsFiltering(false);
          }, 900);
        });
      })
      .catch(console.log);
  }

  function handleSelectPokemon(pokemon) {
    const foundPokemon = comparePokemons.find((p) => p.id === pokemon.id);
    if (foundPokemon) {
      setComparePokemons(comparePokemons.filter((p) => p.id !== pokemon.id));
      return;
    }
    if (comparePokemons.length < 2) {
      setComparePokemons((prevData) => [...prevData, pokemon]);
    } else {
      message.info("Only able to compare 2 pokemon");
    }
  }

  function cancelCompare() {
    setIsCompareActive(false);
    setComparePokemons([]);
  }

  return (
    <>
      <header>
        <Button
          type="primary"
          danger
          onClick={() => setIsCompareActive((prevData) => !prevData)}
        >
          Compare
        </Button>
        <div className="filter-group">
          <Select
            value={selectedType}
            placeholder="Filter by type"
            style={{ width: 150 }}
            onChange={handleTypeChange}
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
          <>
            <div className="pokemon-list">
              {pokemons.map((pokemon, index) => (
                <Card
                  key={index}
                  hoverable
                  className={`pokemon-card ${
                    comparePokemons.find((d) => d.id === pokemon.id)
                      ? "pokemon-card-selected"
                      : ""
                  }`}
                  onClick={() => navigate(`detail?pokemon=${pokemon.name}`)}
                  cover={
                    <img
                      alt={pokemon.name}
                      style={{ width: 200 }}
                      src={`https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${padNumber(
                        pokemon.id
                      )}.png`}
                    />
                  }
                >
                  {isCompareActive && (
                    <Checkbox
                      checked={comparePokemons.find((d) => d.id === pokemon.id)}
                      className="checkbox"
                      onChange={() => handleSelectPokemon(pokemon)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
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
            {isCompareActive && comparePokemons.length > 0 && (
              <div className="comparison-nav">
                <div>
                  {comparePokemons.map((pokemon, index) => (
                    <img
                      className="compare-thumbnail"
                      key={index}
                      alt={pokemon.name}
                      src={`https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${padNumber(
                        pokemon.id
                      )}.png`}
                    />
                  ))}
                </div>
                {comparePokemons.length === 2 ? (
                  <Link
                    to={`comparison/?pokedex=${comparePokemons[0].name},${comparePokemons[1].name}`}
                  >
                    <Button type="primary" danger>
                      Compare
                    </Button>
                  </Link>
                ) : (
                  <Button type="primary" ghost onClick={cancelCompare}>
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default Home;
