import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Result, Skeleton, message } from "antd";
import Header from "./Header";
import PokemonCard from "./PokemonCard";
import ComparisonNav from "./ComparisonNav";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import "./home-style.css";

const typesEndpoint = "https://pokeapi.co/api/v2/type";
const pokemonEndpoint = "https://pokeapi.co/api/v2/pokemon?limit=12";
const skeletonNumbers = Array(6).fill().map((_, idx) => idx+1)

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

  useEffect(() => {
    getPokemonList();
    getTypeList();
  }, []);

  const comparePokemonIDs = useMemo(() => {
    return comparePokemons.map((d) => d.id);
  }, [comparePokemons]);

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

  const handleTypeChange = useCallback((value) => {
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
  }, []);

  const handleResetClick = useCallback(() => {
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
  }, [selectedType, setIsFetching]);

  const handleSelectPokemon = useCallback(
    (pokemon) => {
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
    },
    [comparePokemons]
  );

  const cancelCompare = useCallback(() => {
    setIsCompareActive(false);
    setComparePokemons([]);
  }, []);

  return (
    <>
      <Header
        setIsCompareActive={setIsCompareActive}
        selectedType={selectedType}
        types={types}
        onHandleTypeChange={handleTypeChange}
        onHandleResetClick={handleResetClick}
      />
      <main>
        {pokemons.length > 0 ? (
          <>
            <div className="pokemon-list">
              {pokemons.map((pokemon, index) => (
                <PokemonCard
                  key={index}
                  pokemon={pokemon}
                  comparePokemons={comparePokemonIDs}
                  isCompareActive={isCompareActive}
                  onHandleSelectPokemon={handleSelectPokemon}
                />
              ))}
              {!isFiltering && isFetching && (
                <>
                  {skeletonNumbers
                    .map((numb) => (
                      <Skeleton
                        key={numb}
                        className="pokemon-skeleton"
                        active
                      />
                    ))}
                </>
              )}
            </div>
            {isCompareActive && comparePokemons.length > 0 && (
              <ComparisonNav
                comparePokemons={comparePokemons}
                onCancelCompare={cancelCompare}
              />
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
