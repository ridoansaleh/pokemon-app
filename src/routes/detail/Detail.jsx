import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Tag, Button, Tabs, Progress, Spin } from "antd";
import "./detail-style.css";
const { TabPane } = Tabs;

const colors = ["#f50", "#2db7f5", "#87d068", "#108ee9"];
const pokemonEndpoint = "https://pokeapi.co/api/v2/pokemon";
const speciesEndpoint = "https://pokeapi.co/api/v2/pokemon-species";

function Detail() {
  const [isFetching, setIsFetching] = useState(true);
  const [pokemonData, setPokemonData] = useState();
  const location = useLocation();

  useEffect(() => {
    async function getPokemonDetail() {
      const searchParams = new URLSearchParams(location.search);
      let pokemon = searchParams.get("pokemon");
      if (pokemon) {
        const pokemonResp = await fetch(`${pokemonEndpoint}/${pokemon}`).then(
          (res) => res.json()
        );
        setPokemonData(pokemonResp);
      }
    }
    getPokemonDetail();
  }, []);

  useEffect(() => {
    if (!pokemonData?.id) return;
    async function getPokemonSpecies() {
      const speciesResp = await fetch(
        `${speciesEndpoint}/${pokemonData.id}`
      ).then((res) => res.json());
      setPokemonData((prevData) => ({
        ...prevData,
        ...speciesResp,
      }));
      setIsFetching(false);
    }
    getPokemonSpecies();
  }, [pokemonData?.id]);

  return (
    <>
      <header>
        <Link to="/">
          <Button type="primary" ghost>
            Back
          </Button>
        </Link>
      </header>
      <main className="detail-content">
        {isFetching ? (
          <Spin style={{ position: 'absolute', left: '45%', top: '40%', zIndex: 100 }} size="large" tip="Loading..." />
        ) : (
          <>
            <div className="detail-image">
              <img
                className="pokemon-image"
                alt={pokemonData.name}
                src={pokemonData.sprites.other.dream_world.front_default}
              />
              <div className="detail-props">
                <h1>#{pokemonData.id}</h1>
                <h3>{pokemonData.name}</h3>
                {pokemonData.types.map((d, idx) => (
                  <Tag key={idx} color={colors[Math.floor(Math.random() * 3)]}>
                    {d.type.name}
                  </Tag>
                ))}
              </div>
            </div>
            <Tabs tabPosition="left">
              <TabPane tab="About" key="1">
                <p>
                  <b>Height</b>: {pokemonData.height}
                </p>
                <p>
                  <b>Weight</b>: {pokemonData.weight}
                </p>
                <p>
                  <b>Color</b>: {pokemonData.color?.name}
                </p>
                <p>
                  <b>Habitat</b>: {pokemonData.habitat?.name}
                </p>
                <p>
                  <b>Species</b>: {pokemonData.species?.name}
                </p>
              </TabPane>
              <TabPane tab="Base Stats" key="2">
                {pokemonData.stats.map((d, idx) => (
                  <div key={idx}>
                    <span>{d.stat.name}</span>
                    <Progress percent={d.base_stat} showInfo={false} />
                  </div>
                ))}
              </TabPane>
              <TabPane tab="Abilities" key="3">
                <p>
                  {pokemonData.abilities.map((d) => d.ability.name).join(", ")}
                </p>
              </TabPane>
            </Tabs>
          </>
        )}
      </main>
    </>
  );
}

export default Detail;
