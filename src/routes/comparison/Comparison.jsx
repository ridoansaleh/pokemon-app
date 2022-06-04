import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Tag,
  Button,
  Collapse,
  Row,
  Col,
  Image,
  Progress,
  Spin
} from "antd";
import "./comparison-style.css";
const { Panel } = Collapse;

const colors = ["#f50", "#2db7f5"];
const pokemonDetailEndpoint = "https://pokeapi.co/api/v2/pokemon";

function Comparison() {
  const [pokemonA, setPokemonA] = useState();
  const [pokemonB, setPokemonB] = useState();
  const [isFetching, setIsFetching] = useState(true);
  const { search } = useLocation();

  useEffect(() => {
    async function getPokemonDetails() {
      const searchParams = new URLSearchParams(search);
      let pokedexs = searchParams.get("pokedex");
      pokedexs = pokedexs ? pokedexs.split(",") : [];
      if (pokedexs.length === 2) {
        const pokemon1 = await fetch(
          `${pokemonDetailEndpoint}/${pokedexs[0]}`
        ).then((res) => res.json());
        const pokemon2 = await fetch(
          `${pokemonDetailEndpoint}/${pokedexs[1]}`
        ).then((res) => res.json());
        setPokemonA(pokemon1);
        setPokemonB(pokemon2);
        setIsFetching(false);
      }
    }
    getPokemonDetails();
  }, []);

  return (
    <>
      <header>
        <Link to="/">
          <Button type="primary" ghost>
            Back
          </Button>
        </Link>
      </header>
      <main className="comparison-content">
        {isFetching ? (
          <Spin style={{ position: 'absolute', left: '55%', top: '40%', zIndex: 100 }} size="large" tip="Loading..." />
        ) : (
          <>
            <Row style={{ marginBottom: "25px" }}>
              <Col
                span={12}
                className="comparison-col"
              >
                <Image
                  className="comparison-image"
                  src={pokemonA.sprites.other.dream_world.front_default}
                />
                <h5 style={{ fontSize: "18px" }}>{pokemonA.name}</h5>
                <div>
                  {pokemonA.types.map((data, idx) => (
                    <Tag key={idx} color={colors[idx]}>
                      {data.type.name}
                    </Tag>
                  ))}
                </div>
              </Col>
              <Col
                span={12}
                className="comparison-col"
              >
                <Image
                  className="comparison-image"
                  src={pokemonB.sprites.other.dream_world.front_default}
                />
                <h5 style={{ fontSize: "18px" }}>{pokemonB.name}</h5>
                <div>
                  {pokemonB.types.map((data, idx) => (
                    <Tag key={idx} color={colors[idx]}>
                      {data.type.name}
                    </Tag>
                  ))}
                </div>
              </Col>
            </Row>
            <Collapse defaultActiveKey={["1", "2", "3"]}>
              <Panel header="Basic" key="1">
                <Row>
                  <Col span={12}>
                    <p>height: {pokemonA.height}</p>
                    <p>weight: {pokemonA.weight}</p>
                  </Col>
                  <Col span={12}>
                    <p>height: {pokemonB.height}</p>
                    <p>weight: {pokemonB.weight}</p>
                  </Col>
                </Row>
              </Panel>
              <Panel header="Abilities" key="2">
                <Row>
                  <Col span={12}>
                    {pokemonA.abilities.map((d, idx) => (
                      <p key={idx}>{idx+1}. {d.ability.name}</p>
                    ))}
                  </Col>
                  <Col span={12}>
                    {pokemonB.abilities.map((d, idx) => (
                      <p key={idx}>{idx+1}. {d.ability.name}</p>
                    ))}
                  </Col>
                </Row>
              </Panel>
              <Panel header="Stats" key="3">
                <Row gutter={20}>
                  <Col span={12}>
                    {pokemonA.stats.map((d, idx) => (
                      <div key={idx}>
                        <span>{d.stat.name}</span>
                        <Progress percent={d.base_stat} showInfo={false} />
                      </div>
                    ))}
                  </Col>
                  <Col span={12}>
                    {pokemonB.stats.map((d, idx) => (
                      <div key={idx}>
                        <span>{d.stat.name}</span>
                        <Progress percent={d.base_stat} showInfo={false} />
                      </div>
                    ))}
                  </Col>
                </Row>
              </Panel>
            </Collapse>
          </>
        )}
      </main>
    </>
  );
}

export default Comparison;
