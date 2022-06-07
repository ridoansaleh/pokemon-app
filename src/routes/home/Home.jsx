import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Result, Skeleton, message } from "antd";
import Header from "./Header";
import PokemonCard from "./PokemonCard";
import ComparisonNav from "./ComparisonNav";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import "./home-style.css";
import { getPokemonList, getPokemonListByType, getPokemonTypes } from "../../services/fetch";

const typesEndpoint = "https://pokeapi.co/api/v2/type";
const pokemonEndpoint = "https://pokeapi.co/api/v2/pokemon?limit=12";
const skeletonNumbers = Array(6)
  .fill()
  .map((_, idx) => idx + 1);

function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [isFetching, setIsFetching] = useInfiniteScroll(getPokemons);
  const [nextPokemonUrl, setNextPokemonUrl] = useState(pokemonEndpoint);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState();
  const [isFiltering, setIsFiltering] = useState(false);
  const [noData, setNoData] = useState(false);
  const [comparePokemons, setComparePokemons] = useState([]);
  const [isCompareActive, setIsCompareActive] = useState(false);

  useEffect(() => {
    getPokemons();
  }, []);

  const comparePokemonIDs = useMemo(() => {
    return comparePokemons.map((d) => d.id);
  }, [comparePokemons]);

  async function getPokemons() {
    if (isFiltering) return;
    const { data, next } = await getPokemonList(nextPokemonUrl);
    const timeout = nextPokemonUrl.includes("offset") ? 900 : 0;
    setTimeout(() => {
      setPokemons((prevPokemons) => [...prevPokemons, ...data]);
      setNextPokemonUrl(next);
      setIsFetching(false);
    }, timeout);
  }

  const handleTypeChange = useCallback(async (value) => {
    setSelectedType(value);
    const { data, error } = await getPokemonListByType(
      `${typesEndpoint}/${value}`
    );
    setIsFiltering(true);
    if (error) {
      setIsFiltering(false);
    } else {
      setPokemons(data);
      setNoData(data.length === 0);
    }
  }, []);

  const handleResetClick = useCallback(async () => {
    if (!selectedType) return;
    const { data, next } = await getPokemonList(pokemonEndpoint);
    setSelectedType();
    setNoData(data.length === 0);
    setPokemons(data);
    setNextPokemonUrl(next);
    setIsFetching(false);
    setIsFiltering(false);
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

  const handleSelectFocus = useCallback(async() => {
    if (types.length === 0) {
      const { data } = await getPokemonTypes(typesEndpoint)
      setTypes(data);
    }
  }, [types]);

  return (
    <>
      <Header
        setIsCompareActive={setIsCompareActive}
        selectedType={selectedType}
        types={types}
        onHandleTypeChange={handleTypeChange}
        onHandleResetClick={handleResetClick}
        onHandleSelectFocus={handleSelectFocus}
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
                  {skeletonNumbers.map((numb) => (
                    <Skeleton key={numb} className="pokemon-skeleton" active />
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
