import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Button,
  Select,
  Result,
  Checkbox,
  Skeleton,
  message,
} from "antd";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import "./home-style.css";
const { Meta } = Card;
const { Option } = Select;

const colors = ["#f50", "#2db7f5", "#87d068", "#108ee9"];
const typesEndpoint = "https://pokeapi.co/api/v2/type";
const pokemonEndpoint = "https://pokeapi.co/api/v2/pokemon?limit=12";

function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [isFetching, setIsFetching] = useInfiniteScroll(getPokemonList);
  const [nextPokemonUrl, setNextPokemonUrl] = useState(pokemonEndpoint);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState();
  const [isFiltering, setIsFiltering] = useState(false);
  const [noData, setNoData] = useState(false);
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
        const pokemonPromises = data.results.map((pokemon) =>
          fetch(pokemon.url).then((res) => res.json())
        );
        Promise.allSettled(pokemonPromises).then((datas) => {
          const newPokemons = datas.map((d) => d.value);
          setTimeout(() => {
            setPokemons((prevPokemons) => [...prevPokemons, ...newPokemons]);
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
        setIsFiltering(true);
        const pokemonPromises = data.pokemon.map((d) =>
          fetch(d.pokemon.url).then((res) => res.json())
        );
        Promise.allSettled(pokemonPromises).then((datas) => {
          const pokemonList = datas.map((d) => d.value);
          setPokemons(pokemonList);
          setNoData(pokemonList.length === 0);
        });
      })
      .catch(console.log);
  }

  function handleResetClick() {
    if (!selectedType) return;
    setSelectedType();
    fetch(pokemonEndpoint)
      .then((res) => res.json())
      .then((data) => {
        const pokemonPromises = data.results.map((pokemon) =>
          fetch(pokemon.url).then((res) => res.json())
        );
        Promise.allSettled(pokemonPromises).then((datas) => {
          const pokemonList = datas.map((d) => d.value);
          setTimeout(() => {
            setNoData(false);
            setPokemons(pokemonList);
            setNextPokemonUrl(data.next);
            setIsFetching(false);
            setIsFiltering(false);
          }, 1500);
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
        <Button type="primary" danger onClick={() => setIsCompareActive(true)}>
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
        {pokemons.length > 0 ? (
          <>
            <div className="pokemon-list" style={{ position: 'relative' }}>
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
                      style={{ width: 200, height: 200, marginTop: 15 }}
                      src={pokemon.sprites.other.dream_world.front_default}
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
              {!isFiltering && isFetching && (
                <>
                  {Array(6)
                    .fill()
                    .map((_, idx) => (
                      <Skeleton
                        key={idx}
                        style={{
                          border: "1px solid #f0f0f0",
                          height: 300,
                          padding: 10,
                        }}
                        active
                      />
                    ))}
                </>
              )}
            </div>
            {isCompareActive && comparePokemons.length > 0 && (
              <div className="comparison-nav">
                <div>
                  {comparePokemons.map((pokemon, index) => (
                    <img
                      className="compare-thumbnail"
                      key={index}
                      alt={pokemon.name}
                      src={pokemon.sprites.front_default}
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
        ) : (
          <>
            {noData ? (
              <Result
                status="404"
                title="No Data"
                subTitle="Sorry, the Pokemon type you filter doesn't has data."
                extra={
                  <Button danger onClick={handleResetClick}>
                    Reset
                  </Button>
                }
              />
            ) : null}
          </>
        )}
      </main>
    </>
  );
}

export default Home;
